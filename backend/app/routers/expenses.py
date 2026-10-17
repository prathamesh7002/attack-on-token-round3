import datetime
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import extract, desc

from ..database import get_db
from .. import models, schemas
from ..auth import get_current_user

router = APIRouter(prefix="/api/expenses", tags=["Expenses"])

def format_expense_response(exp: models.Expense) -> dict:
    """Format an Expense model instance into a response dictionary with INR conversion."""
    return {
        "id": exp.id,
        "user_id": exp.user_id,
        "description": exp.description,
        "amount_paise": exp.amount_paise,
        "amount_inr": round(exp.amount_paise / 100.0, 2),
        "category": exp.category,
        "expense_date": exp.expense_date,
        "notes": exp.notes,
        "created_at": exp.created_at,
        "updated_at": exp.updated_at,
    }


@router.get("/categories", response_model=List[str])
def get_categories():
    """
    Return standard food vendor expense categories.
    """
    return schemas.STANDARD_CATEGORIES


@router.get("", response_model=schemas.ExpenseListResponse)
def list_expenses(
    month: Optional[str] = Query(None, pattern=r"^\d{4}-(0[1-9]|1[0-2])$", description="Filter by month YYYY-MM"),
    category: Optional[str] = Query(None, description="Filter by category"),
    search: Optional[str] = Query(None, description="Search description or notes"),
    limit: int = Query(50, ge=1, le=500),
    offset: int = Query(0, ge=0),
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    List expenses for the authenticated vendor with optional month/category/search filters.
    Strictly filtered by current_user.id.
    """
    query = db.query(models.Expense).filter(models.Expense.user_id == current_user.id)

    if month:
        year_str, month_str = month.split("-")
        query = query.filter(
            extract("year", models.Expense.expense_date) == int(year_str),
            extract("month", models.Expense.expense_date) == int(month_str)
        )

    if category:
        query = query.filter(models.Expense.category == category)

    if search:
        search_pattern = f"%{search.strip()}%"
        query = query.filter(
            (models.Expense.description.ilike(search_pattern)) |
            (models.Expense.notes.ilike(search_pattern))
        )

    total_count = query.count()
    expenses = query.order_by(desc(models.Expense.expense_date), desc(models.Expense.id)).offset(offset).limit(limit).all()

    return {
        "total": total_count,
        "expenses": [format_expense_response(exp) for exp in expenses]
    }


@router.post("", response_model=schemas.ExpenseResponse, status_code=status.HTTP_201_CREATED)
def create_expense(
    payload: schemas.ExpenseCreate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Create a new expense entry for the authenticated vendor.
    Amounts in INR are converted to integer paise to ensure zero floating-point loss.
    """
    # Convert INR to integer paise (e.g., 150.50 -> 15050 paise)
    amount_paise = int(round(payload.amount * 100))
    if amount_paise <= 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Expense amount must be greater than zero."
        )

    new_expense = models.Expense(
        user_id=current_user.id,
        description=payload.description.strip(),
        amount_paise=amount_paise,
        category=payload.category.strip(),
        expense_date=payload.expense_date or datetime.date.today(),
        notes=payload.notes.strip() if payload.notes else None
    )
    db.add(new_expense)
    db.commit()
    db.refresh(new_expense)

    return format_expense_response(new_expense)


@router.get("/{expense_id}", response_model=schemas.ExpenseResponse)
def get_expense(
    expense_id: int,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Fetch a single expense by ID, strictly enforcing vendor ownership.
    """
    expense = db.query(models.Expense).filter(
        models.Expense.id == expense_id,
        models.Expense.user_id == current_user.id
    ).first()

    if not expense:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Expense record not found."
        )

    return format_expense_response(expense)


@router.put("/{expense_id}", response_model=schemas.ExpenseResponse)
def update_expense(
    expense_id: int,
    payload: schemas.ExpenseUpdate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Update an existing expense, strictly verifying vendor ownership.
    """
    expense = db.query(models.Expense).filter(
        models.Expense.id == expense_id,
        models.Expense.user_id == current_user.id
    ).first()

    if not expense:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Expense record not found or access denied."
        )

    if payload.description is not None:
        expense.description = payload.description.strip()
    if payload.amount is not None:
        amount_paise = int(round(payload.amount * 100))
        if amount_paise <= 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Expense amount must be greater than zero."
            )
        expense.amount_paise = amount_paise
    if payload.category is not None:
        expense.category = payload.category.strip()
    if payload.expense_date is not None:
        expense.expense_date = payload.expense_date
    if payload.notes is not None:
        expense.notes = payload.notes.strip() if payload.notes else None

    db.commit()
    db.refresh(expense)
    return format_expense_response(expense)


@router.delete("/{expense_id}", status_code=status.HTTP_200_OK)
def delete_expense(
    expense_id: int,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Delete an expense record, strictly verifying vendor ownership.
    """
    expense = db.query(models.Expense).filter(
        models.Expense.id == expense_id,
        models.Expense.user_id == current_user.id
    ).first()

    if not expense:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Expense record not found or access denied."
        )

    db.delete(expense)
    db.commit()
    return {"message": "Expense deleted successfully", "deleted_id": expense_id}
