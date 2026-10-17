from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ..database import get_db
from .. import models, schemas
from ..auth import hash_password, verify_password, create_access_token, get_current_user

router = APIRouter(prefix="/api/auth", tags=["Authentication"])

@router.post("/register", response_model=schemas.Token, status_code=status.HTTP_201_CREATED)
def register_vendor(payload: schemas.UserRegister, db: Session = Depends(get_db)):
    """
    Register a new street food vendor account.
    Checks for duplicate emails, securely hashes password, and creates stall profile.
    """
    normalized_email = payload.email.strip().lower()
    existing_user = db.query(models.User).filter(models.User.email == normalized_email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email address already exists."
        )

    # Hash password
    pwd_hash = hash_password(payload.password)

    # Create User
    new_user = models.User(
        vendor_name=payload.vendor_name.strip(),
        owner_name=payload.owner_name.strip(),
        email=normalized_email,
        password_hash=pwd_hash,
        phone=payload.phone.strip() if payload.phone else None
    )
    db.add(new_user)
    db.flush()  # Flush to obtain new_user.id

    # Create default VendorProfile
    profile = models.VendorProfile(
        user_id=new_user.id,
        stall_name=payload.vendor_name.strip(),
        stall_type=payload.stall_type.strip() if payload.stall_type else "General Street Food",
        location=payload.location.strip() if payload.location else None
    )
    db.add(profile)
    db.commit()
    db.refresh(new_user)

    # Issue JWT token
    access_token = create_access_token(data={"sub": str(new_user.id), "email": new_user.email})

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": new_user
    }


@router.post("/login", response_model=schemas.Token)
def login_vendor(payload: schemas.UserLogin, db: Session = Depends(get_db)):
    """
    Authenticate vendor credentials and return JWT bearer token.
    """
    normalized_email = payload.email.strip().lower()
    user = db.query(models.User).filter(models.User.email == normalized_email).first()
    if not user or not verify_password(payload.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password. Please verify your credentials."
        )

    access_token = create_access_token(data={"sub": str(user.id), "email": user.email})

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user
    }


@router.get("/me", response_model=schemas.UserResponse)
def get_current_vendor_profile(current_user: models.User = Depends(get_current_user)):
    """
    Return currently authenticated vendor details and stall profile.
    """
    return current_user


@router.post("/logout")
def logout_vendor(current_user: models.User = Depends(get_current_user)):
    """
    Logout endpoint. Client will discard token from storage.
    """
    return {"message": "Logged out successfully", "user_id": current_user.id}


class DemoLoginRequest(schemas.BaseModel):
    vendor_id: int


@router.get("/demo-vendors")
def list_demo_vendors(db: Session = Depends(get_db)):
    """
    List available vendors for 1-click switcher in the prototype.
    """
    users = db.query(models.User).order_by(models.User.id).all()
    return [
        {
            "id": u.id,
            "vendor_name": u.vendor_name,
            "owner_name": u.owner_name,
            "email": u.email,
            "stall_type": u.profile.stall_type if u.profile else "General Street Food",
            "location": u.profile.location if u.profile else None
        }
        for u in users
    ]


@router.post("/demo-login", response_model=schemas.Token)
def demo_login(payload: DemoLoginRequest, db: Session = Depends(get_db)):
    """
    1-Click demo authentication for rapid prototyping and evaluation.
    Immediately issues a valid JWT token for the selected vendor.
    """
    user = db.query(models.User).filter(models.User.id == payload.vendor_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Demo vendor not found."
        )
    access_token = create_access_token(data={"sub": str(user.id), "email": user.email})
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user
    }
