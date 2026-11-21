"""
CivicLens Complaints Intake & Citizen Tracking API Routes
Handles complaint submissions, image sanitization, rate limiting, and tracking lookups.
"""

import uuid
from datetime import datetime
from typing import Optional
from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException, Request, status
from sqlalchemy.orm import Session

from database import get_db
from models import Ticket
from schemas import TicketRead
from services.image_processor import sanitize_and_save_image
from services.rate_limiter import limiter
from config import DEPARTMENTS, ALLOWED_CATEGORIES, ALLOWED_SEVERITIES

router = APIRouter(prefix="/api/complaints", tags=["Complaints"])

def generate_ticket_id() -> str:
    """Generate a clean, memorable, collision-resistant ticket ID."""
    prefix = datetime.utcnow().strftime("%y%m")
    suffix = uuid.uuid4().hex[:5].upper()
    return f"CL-{prefix}-{suffix}"

@router.post("", response_model=TicketRead, status_code=status.HTTP_201_CREATED)
async def submit_complaint(
    request: Request,
    raw_text: Optional[str] = Form(None),
    location_text: Optional[str] = Form(None),
    latitude: Optional[float] = Form(None),
    longitude: Optional[float] = Form(None),
    contact_number: Optional[str] = Form(None),
    photo: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db)
):
    """
    Intake endpoint for citizen complaints.
    Validates inputs, enforces rate limiting, re-encodes photos safely,
    and creates a new ticket.
    """
    # 1. Enforce rate limiting per client IP
    limiter.check(request)

    # 2. Validation: At least one of text or photo is strictly required
    clean_text = raw_text.strip() if raw_text else None
    if not clean_text and not photo:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="At least one of complaint text or a photo upload is required."
        )

    # Input length sanitization
    if clean_text and len(clean_text) > 5000:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Complaint text is too long (maximum 5000 characters permitted)."
        )

    if location_text and len(location_text) > 255:
        location_text = location_text[:255]

    if contact_number and len(contact_number) > 30:
        contact_number = contact_number[:30]

    # 3. Process photo if provided
    has_photo = False
    photo_path = None
    if photo and photo.filename:
        photo_path = sanitize_and_save_image(photo)
        has_photo = True

    # 4. Generate unique Ticket ID
    ticket_id = generate_ticket_id()

    # Initial default routing (augmented in Phase 2 with Gemini & fallback)
    default_category = "other"
    dept_info = DEPARTMENTS.get(default_category, {})
    primary_dept = dept_info.get("primary_department", "Municipal Grievance Cell")
    secondary_dept = dept_info.get("secondary_department")

    ticket = Ticket(
        id=ticket_id,
        raw_text=clean_text,
        detected_language="English",
        translated_text=clean_text,
        has_photo=has_photo,
        photo_path=photo_path,
        location_text=location_text.strip() if location_text else None,
        latitude=latitude,
        longitude=longitude,
        contact_number=contact_number.strip() if contact_number else None,
        category=default_category,
        severity="Medium",
        severity_reason="Default intake triage pending automated AI evaluation.",
        primary_department=primary_dept,
        secondary_department=secondary_dept,
        status="new",
        confidence_score=1.0,
        needs_review=False,
        ai_classification_method="intake_pipeline",
        is_duplicate=False,
        duplicate_count=0
    )

    db.add(ticket)
    db.commit()
    db.refresh(ticket)
    return ticket

@router.get("/{ticket_id}", response_model=TicketRead)
def track_complaint(ticket_id: str, db: Session = Depends(get_db)):
    """
    Public citizen tracking endpoint.
    Retrieves status and public triage details for a ticket ID.
    Does not expose sensitive citizen contact information.
    """
    clean_id = ticket_id.strip().upper()
    ticket = db.query(Ticket).filter(Ticket.id == clean_id).first()
    if not ticket:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No civic ticket found with ID '{clean_id}'. Please verify the ticket reference."
        )
    return ticket
