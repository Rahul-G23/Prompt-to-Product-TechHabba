"""
CivicLens Municipal Officer API Routes
Supports priority-sorted queue, granular filters, ticket detail,
status progression, and manual overrides with comprehensive audit logging.
"""

from datetime import datetime, timezone
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import case, desc, asc

from database import get_db
from models import Ticket, AuditLog
from schemas import TicketRead, TicketDetailRead, OfficerUpdateRequest, AuditLogRead
from config import ALLOWED_CATEGORIES, ALLOWED_SEVERITIES, ALLOWED_STATUSES, DEPARTMENTS

router = APIRouter(prefix="/api/officer", tags=["Officer Operations"])

# Priority sorting order: Critical (1), High (2), Medium (3), Low (4)
SEVERITY_ORDER = case(
    (Ticket.severity == "Critical", 1),
    (Ticket.severity == "High", 2),
    (Ticket.severity == "Medium", 3),
    (Ticket.severity == "Low", 4),
    else_=5
)

@router.get("/tickets", response_model=List[TicketRead])
def list_tickets(
    department: Optional[str] = Query(None),
    category: Optional[str] = Query(None),
    severity: Optional[str] = Query(None),
    status_filter: Optional[str] = Query(None, alias="status"),
    needs_review: Optional[bool] = Query(None),
    search: Optional[str] = Query(None),
    include_duplicates: bool = Query(False),
    db: Session = Depends(get_db)
):
    """
    Retrieves tickets sorted strictly by priority:
    Critical severity first, then High, then Medium, then Low.
    Within the same severity level, older tickets appear first (FIFO).
    """
    query = db.query(Ticket)

    # By default, do not clutter queue with linked child duplicates
    if not include_duplicates:
        query = query.filter(Ticket.is_duplicate == False)

    if department:
        query = query.filter(
            (Ticket.primary_department == department) | 
            (Ticket.secondary_department == department)
        )

    if category:
        query = query.filter(Ticket.category == category.lower())

    if severity:
        query = query.filter(Ticket.severity == severity.capitalize())

    if status_filter:
        query = query.filter(Ticket.status == status_filter.lower())

    if needs_review is not None:
        query = query.filter(Ticket.needs_review == needs_review)

    if search and search.strip():
        term = f"%{search.strip()}%"
        query = query.filter(
            (Ticket.id.ilike(term)) |
            (Ticket.raw_text.ilike(term)) |
            (Ticket.translated_text.ilike(term)) |
            (Ticket.location_text.ilike(term))
        )

    # Sort strictly: Severity Priority ascending (1->4), then Created At ascending (oldest first)
    tickets = query.order_by(SEVERITY_ORDER, asc(Ticket.created_at)).all()
    return tickets


@router.get("/tickets/{ticket_id}", response_model=TicketDetailRead)
def get_ticket_detail(ticket_id: str, db: Session = Depends(get_db)):
    """Fetches comprehensive ticket record including audit logs and linked duplicates."""
    clean_id = ticket_id.strip().upper()
    ticket = db.query(Ticket).filter(Ticket.id == clean_id).first()
    if not ticket:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Ticket '{clean_id}' not found."
        )

    # Fetch audit logs ordered newest first
    logs = (
        db.query(AuditLog)
        .filter(AuditLog.ticket_id == clean_id)
        .order_by(desc(AuditLog.created_at))
        .all()
    )

    # Fetch linked duplicate tickets
    duplicates = (
        db.query(Ticket)
        .filter(Ticket.parent_ticket_id == clean_id)
        .order_by(asc(Ticket.created_at))
        .all()
    )

    ticket_read_dict = TicketRead.model_validate(ticket).model_dump()
    return TicketDetailRead(
        **ticket_read_dict,
        audit_logs=[AuditLogRead.model_validate(log) for log in logs],
        duplicates=[TicketRead.model_validate(dup) for dup in duplicates]
    )


