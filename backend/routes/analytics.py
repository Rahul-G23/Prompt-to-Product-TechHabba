"""
CivicLens Real Analytics Engine
Calculates true aggregate municipal metrics strictly from persisted database records.
No fake or static metrics.
"""

from typing import Dict
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func

from database import get_db
from models import Ticket
from schemas import AnalyticsSummary
from config import ALLOWED_CATEGORIES, ALLOWED_SEVERITIES, ALLOWED_STATUSES

router = APIRouter(prefix="/api/analytics", tags=["Analytics"])

@router.get("", response_model=AnalyticsSummary)
def get_analytics(db: Session = Depends(get_db)):
    """
    Computes real-time municipal operational metrics strictly from stored tickets.
    """
    total_tickets = db.query(func.count(Ticket.id)).scalar() or 0
    resolved_tickets = db.query(func.count(Ticket.id)).filter(Ticket.status == "resolved").scalar() or 0
    open_tickets = total_tickets - resolved_tickets
    needs_review_count = db.query(func.count(Ticket.id)).filter(Ticket.needs_review == True).scalar() or 0
    duplicate_tickets = db.query(func.count(Ticket.id)).filter(Ticket.is_duplicate == True).scalar() or 0

    # Average resolution time in hours
    resolved_records = (
        db.query(Ticket.created_at, Ticket.resolved_at)
        .filter(Ticket.status == "resolved", Ticket.resolved_at.isnot(None))
        .all()
    )
    if resolved_records:
        total_seconds = sum(
            (r.resolved_at - r.created_at).total_seconds()
            for r in resolved_records
            if r.resolved_at and r.created_at
        )
        avg_resolution_hours = round(total_seconds / (len(resolved_records) * 3600), 1)
    else:
        avg_resolution_hours = None

    # Tickets by Severity
    severity_counts = {s: 0 for s in ALLOWED_SEVERITIES}
    sev_rows = db.query(Ticket.severity, func.count(Ticket.id)).group_by(Ticket.severity).all()
    for sev, count in sev_rows:
        if sev in severity_counts:
            severity_counts[sev] = count
        else:
            severity_counts[sev] = count

    # Tickets by Category
    category_counts = {c: 0 for c in ALLOWED_CATEGORIES}
    cat_rows = db.query(Ticket.category, func.count(Ticket.id)).group_by(Ticket.category).all()
    for cat, count in cat_rows:
        if cat in category_counts:
            category_counts[cat] = count
        else:
            category_counts[cat] = count

    # Tickets by Department
    dept_counts: Dict[str, int] = {}
    dept_rows = db.query(Ticket.primary_department, func.count(Ticket.id)).group_by(Ticket.primary_department).all()
    for dept, count in dept_rows:
        if dept:
            dept_counts[dept] = count

    # Tickets by Status
    status_counts = {st: 0 for st in ALLOWED_STATUSES}
    st_rows = db.query(Ticket.status, func.count(Ticket.id)).group_by(Ticket.status).all()
    for st, count in st_rows:
        if st in status_counts:
            status_counts[st] = count
        else:
            status_counts[st] = count

    return AnalyticsSummary(
        total_tickets=total_tickets,
        open_tickets=open_tickets,
        resolved_tickets=resolved_tickets,
        needs_review_count=needs_review_count,
        duplicate_tickets=duplicate_tickets,
        avg_resolution_hours=avg_resolution_hours,
        tickets_by_severity=severity_counts,
        tickets_by_category=category_counts,
        tickets_by_department=dept_counts,
        tickets_by_status=status_counts
    )
