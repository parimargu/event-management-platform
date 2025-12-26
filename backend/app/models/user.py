from sqlalchemy import Boolean, Column, ForeignKey, Integer, String, Enum
from sqlalchemy.orm import relationship
from app.core.database import Base
import enum

class UserRole(str, enum.Enum):
    ADMIN = "admin"
    MANAGER = "manager"
    USER = "user"

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    full_name = Column(String)
    role = Column(Enum(UserRole), default=UserRole.USER)
    is_active = Column(Boolean, default=True)
    is_approved = Column(Boolean, default=False) # For managers
    rejection_reason = Column(String, nullable=True)
    admin_comment = Column(String, nullable=True)

    events = relationship("Event", back_populates="organizer")
    registrations = relationship("Registration", back_populates="user")

    # Fields for "Become Event Manager" request
    is_company = Column(Boolean, default=False)
    additional_details = Column(String, nullable=True)
    id_proof_url = Column(String, nullable=True)
    
    # Profile fields
    phone = Column(String, nullable=True)
    city = Column(String, nullable=True)
    state = Column(String, nullable=True)
    country = Column(String, nullable=True)
    linkedin_url = Column(String, nullable=True)
    youtube_url = Column(String, nullable=True)
    facebook_url = Column(String, nullable=True)
    twitter_url = Column(String, nullable=True)
    instagram_url = Column(String, nullable=True)
    about_me = Column(String, nullable=True)
    gender = Column(String, nullable=True)
    dob = Column(String, nullable=True)  # Stored as string (YYYY-MM-DD format)
