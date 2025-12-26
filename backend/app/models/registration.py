from sqlalchemy import Boolean, Column, ForeignKey, Integer, String, Enum, DateTime
from sqlalchemy.orm import relationship
from app.core.database import Base
import enum
from datetime import datetime

class RegistrationStatus(str, enum.Enum):
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"
    CANCELLED = "cancelled"

class Registration(Base):
    __tablename__ = "registrations"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    event_id = Column(Integer, ForeignKey("events.id"))
    status = Column(Enum(RegistrationStatus), default=RegistrationStatus.PENDING)
    registration_date = Column(DateTime, default=datetime.utcnow)
    confirmation_id = Column(String, unique=True, nullable=True)  # Unique confirmation ID
    attended = Column(Boolean, default=False)
    rejection_reason = Column(String, nullable=True)

    user = relationship("User", back_populates="registrations")
    event = relationship("Event", back_populates="registrations")
