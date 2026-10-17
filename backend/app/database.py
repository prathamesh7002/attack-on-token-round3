from sqlalchemy import create_engine, event
from sqlalchemy.orm import declarative_base, sessionmaker
from .config import DATABASE_URL, IS_SQLITE

# Engine configuration
connect_args = {"check_same_thread": False} if IS_SQLITE else {}

engine = create_engine(
    DATABASE_URL,
    connect_args=connect_args,
    echo=False
)

# Enforce foreign key constraints for SQLite
if IS_SQLITE:
    @event.listens_for(engine, "connect")
    def set_sqlite_pragma(dbapi_connection, connection_record):
        cursor = dbapi_connection.cursor()
        cursor.execute("PRAGMA foreign_keys=ON")
        cursor.close()

# Session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Declarative base model
Base = declarative_base()

def get_db():
    """
    FastAPI dependency yielding a database session and closing it on completion.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def init_db():
    """
    Create all tables defined in Base metadata.
    """
    from . import models  # noqa: F401 - ensure models are imported before creating tables
    Base.metadata.create_all(bind=engine)
