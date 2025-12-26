from typing import Any, List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.event import Event, EventType, EventStatus
from app.models.user import User, UserRole
from app.api import deps
from pydantic import BaseModel
from datetime import datetime
import logging

router = APIRouter()

class EventCreate(BaseModel):
    title: str
    description: str
    start_time: datetime
    end_time: datetime
    location: str
    event_type: EventType
    capacity: int

class EventUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None
    location: Optional[str] = None
    event_type: Optional[EventType] = None
    capacity: Optional[int] = None
    status: Optional[EventStatus] = None

class EventSchema(EventCreate):
    id: int
    status: EventStatus
    is_active: bool
    organizer_id: int

    class Config:
        orm_mode = True

@router.post("/", response_model=EventSchema)
def create_event(
    *,
    db: Session = Depends(get_db),
    event_in: EventCreate,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    logging.info(f"User {current_user.id} creating event: {event_in.title}")
    if current_user.role not in [UserRole.MANAGER, UserRole.ADMIN]:
         logging.error(f"User {current_user.id} tried to create event without permission")
         raise HTTPException(status_code=403, detail="Not enough permissions")
    
    # if current_user.role == UserRole.MANAGER and not current_user.is_approved:
    #     raise HTTPException(status_code=403, detail="Manager not approved yet")

    event = Event(
        **event_in.dict(),
        organizer_id=current_user.id,
        status=EventStatus.PUBLISHED # Auto publish for now
    )
    db.add(event)
    db.commit()
    db.refresh(event)
    logging.info(f"Event created successfully: {event.id}")
    return event

@router.get("/", response_model=List[EventSchema])
def read_events(
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
) -> Any:
    logging.info(f"Reading events skip={skip} limit={limit}")
    events = db.query(Event).filter(Event.status == EventStatus.PUBLISHED).offset(skip).limit(limit).all()
    return events

@router.get("/{event_id}", response_model=EventSchema)
def read_event(
    event_id: int,
    db: Session = Depends(get_db),
) -> Any:
    logging.info(f"Reading event {event_id}")
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        logging.error(f"Event {event_id} not found")
        raise HTTPException(status_code=404, detail="Event not found")
    return event

@router.put("/{event_id}", response_model=EventSchema)
def update_event(
    *,
    db: Session = Depends(get_db),
    event_id: int,
    event_in: EventUpdate,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    logging.info(f"User {current_user.id} updating event {event_id}")
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        logging.error(f"Event {event_id} not found for update")
        raise HTTPException(status_code=404, detail="Event not found")
    if event.organizer_id != current_user.id and current_user.role != UserRole.ADMIN:
        logging.error(f"User {current_user.id} tried to update event {event_id} without permission")
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    update_data = event_in.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(event, field, value)
    
    db.add(event)
    db.commit()
    db.refresh(event)
    logging.info(f"Event {event_id} updated successfully")
    return event

@router.put("/{event_id}/deactivate", response_model=EventSchema)
def deactivate_event(
    *,
    db: Session = Depends(get_db),
    event_id: int,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    logging.info(f"User {current_user.id} deactivating event {event_id}")
    if current_user.role != UserRole.ADMIN:
        logging.error(f"User {current_user.id} tried to deactivate event without admin permission")
        raise HTTPException(status_code=403, detail="Only admins can deactivate events")
    
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        logging.error(f"Event {event_id} not found for deactivation")
        raise HTTPException(status_code=404, detail="Event not found")
    
    event.is_active = False
    db.commit()
    db.refresh(event)
    logging.info(f"Event {event_id} deactivated successfully")
    return event

@router.delete("/{event_id}", response_model=EventSchema)
def delete_event(
    *,
    db: Session = Depends(get_db),
    event_id: int,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    logging.info(f"User {current_user.id} deleting event {event_id}")
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        logging.error(f"Event {event_id} not found for deletion")
        raise HTTPException(status_code=404, detail="Event not found")
    # Only organizer can delete (not admin)
    if event.organizer_id != current_user.id:
        logging.error(f"User {current_user.id} tried to delete event {event_id} without being organizer")
        raise HTTPException(status_code=403, detail="Only event organizer can delete")
    
    db.delete(event)
    db.commit()
    logging.info(f"Event {event_id} deleted successfully")
    return event
