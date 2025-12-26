from typing import Any
from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from app.core import security
from app.core.database import get_db
from app.models.user import User, UserRole
from pydantic import BaseModel, EmailStr
import logging

router = APIRouter()

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    full_name: str
    phone: str  # Required field

class Token(BaseModel):
    access_token: str
    token_type: str

@router.post("/login", response_model=Token)
def login_access_token(
    db: Session = Depends(get_db), form_data: OAuth2PasswordRequestForm = Depends()
) -> Any:
    logging.info(f"Login attempt for user: {form_data.username}")
    user = db.query(User).filter(User.email == form_data.username).first()
    if not user or not security.verify_password(form_data.password, user.hashed_password):
        logging.error(f"Login failed for user: {form_data.username} - Incorrect email or password")
        raise HTTPException(status_code=400, detail="Incorrect email or password")
    if not user.is_active:
        logging.error(f"Login failed for user: {form_data.username} - Inactive user")
        raise HTTPException(status_code=400, detail="Inactive user")
    
    access_token = security.create_access_token(subject=user.id)
    logging.info(f"Login successful for user: {form_data.username}")
    return {"access_token": access_token, "token_type": "bearer"}

@router.post("/register", response_model=Token)
def register_user(
    *,
    db: Session = Depends(get_db),
    user_in: UserCreate,
) -> Any:
    logging.info(f"Registration attempt for user: {user_in.email}")
    user = db.query(User).filter(User.email == user_in.email).first()
    if user:
        logging.error(f"Registration failed for user: {user_in.email} - User already exists")
        raise HTTPException(
            status_code=400,
            detail="The user with this email already exists in the system",
        )
    
    # All new users default to USER role
    user = User(
        email=user_in.email,
        hashed_password=security.get_password_hash(user_in.password),
        full_name=user_in.full_name,
        phone=user_in.phone,
        role=UserRole.USER,  # Default role
        is_approved=True  # Regular users are auto-approved
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    
    access_token = security.create_access_token(subject=user.id)
    logging.info(f"Registration successful for user: {user_in.email}")
    return {"access_token": access_token, "token_type": "bearer"}