@router.patch("/tickets/{ticket_id}", response_model=TicketDetailRead)
def update_ticket(
    ticket_id: str,
    payload: OfficerUpdateRequest,
    db: Session = Depends(get_db)
):
    """
    Updates ticket status, assigns personnel, or performs manual classification overrides.
    Logs every override and status modification to the audit trail.
    """
    clean_id = ticket_id.strip().upper()
    ticket = db.query(Ticket).filter(Ticket.id == clean_id).first()
    if not ticket:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Ticket '{clean_id}' not found."
        )

    now = datetime.now(timezone.utc)
    officer_name = payload.officer_name or "Duty Officer"
    reason = payload.override_reason or "Routine operational update"

    # 1. Status Update
    if payload.status and payload.status != ticket.status:
        old_status = ticket.status
        ticket.status = payload.status
        if payload.status == "resolved":
            ticket.resolved_at = now
        
        audit_entry = AuditLog(
            ticket_id=ticket.id,
            action="status_change",
            field_changed="status",
            old_value=old_status,
            new_value=payload.status,
            reason=reason,
            officer_name=officer_name,
            created_at=now
        )
        db.add(audit_entry)

    # 2. Category Manual Override
    if payload.category and payload.category != ticket.category:
        old_cat = ticket.category
        ticket.category = payload.category
        ticket.ai_classification_method = "manual_override"
        
        # Auto-update primary department if not explicitly set
        if not payload.primary_department:
            dept_info = DEPARTMENTS.get(payload.category, {})
            new_dept = dept_info.get("primary_department", ticket.primary_department)
            if new_dept != ticket.primary_department:
                old_dept = ticket.primary_department
                ticket.primary_department = new_dept
                db.add(AuditLog(
                    ticket_id=ticket.id,
                    action="manual_override",
                    field_changed="primary_department",
                    old_value=old_dept,
                    new_value=new_dept,
                    reason=f"Auto-routed following category override: {reason}",
                    officer_name=officer_name,
                    created_at=now
                ))

        audit_entry = AuditLog(
            ticket_id=ticket.id,
            action="manual_override",
            field_changed="category",
            old_value=old_cat,
            new_value=payload.category,
            reason=reason,
            officer_name=officer_name,
            created_at=now
        )
        db.add(audit_entry)

    # 3. Severity Manual Override
    if payload.severity and payload.severity != ticket.severity:
        old_sev = ticket.severity
        ticket.severity = payload.severity
        ticket.ai_classification_method = "manual_override"
        
        audit_entry = AuditLog(
            ticket_id=ticket.id,
            action="manual_override",
            field_changed="severity",
            old_value=old_sev,
            new_value=payload.severity,
            reason=reason,
            officer_name=officer_name,
            created_at=now
        )
        db.add(audit_entry)

    # 4. Department Manual Override
    if payload.primary_department and payload.primary_department != ticket.primary_department:
        old_pdept = ticket.primary_department
        ticket.primary_department = payload.primary_department
        ticket.ai_classification_method = "manual_override"

        audit_entry = AuditLog(
            ticket_id=ticket.id,
            action="manual_override",
            field_changed="primary_department",
            old_value=old_pdept,
            new_value=payload.primary_department,
            reason=reason,
            officer_name=officer_name,
            created_at=now
        )
        db.add(audit_entry)

    if payload.secondary_department is not None and payload.secondary_department != ticket.secondary_department:
        old_sdept = ticket.secondary_department
        ticket.secondary_department = payload.secondary_department
        db.add(AuditLog(
            ticket_id=ticket.id,
            action="manual_override",
            field_changed="secondary_department",
            old_value=old_sdept,
            new_value=payload.secondary_department,
            reason=reason,
            officer_name=officer_name,
            created_at=now
        ))

    # 5. Officer Assignment & Resolution Notes
    if payload.assigned_officer is not None:
        ticket.assigned_officer = payload.assigned_officer

    if payload.resolution_notes is not None:
        ticket.resolution_notes = payload.resolution_notes

    # Clear needs_review flag upon manual officer intervention
    if ticket.needs_review:
        ticket.needs_review = False
        db.add(AuditLog(
            ticket_id=ticket.id,
            action="review_cleared",
            field_changed="needs_review",
            old_value="True",
            new_value="False",
            reason=f"Officer reviewed ticket: {reason}",
            officer_name=officer_name,
            created_at=now
        ))

    db.commit()
    db.refresh(ticket)
    return get_ticket_detail(ticket.id, db)
