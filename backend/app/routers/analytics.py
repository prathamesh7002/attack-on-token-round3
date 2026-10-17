import datetime
from typing import Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, extract, desc

from ..database import get_db
from .. import models, schemas
from ..auth import get_current_user

router = APIRouter(prefix="/api/analytics", tags=["Spending Analytics"])

@router.get("/category-wise", response_model=schemas.CategoryWiseAnalyticsResponse)
def get_category_wise_spending(
    month: Optional[str] = Query(None, pattern=r"^\d{4}-(0[1-9]|1[0-2])$"),
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Compute aggregated category-wise spending breakdown for Recharts visualizations.
    Calculates exact totals in INR and percentage shares.
    Strictly filters by authenticated vendor user_id.
    """
    target_month = month or datetime.date.today().strftime("%Y-%m")
    year_str, month_str = target_month.split("-")

    # Group by category
    query_results = db.query(
        models.Expense.category,
        func.sum(models.Expense.amount_paise).label("total_paise"),
        func.count(models.Expense.id).label("item_count")
    ).filter(
        models.Expense.user_id == current_user.id,
        extract("year", models.Expense.expense_date) == int(year_str),
        extract("month", models.Expense.expense_date) == int(month_str)
    ).group_by(models.Expense.category).order_by(desc("total_paise")).all()

    total_month_paise = sum(row.total_paise for row in query_results)
    total_month_inr = round(total_month_paise / 100.0, 2)

    breakdown = []
    for row in query_results:
        cat_paise = int(row.total_paise)
        cat_inr = round(cat_paise / 100.0, 2)
        pct = round((cat_paise / total_month_paise) * 100.0, 1) if total_month_paise > 0 else 0.0
        breakdown.append({
            "category": row.category,
            "total_paise": cat_paise,
            "total_inr": cat_inr,
            "percentage": pct,
            "count": row.item_count
        })

    return {
        "month": target_month,
        "total_spending_inr": total_month_inr,
        "total_spending_paise": total_month_paise,
        "categories": breakdown
    }


@router.get("/monthly-summary", response_model=schemas.MonthlySummaryResponse)
def get_monthly_summary(
    month: Optional[str] = Query(None, pattern=r"^\d{4}-(0[1-9]|1[0-2])$"),
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Return high-level monthly performance metrics:
    budget, total spent, remaining, utilization %, daily average, top spending category.
    """
    target_month = month or datetime.date.today().strftime("%Y-%m")
    year_str, month_str = target_month.split("-")
    year_int, month_int = int(year_str), int(month_str)

    # Budget
    budget_record = db.query(models.MonthlyBudget).filter(
        models.MonthlyBudget.user_id == current_user.id,
        models.MonthlyBudget.month == target_month
    ).first()

    budget_inr = round(budget_record.budget_amount_paise / 100.0, 2) if budget_record else 0.0

    # Total spent
    spent_paise = db.query(
        func.coalesce(func.sum(models.Expense.amount_paise), 0)
    ).filter(
        models.Expense.user_id == current_user.id,
        extract("year", models.Expense.expense_date) == year_int,
        extract("month", models.Expense.expense_date) == month_int
    ).scalar() or 0

    spent_inr = round(int(spent_paise) / 100.0, 2)
    remaining_inr = round(budget_inr - spent_inr, 2) if budget_inr > 0 else -spent_inr
    utilization_pct = round((spent_inr / budget_inr) * 100.0, 1) if budget_inr > 0 else 0.0

    # Top spending category
    top_cat_row = db.query(
        models.Expense.category
    ).filter(
        models.Expense.user_id == current_user.id,
        extract("year", models.Expense.expense_date) == year_int,
        extract("month", models.Expense.expense_date) == month_int
    ).group_by(models.Expense.category).order_by(desc(func.sum(models.Expense.amount_paise))).first()

    top_category = top_cat_row[0] if top_cat_row else None

    # Daily average calculation: days elapsed in month
    today = datetime.date.today()
    if today.year == year_int and today.month == month_int:
        days_count = max(today.day, 1)
    else:
        # approximate days in month
        import calendar
        _, days_count = calendar.monthrange(year_int, month_int)

    daily_avg_inr = round(spent_inr / days_count, 2)

    # Alert status
    if not budget_record:
        alert_status = "none"
    elif utilization_pct >= 100.0:
        alert_status = "overspent"
    elif utilization_pct >= budget_record.high_spending_threshold_pct:
        alert_status = "high_spending"
    elif utilization_pct >= budget_record.warning_threshold_pct:
        alert_status = "warning"
    else:
        alert_status = "safe"

    return {
        "month": target_month,
        "budget_inr": budget_inr,
        "spent_inr": spent_inr,
        "remaining_inr": remaining_inr,
        "utilization_pct": utilization_pct,
        "daily_avg_inr": daily_avg_inr,
        "top_category": top_category,
        "alert_status": alert_status
    }
