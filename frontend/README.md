# StreetLedger — Frontend Documentation

StreetLedger is a mobile-first, multi-vendor expense and budget platform tailored for street food vendors operating near college campuses.

---

## 1. Quick Start

### Installation
From the `frontend/` directory:
```bash
npm install
```

### Run Locally (Development)
```bash
npm run dev
```
The application will launch at `http://localhost:5173`.

### Production Build
```bash
npm run build
npm run preview
```

---

## 2. Environment Variables

Configure `.env` in the `frontend/` directory (see `.env.example`):

```env
# URL where your FastAPI backend runs
VITE_API_BASE_URL=http://localhost:8000

# Set to true for in-memory mock backend; set to false to connect to the real FastAPI backend
VITE_USE_MOCK=true
```

---

## 3. Switching Between Mock and Real Backend

1. **Mock Mode (`VITE_USE_MOCK=true`)**:
   - Runs completely in-memory with pre-seeded demo vendor data.
   - Requires no backend running.
   - Enforces per-vendor data isolation, real-time budget calculations, category breakdown aggregation, search, filters, and pagination.

2. **Real Backend Mode (`VITE_USE_MOCK=false`)**:
   - Sends real HTTP requests via `Axios` to `http://localhost:8000/api/...`.
   - Attaches `Authorization: Bearer <token>` automatically on every protected endpoint.
   - Handles 401 token invalidation and maps FastAPI 422 validation errors to inline input feedback.

---

## 4. Demo Accounts (Mock Mode)

| Stall Name | Owner | Email | Password | Status / Zone |
| :--- | :--- | :--- | :--- | :--- |
| **Sharma Chaat Corner** | Ramesh Sharma | `sharma.chaat@example.com` | `Vendor@123` | **Warning Alert (82.5% used)** |
| **Annapurna Dosa** | Lakshmi Narayan | `annapurna.dosa@example.com` | `Vendor@123` | **Safe Zone (48% used)** |

*On the `/login` screen in mock mode, clicking either demo button automatically populates credentials.*

---

## 5. API Endpoints Called & Architecture

All API calls are routed through `src/api/*Api.js` and normalized through `src/api/adapters.js`:

| Endpoint | HTTP Method | Frontend Caller File | Description |
| :--- | :--- | :--- | :--- |
| `/api/auth/register` | `POST` | `src/api/authApi.js` | Registers new stall account; logs in on success |
| `/api/auth/login` | `POST` | `src/api/authApi.js` | Authenticates vendor and returns JWT token |
| `/api/auth/me` | `GET` | `src/api/authApi.js` | Restores session on app startup |
| `/api/auth/logout` | `POST` | `src/api/authApi.js` | Invalidation request; token cleared client-side |
| `/api/vendor/profile` | `GET` | `src/api/vendorApi.js` | Fetches authenticated stall profile |
| `/api/vendor/profile` | `PUT` | `src/api/vendorApi.js` | Updates stall details, location, phone |
| `/api/expenses` | `GET` | `src/api/expenseApi.js` | Lists expenses with month, category, search, pagination |
| `/api/expenses` | `POST` | `src/api/expenseApi.js` | Creates daily expense entry |
| `/api/expenses/{id}` | `GET` | `src/api/expenseApi.js` | Fetches single expense record |
| `/api/expenses/{id}` | `PUT` | `src/api/expenseApi.js` | Updates existing expense |
| `/api/expenses/{id}` | `DELETE` | `src/api/expenseApi.js` | Deletes expense by ID |
| `/api/expenses/categories` | `GET` | `src/api/expenseApi.js` | Retrieves vendor spending categories |
| `/api/budget` | `GET` | `src/api/budgetApi.js` | Fetches budget status, spent, remaining, utilization |
| `/api/budget` | `POST` | `src/api/budgetApi.js` | Configures monthly budget and warning/high thresholds |
| `/api/budget/alerts` | `GET` | `src/api/budgetApi.js` | Fetches active alert notifications |
| `/api/analytics/category-wise` | `GET` | `src/api/analyticsApi.js` | Category totals, percentage share, count for Recharts |
| `/api/analytics/monthly-summary` | `GET` | `src/api/analyticsApi.js` | Budget vs spent, daily average, top category |

---

## 6. Defensive Adapter Assumptions (`src/api/adapters.js`)

All responses are normalized defensively to accommodate subtle schema variations in the FastAPI backend:
1. **Tokens**: Accepts `access_token`, `token`, or `accessToken`.
2. **Spent Amounts**: Accepts `total_spent`, `spent`, or `totalSpent`.
3. **Budget Balances**: Accepts `remaining`, `remaining_budget`, or computes `budget - spent`.
4. **Utilization**: Accepts `utilization_pct`, `utilization_percent`, or computes `(spent / budget) * 100`.
5. **List Responses**: Accepts bare array `[...]` or wrapped `{ items: [...], total: ... }` / `{ expenses: [...], total: ... }`.
6. **Data Wrapper**: Accepts top-level `{ data: ... }` or direct payload objects.
7. **Money Units**:
   - `API_AMOUNT_UNIT` (`"rupees"` | `"paise"`) in `src/config/api.js`: controls request unit sent to backend (default: `"rupees"`).
   - `API_RESPONSE_AMOUNT_UNIT` (`"rupees"` | `"paise"`): controls response parsing unit (default: `"rupees"`).
   - UI components always receive and format rupee numbers.

---

## 7. Integration Checklist (Connecting to Real FastAPI Backend)

When you are ready to connect to the real backend:
1. Ensure your backend is running at `http://localhost:8000` (FastAPI Swagger docs at `http://localhost:8000/docs`).
2. Verify CORS in `backend/.env`:
   ```env
   CORS_ORIGINS=http://localhost:5173,http://localhost:3000,http://127.0.0.1:5173
   ```
3. Set in `frontend/.env`:
   ```env
   VITE_API_BASE_URL=http://localhost:8000
   VITE_USE_MOCK=false
   ```
4. If your backend exclusively returns/expects paise in integers, adjust `API_AMOUNT_UNIT = 'paise'` and `API_RESPONSE_AMOUNT_UNIT = 'paise'` in `src/config/api.js`.
5. Restart Vite dev server:
   ```bash
   npm run dev
   ```
