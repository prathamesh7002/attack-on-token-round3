import datetime
from starlette.testclient import TestClient
from main import app

from app.database import init_db
from app.seed import seed_demo_data

def test_full_platform():
    init_db()
    seed_demo_data()
    client = TestClient(app)
    print("=== STARTING STREETLEDGER TEST SUITE ===")

    # 1. Healthcheck
    res = client.get("/api/health")
    assert res.status_code == 200, f"Health check failed: {res.text}"
    print("[PASS] Healthcheck passed")

    # 2. Login Vendor 1 (Sharma Ji Chaat)
    res = client.post("/api/auth/login", json={
        "email": "sharma.chaat@example.com",
        "password": "Vendor@123"
    })
    assert res.status_code == 200, f"Vendor 1 login failed: {res.text}"
    v1_data = res.json()
    v1_token = v1_data["access_token"]
    v1_headers = {"Authorization": f"Bearer {v1_token}"}
    print(f"[PASS] Vendor 1 logged in successfully (User ID: {v1_data['user']['id']})")

    # 3. Login Vendor 2 (Annapurna Dosa)
    res = client.post("/api/auth/login", json={
        "email": "annapurna.dosa@example.com",
        "password": "Vendor@123"
    })
    assert res.status_code == 200, f"Vendor 2 login failed: {res.text}"
    v2_data = res.json()
    v2_token = v2_data["access_token"]
    v2_headers = {"Authorization": f"Bearer {v2_token}"}
    print(f"[PASS] Vendor 2 logged in successfully (User ID: {v2_data['user']['id']})")

    # 4. Verify Vendor 1 Profile
    res = client.get("/api/vendor/profile", headers=v1_headers)
    assert res.status_code == 200
    assert res.json()["vendor_name"] == "Sharma Ji Chaat & Snacks"
    print("[PASS] Vendor 1 profile verified")

    # 5. List Categories
    res = client.get("/api/expenses/categories")
    assert res.status_code == 200
    categories = res.json()
    assert "Vegetables and fruits" in categories
    assert len(categories) == 10
    print(f"[PASS] Standard categories verified ({len(categories)} categories)")

    # 6. Vendor 1 records a new daily expense
    res = client.post("/api/expenses", headers=v1_headers, json={
        "description": "Mint & coriander fresh bunch",
        "amount": 250.50,
        "category": "Vegetables and fruits",
        "expense_date": str(datetime.date.today()),
        "notes": "Morning mandi purchase"
    })
    assert res.status_code == 201, f"Create expense failed: {res.text}"
    new_expense = res.json()
    new_expense_id = new_expense["id"]
    assert new_expense["amount_paise"] == 25050
    assert new_expense["amount_inr"] == 250.50
    print(f"[PASS] Expense created with integer paise precision (ID: {new_expense_id}, Rs 250.50 -> {new_expense['amount_paise']} paise)")

    # 7. CRITICAL TEST: Vendor Data Isolation
    # Vendor 2 attempts to fetch Vendor 1's expense
    res = client.get(f"/api/expenses/{new_expense_id}", headers=v2_headers)
    assert res.status_code == 404, f"Data isolation breach! Vendor 2 accessed Vendor 1 expense: {res.status_code}"
    print("[PASS] DATA ISOLATION VERIFIED: Vendor 2 cannot access Vendor 1 expense (returned 404)")

    # Vendor 2 attempts to modify Vendor 1's expense
    res = client.put(f"/api/expenses/{new_expense_id}", headers=v2_headers, json={
        "description": "Tampered description"
    })
    assert res.status_code == 404, "Data isolation breach! Vendor 2 modified Vendor 1 expense"
    print("[PASS] DATA ISOLATION VERIFIED: Vendor 2 cannot modify Vendor 1 expense (returned 404)")

    # Vendor 2 attempts to delete Vendor 1's expense
    res = client.delete(f"/api/expenses/{new_expense_id}", headers=v2_headers)
    assert res.status_code == 404, "Data isolation breach! Vendor 2 deleted Vendor 1 expense"
    print("[PASS] DATA ISOLATION VERIFIED: Vendor 2 cannot delete Vendor 1 expense (returned 404)")

    # 8. Unauthenticated requests are rejected
    res = client.get("/api/expenses")
    assert res.status_code == 401, f"Unauthenticated request should return 401, got {res.status_code}"
    print("[PASS] UNAUTHENTICATED REQUEST REJECTED: Protected route returned 401")

    # 9. Vendor 1 updates their expense
    res = client.put(f"/api/expenses/{new_expense_id}", headers=v1_headers, json={
        "description": "Mint & coriander organic bunch",
        "amount": 260.00
    })
    assert res.status_code == 200
    assert res.json()["amount_paise"] == 26000
    print("[PASS] Vendor 1 updated own expense successfully")

    # 10. Test Monthly Budget & Threshold Alerts
    current_month = datetime.date.today().strftime("%Y-%m")
    res = client.get(f"/api/budget?month={current_month}", headers=v1_headers)
    assert res.status_code == 200
    budget_data = res.json()
    assert budget_data["budget_amount_inr"] > 0
    assert budget_data["total_expenses_inr"] > 0
    assert budget_data["remaining_budget_inr"] == round(budget_data["budget_amount_inr"] - budget_data["total_expenses_inr"], 2)
    print(f"[PASS] Monthly Budget calculation verified: Budget=Rs {budget_data['budget_amount_inr']}, Spent=Rs {budget_data['total_expenses_inr']}, Remaining=Rs {budget_data['remaining_budget_inr']}, Utilization={budget_data['utilization_pct']}%, Status={budget_data['alert_status']}")

    # 11. Test Category-wise Analytics for Recharts
    res = client.get(f"/api/analytics/category-wise?month={current_month}", headers=v1_headers)
    assert res.status_code == 200
    analytics_data = res.json()
    assert len(analytics_data["categories"]) > 0
    total_pct = sum(c["percentage"] for c in analytics_data["categories"])
    assert round(total_pct) in [99, 100, 101], f"Percentage sum should be ~100%, got {total_pct}"
    print(f"[PASS] Analytics verified: {len(analytics_data['categories'])} categories breakdown returned for charts")

    # 12. Test Register new vendor & prevent duplicate
    test_email = f"test.vendor.{int(datetime.datetime.now().timestamp())}@example.com"
    res = client.post("/api/auth/register", json={
        "vendor_name": "Rolls & Momos Hub",
        "owner_name": "Arjun Singh",
        "email": test_email,
        "password": "Password@123",
        "confirm_password": "Password@123",
        "phone": "+91 9988776655",
        "stall_type": "Fast Food & Rolls"
    })
    assert res.status_code == 201, f"Registration failed: {res.text}"
    new_reg = res.json()
    assert "access_token" in new_reg
    assert new_reg["user"]["email"] == test_email
    print(f"[PASS] New vendor registered and authenticated: {test_email}")

    # Duplicate registration check
    res_dup = client.post("/api/auth/register", json={
        "vendor_name": "Duplicate Hub",
        "owner_name": "Arjun Singh",
        "email": test_email,
        "password": "Password@123",
        "confirm_password": "Password@123"
    })
    assert res_dup.status_code == 400, "Duplicate account was allowed!"
    print("[PASS] Duplicate account registration properly rejected with 400")

    # Clean up test expense
    res = client.delete(f"/api/expenses/{new_expense_id}", headers=v1_headers)
    assert res.status_code == 200
    print("[PASS] Test expense cleaned up")

    print("\n[SUCCESS] ALL TESTS PASSED! Backend, database, auth, data isolation, and features are 100% operational.")

if __name__ == "__main__":
    test_full_platform()
