from sqlalchemy import Boolean, Column, ForeignKey, Integer, String, DateTime, Enum
from sqlalchemy.orm import relationship
from app.core.database import Base
import enum
from datetime import datetime

class EventType(str, enum.Enum):
    ONLINE = "online"
    OFFLINE = "offline"

class EventStatus(str, enum.Enum):
    DRAFT = "draft"
    PUBLISHED = "published"
    CANCELLED = "cancelled"
    COMPLETED = "completed"

class Event(Base):
    __tablename__ = "events"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    description = Column(String)
    start_time = Column(DateTime)
    end_time = Column(DateTime)
    location = Column(String) # URL for online, Address for offline
    event_type = Column(Enum(EventType))
    capacity = Column(Integer)
    status = Column(Enum(EventStatus), default=EventStatus.DRAFT)
    is_active = Column(Boolean, default=True)  # For soft delete/deactivation
    organizer_id = Column(Integer, ForeignKey("users.id"))

    organizer = relationship("User", back_populates="events")
    registrations = relationship("Registration", back_populates="event")
