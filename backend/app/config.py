import os
from pathlib import Path
from dotenv import load_dotenv

# Base directory of the backend
BASE_DIR = Path(__file__).resolve().parent.parent

# Load .env file
load_dotenv(BASE_DIR / ".env")

# Server Config
PORT = int(os.getenv("PORT", "8000"))
HOST = os.getenv("HOST", "0.0.0.0")
ENVIRONMENT = os.getenv("ENVIRONMENT", "development")

# Security & JWT
SECRET_KEY = os.getenv("SECRET_KEY", "streetledger_dev_jwt_secret_key_2026_super_secure_983421")
ALGORITHM = os.getenv("ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "1440"))  # 24 hours

# Database Configuration
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./streetledger.db")

# SQLite needs connect_args={"check_same_thread": False}
IS_SQLITE = DATABASE_URL.startswith("sqlite")

# CORS Origins
_raw_cors = os.getenv("CORS_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173,http://localhost:5174,http://127.0.0.1:5174,http://localhost:3000")
CORS_ORIGINS = [origin.strip() for origin in _raw_cors.split(",") if origin.strip()]
