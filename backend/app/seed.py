import datetime
from .database import SessionLocal, init_db
from . import models
from .auth import hash_password

def seed_demo_data():
    """
    Seeds initial demo vendors, budgets, and realistic street food expenses.
    Safe to run repeatedly; checks existing emails first.
    """
    init_db()
    db = SessionLocal()
    try:
        current_month = datetime.date.today().strftime("%Y-%m")
        today = datetime.date.today()

        # Vendor 1: Sharma Ji Chaat
        v1_email = "sharma.chaat@example.com"
        v1 = db.query(models.User).filter(models.User.email == v1_email).first()
        if not v1:
            v1 = models.User(
                vendor_name="Sharma Ji Chaat & Snacks",
                owner_name="Ramesh Sharma",
                email=v1_email,
                password_hash=hash_password("Vendor@123"),
                phone="+91 98765 43210"
            )
            db.add(v1)
            db.flush()

            v1_profile = models.VendorProfile(
                user_id=v1.id,
                stall_name="Sharma Ji Chaat & Snacks",
                stall_type="Chaat & Street Snacks",
                location="North Campus Gate No. 2"
            )
            db.add(v1_profile)

            # Monthly budget: ₹40,000 (4,000,000 paise)
            v1_budget = models.MonthlyBudget(
                user_id=v1.id,
                month=current_month,
                budget_amount_paise=4000000,
                warning_threshold_pct=80.0,
                high_spending_threshold_pct=90.0
            )
            db.add(v1_budget)

            # Sample expenses for Sharma Ji
            sample_expenses_v1 = [
                ("Potatoes and peas for Aloo Tikki", 280000, "Vegetables and fruits", today - datetime.timedelta(days=1)),
                ("Refined sunflower cooking oil 15L tin", 195000, "Cooking oil and spices", today - datetime.timedelta(days=2)),
                ("Commercial LPG 19kg cylinder refill", 185000, "LPG and fuel", today - datetime.timedelta(days=3)),
                ("Biodegradable paper plates & wooden spoons", 92000, "Packaging materials", today - datetime.timedelta(days=4)),
                ("Chaat masala, cumin, rock salt & amchur", 65000, "Cooking oil and spices", today - datetime.timedelta(days=5)),
                ("Fresh curd & milk batch from dairy", 140000, "Ingredients and raw materials", today),
                ("Tamarind, green chillies & fresh mint leaves", 45000, "Vegetables and fruits", today),
                ("Monthly street cart municipality maintenance", 150000, "Stall rent and maintenance", today - datetime.timedelta(days=6)),
                ("Food-grade cleaning sanitizers & wipes", 38000, "Cleaning supplies", today - datetime.timedelta(days=7)),
            ]
            for desc, paise, cat, exp_date in sample_expenses_v1:
                db.add(models.Expense(
                    user_id=v1.id,
                    description=desc,
                    amount_paise=paise,
                    category=cat,
                    expense_date=exp_date
                ))

        # Vendor 2: Annapurna South Indian Tiffin
        v2_email = "annapurna.dosa@example.com"
        v2 = db.query(models.User).filter(models.User.email == v2_email).first()
        if not v2:
            v2 = models.User(
                vendor_name="Annapurna South Indian Tiffin",
                owner_name="K. Venkatesh",
                email=v2_email,
                password_hash=hash_password("Vendor@123"),
                phone="+91 98111 22334"
            )
            db.add(v2)
            db.flush()

            v2_profile = models.VendorProfile(
                user_id=v2.id,
                stall_name="Annapurna South Indian Tiffin",
                stall_type="South Indian Tiffin",
                location="Science Block Canteen Lane"
            )
            db.add(v2_profile)

            # Monthly budget: ₹50,000 (5,000,000 paise)
            v2_budget = models.MonthlyBudget(
                user_id=v2.id,
                month=current_month,
                budget_amount_paise=5000000,
                warning_threshold_pct=80.0,
                high_spending_threshold_pct=90.0
            )
            db.add(v2_budget)

            sample_expenses_v2 = [
                ("Idli rice 25kg & premium urad dal 10kg", 340000, "Ingredients and raw materials", today - datetime.timedelta(days=1)),
                ("Sambar shallots, tomatoes & fresh drumsticks", 125000, "Vegetables and fruits", today - datetime.timedelta(days=2)),
                ("Coconuts crate for morning fresh chutney", 110000, "Vegetables and fruits", today - datetime.timedelta(days=3)),
                ("Pure sesame oil & cooking ghee jars", 240000, "Cooking oil and spices", today - datetime.timedelta(days=4)),
                ("Heavy duty cast iron dosa tawa resurfacing", 85000, "Equipment and repairs", today - datetime.timedelta(days=5)),
                ("Parcel foil rolls and banana leaf wrapping", 75000, "Packaging materials", today),
            ]
            for desc, paise, cat, exp_date in sample_expenses_v2:
                db.add(models.Expense(
                    user_id=v2.id,
                    description=desc,
                    amount_paise=paise,
                    category=cat,
                    expense_date=exp_date
                ))

        db.commit()
        print("Demo vendors, budgets, and sample expenses seeded successfully.")
    except Exception as e:
        db.rollback()
        print(f"Error seeding demo data: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    seed_demo_data()
