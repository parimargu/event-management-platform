from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.user import User, UserRole
from app.api import deps
from pydantic import BaseModel, EmailStr
import logging
import os
import uuid
from pathlib import Path

router = APIRouter()

class UserSchema(BaseModel):
    id: int
    email: EmailStr
    full_name: str
    role: UserRole
    is_active: bool
    is_approved: bool
    rejection_reason: str | None = None
    admin_comment: str | None = None
    is_company: bool = False
    additional_details: str | None = None
    id_proof_url: str | None = None
    phone: str | None = None
    city: str | None = None
    state: str | None = None
    country: str | None = None
    linkedin_url: str | None = None
    youtube_url: str | None = None
    facebook_url: str | None = None
    twitter_url: str | None = None
    instagram_url: str | None = None
    about_me: str | None = None
    gender: str | None = None
    dob: str | None = None

    class Config:
        orm_mode = True

class UserProfileUpdate(BaseModel):
    full_name: str | None = None
    phone: str | None = None
    city: str | None = None
    state: str | None = None
    country: str | None = None
    linkedin_url: str | None = None
    youtube_url: str | None = None
    facebook_url: str | None = None
    twitter_url: str | None = None
    instagram_url: str | None = None
    about_me: str | None = None
    gender: str | None = None
    dob: str | None = None

class UserUpgradeRequest(BaseModel):
    is_company: bool
    additional_details: str
    id_proof_url: str

@router.get("/", response_model=List[UserSchema])
def read_users(
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(deps.get_current_active_superuser),
) -> Any:
    logging.info(f"Admin {current_user.id} reading users skip={skip} limit={limit}")
    users = db.query(User).offset(skip).limit(limit).all()
    return users

@router.post("/upload-id-proof")
async def upload_id_proof(
    file: UploadFile = File(...),
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Upload ID proof file and return the file path
    """
    # Validate file type
    allowed_extensions = {'.jpg', '.jpeg', '.png', '.pdf'}
    file_ext = Path(file.filename).suffix.lower()
    
    if file_ext not in allowed_extensions:
        raise HTTPException(
            status_code=400,
            detail=f"File type not allowed. Allowed types: {', '.join(allowed_extensions)}"
        )
    
    # Generate unique filename
    unique_filename = f"{uuid.uuid4()}{file_ext}"
    file_path = Path("uploads/id_proofs") / unique_filename
    
    # Ensure directory exists
    file_path.parent.mkdir(parents=True, exist_ok=True)
    
    # Save file
    try:
        contents = await file.read()
        with open(file_path, "wb") as f:
            f.write(contents)
        
        # Return path relative to server root
        relative_path = f"/uploads/id_proofs/{unique_filename}"
        logging.info(f"User {current_user.id} uploaded ID proof: {relative_path}")
        return {"file_path": relative_path}
    except Exception as e:
        logging.error(f"Error uploading file: {e}")
        raise HTTPException(status_code=500, detail="Failed to upload file")

@router.get("/pending-managers", response_model=List[UserSchema])
def read_pending_managers(
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_active_superuser),
) -> Any:
    logging.info(f"Admin {current_user.id} reading pending managers")
    users = db.query(User).filter(User.role == UserRole.MANAGER, User.is_approved == False).all()
    return users

@router.post("/request-upgrade", response_model=UserSchema)
def request_upgrade(
    request: UserUpgradeRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    logging.info(f"User {current_user.id} requesting upgrade to manager")
    current_user.role = UserRole.MANAGER
    current_user.is_approved = False # Needs approval
    current_user.is_company = request.is_company
    current_user.additional_details = request.additional_details
    current_user.id_proof_url = request.id_proof_url
    
    db.commit()
    db.refresh(current_user)
    return current_user

@router.get("/me", response_model=UserSchema)
def read_user_me(
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    logging.info(f"User {current_user.id} reading own profile")
    return current_user

@router.put("/me", response_model=UserSchema)
def update_user_me(
    profile_update: UserProfileUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    logging.info(f"User {current_user.id} updating profile")
    update_data = profile_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(current_user, field, value)
    db.commit()
    db.refresh(current_user)
    logging.info(f"Profile updated for user {current_user.id}")
    return current_user

@router.get("/my-manager-request", response_model=UserSchema)
def get_my_manager_request(
    current_user: User = Depends(deps.get_current_active_user),
    db: Session = Depends(get_db),
) -> Any:
    logging.info(f"User {current_user.id} reading own manager request status")
    # Return user data if they have manager role, otherwise 404
    if current_user.role != UserRole.MANAGER:
        raise HTTPException(status_code=404, detail="No manager request found")
    return current_user

@router.put("/{user_id}/deactivate", response_model=UserSchema)
def deactivate_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_active_superuser),
) -> Any:
    logging.info(f"Admin {current_user.id} deactivating user {user_id}")
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if user.id == current_user.id:
        raise HTTPException(status_code=400, detail="Cannot deactivate yourself")
    
    user.is_active = False
    db.commit()
    db.refresh(user)
    logging.info(f"User {user_id} deactivated successfully")
    return user

@router.put("/{user_id}/approve", response_model=UserSchema)
def approve_manager(
    user_id: int,
    reason: str = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_active_superuser),
) -> Any:
    logging.info(f"Admin {current_user.id} approving manager {user_id} with comment: {reason}")
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        logging.error(f"User {user_id} not found for approval")
        raise HTTPException(status_code=404, detail="User not found")
    if user.role != UserRole.MANAGER:
        logging.error(f"User {user_id} is not a manager")
        raise HTTPException(status_code=400, detail="User is not a manager")
    
    user.is_approved = True
    user.rejection_reason = None # Clear rejection reason if approved
    user.admin_comment = reason
    db.commit()
    db.refresh(user)
    logging.info(f"Manager {user_id} approved successfully")
    return user

@router.put("/{user_id}/reject", response_model=UserSchema)
def reject_manager(
    user_id: int,
    reason: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_active_superuser),
) -> Any:
    logging.info(f"Admin {current_user.id} rejecting manager {user_id} with reason: {reason}")
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        logging.error(f"User {user_id} not found for rejection")
        raise HTTPException(status_code=404, detail="User not found")
    if user.role != UserRole.MANAGER:
        logging.error(f"User {user_id} is not a manager")
        raise HTTPException(status_code=400, detail="User is not a manager")
    
    user.is_approved = False
    user.rejection_reason = reason
    user.admin_comment = reason
    db.commit()
    db.refresh(user)
    logging.info(f"Manager {user_id} rejected successfully")
    return user
