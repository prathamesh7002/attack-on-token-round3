import datetime
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import func, extract

from ..database import get_db
from .. import models, schemas
from ..auth import get_current_user

router = APIRouter(prefix="/api/budget", tags=["Monthly Budget & Alerts"])

def compute_budget_status(
    budget_record: Optional[models.MonthlyBudget],
    target_month: str,
    total_spent_paise: int
) -> dict:
    """
    Compute budget details, remaining amount, utilization %, and active alert status.
    """
    total_spent_inr = round(total_spent_paise / 100.0, 2)

    if not budget_record:
        # No budget configured yet for this month
        return {
            "id": None,
            "month": target_month,
            "budget_amount_paise": 0,
            "budget_amount_inr": 0.0,
            "warning_threshold_pct": 80.0,
            "high_spending_threshold_pct": 90.0,
            "total_expenses_paise": total_spent_paise,
            "total_expenses_inr": total_spent_inr,
            "remaining_budget_paise": -total_spent_paise,
            "remaining_budget_inr": -total_spent_inr,
            "utilization_pct": 0.0,
            "alert_status": "none",
            "alert_message": "No budget set for this month. Set a budget to track spending limits."
        }

    budget_paise = budget_record.budget_amount_paise
    budget_inr = round(budget_paise / 100.0, 2)
    remaining_paise = budget_paise - total_spent_paise
    remaining_inr = round(remaining_paise / 100.0, 2)

    utilization_pct = round((total_spent_paise / budget_paise) * 100.0, 1) if budget_paise > 0 else 0.0

    warn_pct = budget_record.warning_threshold_pct
    high_pct = budget_record.high_spending_threshold_pct

    # Determine alert status
    if utilization_pct >= 100.0:
        alert_status = "overspent"
        over_inr = abs(remaining_inr)
        alert_message = f"Budget Exceeded! You have exceeded your monthly limit by ₹{over_inr:,.2f} ({utilization_pct}% spent)."
    elif utilization_pct >= high_pct:
        alert_status = "high_spending"
        alert_message = f"High Spending Alert: You have used {utilization_pct}% of your budget (threshold {high_pct}% reached)."
    elif utilization_pct >= warn_pct:
        alert_status = "warning"
        alert_message = f"Budget Warning: Spending has reached {utilization_pct}% of your monthly limit."
    else:
        alert_status = "safe"
        alert_message = f"Spending is within healthy limits ({utilization_pct}% utilized)."

    return {
        "id": budget_record.id,
        "month": target_month,
        "budget_amount_paise": budget_paise,
        "budget_amount_inr": budget_inr,
        "warning_threshold_pct": warn_pct,
        "high_spending_threshold_pct": high_pct,
        "total_expenses_paise": total_spent_paise,
        "total_expenses_inr": total_spent_inr,
        "remaining_budget_paise": remaining_paise,
        "remaining_budget_inr": remaining_inr,
        "utilization_pct": utilization_pct,
        "alert_status": alert_status,
        "alert_message": alert_message
    }


@router.get("", response_model=schemas.BudgetStatusResponse)
def get_monthly_budget(
    month: Optional[str] = Query(None, pattern=r"^\d{4}-(0[1-9]|1[0-2])$", description="Month YYYY-MM"),
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get monthly budget status, spending calculation, and threshold alert for the authenticated vendor.
    """
    target_month = month or datetime.date.today().strftime("%Y-%m")
    year_str, month_str = target_month.split("-")

    # Fetch configured budget
    budget_record = db.query(models.MonthlyBudget).filter(
        models.MonthlyBudget.user_id == current_user.id,
        models.MonthlyBudget.month == target_month
    ).first()

    # Calculate total spent in target month
    spent_result = db.query(
        func.coalesce(func.sum(models.Expense.amount_paise), 0)
    ).filter(
        models.Expense.user_id == current_user.id,
        extract("year", models.Expense.expense_date) == int(year_str),
        extract("month", models.Expense.expense_date) == int(month_str)
    ).scalar()

    return compute_budget_status(budget_record, target_month, int(spent_result or 0))


@router.post("", response_model=schemas.BudgetStatusResponse)
def set_or_update_monthly_budget(
    payload: schemas.BudgetCreateUpdate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Configure or update monthly budget and threshold percentages for the specified month.
    """
    budget_paise = int(round(payload.budget_amount * 100))
    if budget_paise <= 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Monthly budget must be greater than zero."
        )

    # Check if budget already exists for this vendor and month
    budget_record = db.query(models.MonthlyBudget).filter(
        models.MonthlyBudget.user_id == current_user.id,
        models.MonthlyBudget.month == payload.month
    ).first()

    if budget_record:
        budget_record.budget_amount_paise = budget_paise
        if payload.warning_threshold_pct is not None:
            budget_record.warning_threshold_pct = payload.warning_threshold_pct
        if payload.high_spending_threshold_pct is not None:
            budget_record.high_spending_threshold_pct = payload.high_spending_threshold_pct
    else:
        budget_record = models.MonthlyBudget(
            user_id=current_user.id,
            month=payload.month,
            budget_amount_paise=budget_paise,
            warning_threshold_pct=payload.warning_threshold_pct or 80.0,
            high_spending_threshold_pct=payload.high_spending_threshold_pct or 90.0
        )
        db.add(budget_record)

    db.commit()
    db.refresh(budget_record)

    # Recalculate spending
    year_str, month_str = payload.month.split("-")
    spent_result = db.query(
        func.coalesce(func.sum(models.Expense.amount_paise), 0)
    ).filter(
        models.Expense.user_id == current_user.id,
        extract("year", models.Expense.expense_date) == int(year_str),
        extract("month", models.Expense.expense_date) == int(month_str)
    ).scalar()

    return compute_budget_status(budget_record, payload.month, int(spent_result or 0))


@router.get("/alerts")
def get_budget_alerts(
    month: Optional[str] = Query(None, pattern=r"^\d{4}-(0[1-9]|1[0-2])$"),
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Fetch active alerts for the vendor's selected month.
    """
    target_month = month or datetime.date.today().strftime("%Y-%m")
    status_data = get_monthly_budget(target_month, current_user, db)
    return {
        "month": target_month,
        "alert_status": status_data["alert_status"],
        "alert_message": status_data["alert_message"],
        "utilization_pct": status_data["utilization_pct"],
        "remaining_budget_inr": status_data["remaining_budget_inr"]
    }
