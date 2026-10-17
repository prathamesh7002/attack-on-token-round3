import datetime
from sqlalchemy import (
    Column,
    Integer,
    String,
    Text,
    Float,
    Date,
    DateTime,
    ForeignKey,
    UniqueConstraint
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from .database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    vendor_name = Column(String(150), nullable=False)
    owner_name = Column(String(150), nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    phone = Column(String(30), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    # Relationships
    profile = relationship("VendorProfile", back_populates="user", uselist=False, cascade="all, delete-orphan")
    expenses = relationship("Expense", back_populates="user", cascade="all, delete-orphan")
    budgets = relationship("MonthlyBudget", back_populates="user", cascade="all, delete-orphan")


class VendorProfile(Base):
    __tablename__ = "vendor_profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    stall_name = Column(String(150), nullable=False)
    stall_type = Column(String(100), nullable=False, default="General Street Food")
    location = Column(String(255), nullable=True)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    # Relationships
    user = relationship("User", back_populates="profile")


class Expense(Base):
    __tablename__ = "expenses"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False)
    description = Column(String(255), nullable=False)
    amount_paise = Column(Integer, nullable=False)  # Stored in integer paise (₹1 = 100 paise)
    category = Column(String(100), nullable=False, index=True)
    expense_date = Column(Date, nullable=False, index=True)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    # Relationships
    user = relationship("User", back_populates="expenses")


class MonthlyBudget(Base):
    __tablename__ = "monthly_budgets"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False)
    month = Column(String(7), nullable=False, index=True)  # Format: "YYYY-MM"
    budget_amount_paise = Column(Integer, nullable=False)  # Stored in integer paise
    warning_threshold_pct = Column(Float, nullable=False, default=80.0)
    high_spending_threshold_pct = Column(Float, nullable=False, default=90.0)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    # Ensure a vendor has only one budget per month
    __table_args__ = (
        UniqueConstraint("user_id", "month", name="uq_vendor_month_budget"),
    )

    # Relationships
    user = relationship("User", back_populates="budgets")
