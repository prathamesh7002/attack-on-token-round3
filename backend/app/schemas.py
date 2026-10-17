
import datetime
import re
from typing import Optional, List
from pydantic import BaseModel, Field, field_validator

EMAIL_REGEX = r"^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$"

# Predefined Food Vendor Spending Categories
STANDARD_CATEGORIES = [
    "Ingredients and raw materials",
    "Vegetables and fruits",
    "Cooking oil and spices",
    "LPG and fuel",
    "Packaging materials",
    "Transportation",
    "Stall rent and maintenance",
    "Cleaning supplies",
    "Equipment and repairs",
    "Miscellaneous"
]

# ----------------- Auth & User Schemas -----------------

class UserRegister(BaseModel):
    vendor_name: str = Field(..., min_length=2, max_length=150, description="Business or stall name")
    owner_name: str = Field(..., min_length=2, max_length=150, description="Owner's full name")
    email: str = Field(..., description="Unique login email")
    password: str = Field(..., min_length=6, max_length=100, description="Password")
    confirm_password: str = Field(..., min_length=6, max_length=100, description="Confirm password")
    phone: Optional[str] = Field(None, max_length=30)
    stall_type: Optional[str] = Field("General Street Food", max_length=100)
    location: Optional[str] = Field(None, max_length=255)

    @field_validator("email")
    def validate_email(cls, v):
        email_clean = v.strip().lower()
        if not re.match(EMAIL_REGEX, email_clean):
            raise ValueError("Invalid email format. Please enter a valid email address.")
        return email_clean

    @field_validator("confirm_password")
    def passwords_match(cls, v, values):
        if "password" in values.data and v != values.data["password"]:
            raise ValueError("Passwords do not match")
        return v


class UserLogin(BaseModel):
    email: str
    password: str

    @field_validator("email")
    def validate_email(cls, v):
        email_clean = v.strip().lower()
        if not re.match(EMAIL_REGEX, email_clean):
            raise ValueError("Invalid email format.")
        return email_clean


class VendorProfileResponse(BaseModel):
    id: int
    user_id: int
    stall_name: str
    stall_type: str
    location: Optional[str] = None
    updated_at: datetime.datetime

    class Config:
        from_attributes = True


class VendorProfileUpdate(BaseModel):
    stall_name: Optional[str] = Field(None, min_length=2, max_length=150)
    owner_name: Optional[str] = Field(None, min_length=2, max_length=150)
    stall_type: Optional[str] = Field(None, max_length=100)
    location: Optional[str] = Field(None, max_length=255)
    phone: Optional[str] = Field(None, max_length=30)


class UserResponse(BaseModel):
    id: int
    vendor_name: str
    owner_name: str
    email: str
    phone: Optional[str] = None
    created_at: datetime.datetime
    profile: Optional[VendorProfileResponse] = None

    class Config:
        from_attributes = True


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


# ----------------- Expense Schemas -----------------

class ExpenseBase(BaseModel):
    description: str = Field(..., min_length=1, max_length=255)
    amount: float = Field(..., gt=0, description="Amount in INR (e.g. 150.50)")
    category: str = Field(..., description="Expense category")
    expense_date: datetime.date = Field(default_factory=datetime.date.today)
    notes: Optional[str] = None


class ExpenseCreate(ExpenseBase):
    pass


class ExpenseUpdate(BaseModel):
    description: Optional[str] = Field(None, min_length=1, max_length=255)
    amount: Optional[float] = Field(None, gt=0)
    category: Optional[str] = None
    expense_date: Optional[datetime.date] = None
    notes: Optional[str] = None


class ExpenseResponse(BaseModel):
    id: int
    user_id: int
    description: str
    amount_paise: int
    amount_inr: float
    category: str
    expense_date: datetime.date
    notes: Optional[str] = None
    created_at: datetime.datetime
    updated_at: datetime.datetime

    class Config:
        from_attributes = True


class ExpenseListResponse(BaseModel):
    total: int
    expenses: List[ExpenseResponse]


# ----------------- Budget & Alert Schemas -----------------

class BudgetCreateUpdate(BaseModel):
    month: str = Field(..., pattern=r"^\d{4}-(0[1-9]|1[0-2])$", description="Month in YYYY-MM format")
    budget_amount: float = Field(..., gt=0, description="Budget amount in INR")
    warning_threshold_pct: Optional[float] = Field(80.0, ge=1.0, le=99.0, description="Warning threshold percentage")
    high_spending_threshold_pct: Optional[float] = Field(90.0, ge=1.0, le=100.0, description="High spending threshold percentage")

    @field_validator("high_spending_threshold_pct")
    def threshold_order(cls, v, values):
        warn = values.data.get("warning_threshold_pct", 80.0)
        if warn is not None and v <= warn:
            raise ValueError("High spending threshold must be greater than warning threshold")
        return v


class BudgetStatusResponse(BaseModel):
    id: Optional[int] = None
    month: str
    budget_amount_paise: int
    budget_amount_inr: float
    warning_threshold_pct: float
    high_spending_threshold_pct: float
    total_expenses_paise: int
    total_expenses_inr: float
    remaining_budget_paise: int
    remaining_budget_inr: float
    utilization_pct: float
    alert_status: str  # "none", "safe", "warning", "high_spending", "overspent"
    alert_message: str


# ----------------- Analytics Schemas -----------------

class CategoryBreakdownItem(BaseModel):
    category: str
    total_paise: int
    total_inr: float
    percentage: float
    count: int


class CategoryWiseAnalyticsResponse(BaseModel):
    month: str
    total_spending_inr: float
    total_spending_paise: int
    categories: List[CategoryBreakdownItem]


class MonthlySummaryResponse(BaseModel):
    month: str
    budget_inr: float
    spent_inr: float
    remaining_inr: float
    utilization_pct: float
    daily_avg_inr: float
    top_category: Optional[str] = None
    alert_status: str
