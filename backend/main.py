from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import CORS_ORIGINS, ENVIRONMENT
from app.database import init_db
from app.seed import seed_demo_data
from app.routers import auth, vendor, expenses, budget, analytics

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize database tables
    init_db()
    # Seed demo data for testing
    seed_demo_data()
    yield

app = FastAPI(
    title="StreetLedger API",
    description="Multi-vendor street food expense and budget management API",
    version="1.0.0",
    lifespan=lifespan
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register API Routers
app.include_router(auth.router)
app.include_router(vendor.router)
app.include_router(expenses.router)
app.include_router(budget.router)
app.include_router(analytics.router)

@app.get("/")
def root():
    return {
        "app": "StreetLedger API",
        "version": "1.0.0",
        "environment": ENVIRONMENT,
        "docs_url": "/docs",
        "status": "online"
    }

@app.get("/api/health")
def health_check():
    return {"status": "ok", "service": "streetledger-backend"}

if __name__ == "__main__":
    import uvicorn
    from app.config import HOST, PORT
    uvicorn.run("main:app", host=HOST, port=PORT, reload=True)
