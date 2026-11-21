"""
CivicLens Database Models
SQLAlchemy models for tickets, duplicate tracking, and audit log history.
"""

from datetime import datetime
from sqlalchemy import (
    Column,
    String,
    Text,
    Boolean,
    Float,
    Integer,
    DateTime,
    ForeignKey,
    Index,
)
from sqlalchemy.orm import relationship
from database import Base

class Ticket(Base):
    __tablename__ = "tickets"

    id = Column(String(32), primary_key=True, index=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Citizen Submission Inputs
    raw_text = Column(Text, nullable=True)
    detected_language = Column(String(50), default="English", nullable=False)
    translated_text = Column(Text, nullable=True)

    has_photo = Column(Boolean, default=False, nullable=False)
    photo_path = Column(String(255), nullable=True)

    location_text = Column(String(255), nullable=True, index=True)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    contact_number = Column(String(30), nullable=True)  # Strictly preserved, NEVER forwarded to LLM

    # Classification & Routing
    category = Column(String(50), nullable=False, index=True)
    severity = Column(String(20), nullable=False, index=True)  # Critical, High, Medium, Low
    severity_reason = Column(Text, nullable=False)
    primary_department = Column(String(100), nullable=False, index=True)
    secondary_department = Column(String(100), nullable=True)

    # Lifecycle & Status
    status = Column(String(30), default="new", nullable=False, index=True)  # new, assigned, in_progress, resolved
    assigned_officer = Column(String(100), nullable=True)
    resolution_notes = Column(Text, nullable=True)
    resolved_at = Column(DateTime, nullable=True)
    completion_summary = Column(Text, nullable=True)
    completion_photo_path = Column(String(255), nullable=True)
    has_completion_photo = Column(Boolean, default=False, nullable=False)

    # AI Quality & Confidence
    confidence_score = Column(Float, default=1.0, nullable=False)
    needs_review = Column(Boolean, default=False, nullable=False, index=True)
    review_reason = Column(String(255), nullable=True)
    ai_classification_method = Column(String(50), default="gemini_text", nullable=False)
    ai_raw_response = Column(Text, nullable=True)

    # Deduplication
    parent_ticket_id = Column(String(32), ForeignKey("tickets.id"), nullable=True, index=True)
    is_duplicate = Column(Boolean, default=False, nullable=False, index=True)
    duplicate_count = Column(Integer, default=0, nullable=False)

    # Relationships
    audit_logs = relationship("AuditLog", back_populates="ticket", cascade="all, delete-orphan")
    duplicates = relationship("Ticket", backref="parent_ticket", remote_side=[id])

    __table_args__ = (
        Index("ix_tickets_severity_created", "severity", "created_at"),
    )


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, autoincrement=True)
    ticket_id = Column(String(32), ForeignKey("tickets.id", ondelete="CASCADE"), nullable=False, index=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    action = Column(String(50), nullable=False)  # manual_override, status_change, duplicate_linked
    field_changed = Column(String(50), nullable=True)
    old_value = Column(String(255), nullable=True)
    new_value = Column(String(255), nullable=True)
    reason = Column(Text, nullable=True)
    officer_name = Column(String(100), default="Duty Officer", nullable=False)

    ticket = relationship("Ticket", back_populates="audit_logs")
