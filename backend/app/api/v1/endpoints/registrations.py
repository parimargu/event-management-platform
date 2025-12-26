from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.registration import Registration, RegistrationStatus
from app.models.event import Event
from app.models.user import User, UserRole
from app.api import deps
from pydantic import BaseModel
from datetime import datetime
import logging
import random
import string

router = APIRouter()

class UserSummarySchema(BaseModel):
    id: int
    full_name: str
    email: str

    class Config:
        orm_mode = True

class RegistrationSchema(BaseModel):
    id: int
    user_id: int
    event_id: int
    status: RegistrationStatus
    registration_date: datetime
    confirmation_id: str | None = None
    rejection_reason: str | None = None
    user: UserSummarySchema | None = None

    class Config:
        orm_mode = True

def generate_confirmation_id(event_id: int) -> str:
    """Generate unique confirmation ID in format: EVT-{event_id}-{random_6_digit}"""
    random_part = ''.join(random.choices(string.digits, k=6))
    return f"EVT-{event_id}-{random_part}"

@router.post("/{event_id}", response_model=RegistrationSchema)
def register_for_event(
    event_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    logging.info(f"User {current_user.id} registering for event {event_id}")
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        logging.error(f"Event {event_id} not found for registration")
        raise HTTPException(status_code=404, detail="Event not found")
    
    # Prevent organizers from registering for their own events
    if current_user.id == event.organizer_id:
        logging.error(f"User {current_user.id} attempted to register for their own event {event_id}")
        raise HTTPException(status_code=400, detail="You cannot register for your own event")
    
    # Check capacity
    current_registrations = db.query(Registration).filter(
        Registration.event_id == event_id,
        Registration.status == RegistrationStatus.APPROVED
    ).count()
    
    if current_registrations >= event.capacity:
        logging.error(f"Event {event_id} is full")
        raise HTTPException(status_code=400, detail="Event is full")

    # Check if already registered
    existing = db.query(Registration).filter(
        Registration.user_id == current_user.id,
        Registration.event_id == event_id
    ).first()
    if existing:
        logging.error(f"User {current_user.id} already registered for event {event_id}")
        raise HTTPException(status_code=400, detail="Already registered for this event")
    
    # Generate unique confirmation ID
    confirmation_id = generate_confirmation_id(event_id)
    # Ensure uniqueness
    while db.query(Registration).filter(Registration.confirmation_id == confirmation_id).first():
        confirmation_id = generate_confirmation_id(event_id)
    
    registration = Registration(
        user_id=current_user.id,
        event_id=event_id,
        status=RegistrationStatus.PENDING,
        confirmation_id=confirmation_id
    )
    db.add(registration)
    db.commit()
    db.refresh(registration)
    logging.info(f"User {current_user.id} registered for event {event_id} with confirmation ID {confirmation_id}")
    return registration

@router.get("/my-registrations", response_model=List[RegistrationSchema])
def read_my_registrations(
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    logging.info(f"User {current_user.id} reading my registrations")
    return current_user.registrations

@router.put("/{registration_id}/approve", response_model=RegistrationSchema)
def approve_registration(
    registration_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    logging.info(f"User {current_user.id} approving registration {registration_id}")
    registration = db.query(Registration).filter(Registration.id == registration_id).first()
    if not registration:
        logging.error(f"Registration {registration_id} not found")
        raise HTTPException(status_code=404, detail="Registration not found")
    
    event = registration.event
    if event.organizer_id != current_user.id and current_user.role != UserRole.ADMIN:
        logging.error(f"User {current_user.id} tried to approve registration {registration_id} without permission")
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    registration.status = RegistrationStatus.APPROVED
    registration.rejection_reason = None
    db.commit()
    db.refresh(registration)
    logging.info(f"Registration {registration_id} approved successfully")
    return registration

@router.put("/{registration_id}/confirm", response_model=RegistrationSchema)
def confirm_registration(
    registration_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    # Alias for approve
    return approve_registration(registration_id, db, current_user)

@router.put("/{registration_id}/reject", response_model=RegistrationSchema)
def reject_registration(
    registration_id: int,
    reason: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    logging.info(f"User {current_user.id} rejecting registration {registration_id} with reason: {reason}")
    registration = db.query(Registration).filter(Registration.id == registration_id).first()
    if not registration:
        logging.error(f"Registration {registration_id} not found")
        raise HTTPException(status_code=404, detail="Registration not found")
    
    event = registration.event
    if event.organizer_id != current_user.id and current_user.role != UserRole.ADMIN:
        logging.error(f"User {current_user.id} tried to reject registration {registration_id} without permission")
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    registration.status = RegistrationStatus.REJECTED
    registration.rejection_reason = reason
    db.commit()
    db.refresh(registration)
    logging.info(f"Registration {registration_id} rejected successfully")
    return registration

@router.get("/events/{event_id}", response_model=List[RegistrationSchema])
def read_event_registrations(
    event_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    logging.info(f"User {current_user.id} reading registrations for event {event_id}")
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        logging.error(f"Event {event_id} not found")
        raise HTTPException(status_code=404, detail="Event not found")
    
    # Allow organizer or admin to view registrations
    if event.organizer_id != current_user.id and current_user.role != UserRole.ADMIN:
        logging.error(f"User {current_user.id} tried to read registrations for event {event_id} without permission")
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    return event.registrations
