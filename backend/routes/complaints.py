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
from services.ai_classifier import classify_complaint
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

    # 5. Run AI Classification & Safety Triage Pipeline
    ai_output, method, needs_review, review_reason = classify_complaint(
        raw_text=clean_text,
        photo_path=photo_path
    )

    # 6. Department Routing from editable config table
    dept_info = DEPARTMENTS.get(ai_output.category, {})
    primary_dept = dept_info.get("primary_department", "Municipal Grievance Cell")
    secondary_dept = ai_output.secondary_department or dept_info.get("secondary_department")

    ticket = Ticket(
        id=ticket_id,
        raw_text=clean_text,
        detected_language=ai_output.detected_language,
        translated_text=ai_output.translated_text,
        has_photo=has_photo,
        photo_path=photo_path,
        location_text=location_text.strip() if location_text else None,
        latitude=latitude,
        longitude=longitude,
        contact_number=contact_number.strip() if contact_number else None,
        category=ai_output.category,
        severity=ai_output.severity,
        severity_reason=ai_output.severity_reason,
        primary_department=primary_dept,
        secondary_department=secondary_dept,
        status="new",
        confidence_score=ai_output.confidence_score,
        needs_review=needs_review,
        review_reason=review_reason,
        ai_classification_method=method,
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
