from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ..database import get_db
from .. import models, schemas
from ..auth import get_current_user

router = APIRouter(prefix="/api/vendor", tags=["Vendor Profile"])

@router.get("/profile", response_model=schemas.UserResponse)
def get_profile(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get profile information for the authenticated vendor.
    """
    # Ensure profile exists
    if not current_user.profile:
        profile = models.VendorProfile(
            user_id=current_user.id,
            stall_name=current_user.vendor_name,
            stall_type="General Street Food"
        )
        db.add(profile)
        db.commit()
        db.refresh(current_user)

    return current_user


@router.put("/profile", response_model=schemas.UserResponse)
def update_profile(
    payload: schemas.VendorProfileUpdate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Update stall metadata and owner contact info for the authenticated vendor.
    """
    if payload.owner_name:
        current_user.owner_name = payload.owner_name.strip()
    if payload.phone is not None:
        current_user.phone = payload.phone.strip() if payload.phone else None

    # Get or create profile
    profile = current_user.profile
    if not profile:
        profile = models.VendorProfile(
            user_id=current_user.id,
            stall_name=payload.stall_name or current_user.vendor_name,
            stall_type=payload.stall_type or "General Street Food",
            location=payload.location
        )
        db.add(profile)
    else:
        if payload.stall_name:
            profile.stall_name = payload.stall_name.strip()
            current_user.vendor_name = payload.stall_name.strip()
        if payload.stall_type:
            profile.stall_type = payload.stall_type.strip()
        if payload.location is not None:
            profile.location = payload.location.strip() if payload.location else None

    db.commit()
    db.refresh(current_user)
    return current_user
