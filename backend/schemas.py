"""
CivicLens Pydantic Schemas
Defines request and response schemas, officer override models,
and strict AI output validation models.
"""

from datetime import datetime
from typing import Optional, List, Any, Dict
from pydantic import BaseModel, Field, field_validator, ConfigDict
from config import ALLOWED_CATEGORIES, ALLOWED_SEVERITIES, ALLOWED_STATUSES

# AI Classification Structured Output Schema
class AIClassificationOutput(BaseModel):
    category: str = Field(
        ...,
        description="Must be one of the allowed municipal categories: roads, waste, water supply, sewage and drainage, electricity and streetlights, trees and parks, encroachment, noise and pollution, stray animals, other"
    )
    severity: str = Field(
        ...,
        description="One of: Critical, High, Medium, Low based strictly on the safety rubric"
    )
    severity_reason: str = Field(
        ...,
        description="One-line clear rationale explaining why this severity was assigned, emphasizing human safety"
    )
    detected_language: str = Field(
        ...,
        description="Detected input language (e.g., English, Hindi, Kannada, Tamil, Telugu, Marathi, Bengali, Hinglish)"
    )
    translated_text: str = Field(
        ...,
        description="Clean, faithful English translation of the complaint text. If already in English, provide the normalized English text"
    )
    confidence_score: float = Field(
        ...,
        ge=0.0,
        le=1.0,
        description="Confidence score between 0.0 and 1.0"
    )
    photo_summary: Optional[str] = Field(
        None,
        description="Objective summary of what is visible in the photo if provided"
    )
    photo_text_discrepancy: bool = Field(
        False,
        description="True if the photo shows something fundamentally different from what the citizen text describes"
    )
    discrepancy_explanation: Optional[str] = Field(
        None,
        description="Explanation if photo and text disagree"
    )
    secondary_department: Optional[str] = Field(
        None,
        description="Optional secondary municipal department if issue spans multiple domains"
    )

    @field_validator("category")
    @classmethod
    def validate_category(cls, v: str) -> str:
        clean = v.strip().lower()
        if clean not in ALLOWED_CATEGORIES:
            raise ValueError(f"Category '{clean}' is not in allowed categories: {ALLOWED_CATEGORIES}")
        return clean

    @field_validator("severity")
    @classmethod
    def validate_severity(cls, v: str) -> str:
        clean = v.strip().capitalize()
        if clean not in ALLOWED_SEVERITIES:
            raise ValueError(f"Severity '{clean}' must be one of {ALLOWED_SEVERITIES}")
        return clean


# Audit Log Representation
class AuditLogRead(BaseModel):
    id: int
    ticket_id: str
    created_at: datetime
    action: str
    field_changed: Optional[str] = None
    old_value: Optional[str] = None
    new_value: Optional[str] = None
    reason: Optional[str] = None
    officer_name: str

    model_config = ConfigDict(from_attributes=True)


# Ticket Read Schema
class TicketRead(BaseModel):
    id: str
    created_at: datetime
    updated_at: datetime
    raw_text: Optional[str] = None
    detected_language: str
    translated_text: Optional[str] = None
    has_photo: bool
    photo_path: Optional[str] = None
    location_text: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    category: str
    severity: str
    severity_reason: str
    primary_department: str
    secondary_department: Optional[str] = None
    status: str
    assigned_officer: Optional[str] = None
    resolution_notes: Optional[str] = None
    resolved_at: Optional[datetime] = None
    confidence_score: float
    needs_review: bool
    review_reason: Optional[str] = None
    ai_classification_method: str
    parent_ticket_id: Optional[str] = None
    is_duplicate: bool
    duplicate_count: int

    model_config = ConfigDict(from_attributes=True)


# Detailed Ticket Read (includes audit logs and duplicates)
class TicketDetailRead(TicketRead):
    audit_logs: List[AuditLogRead] = []
    duplicates: List[TicketRead] = []


# Officer Update / Override Request Schema
class OfficerUpdateRequest(BaseModel):
    status: Optional[str] = None
    category: Optional[str] = None
    severity: Optional[str] = None
    primary_department: Optional[str] = None
    secondary_department: Optional[str] = None
    assigned_officer: Optional[str] = None
    resolution_notes: Optional[str] = None
    override_reason: Optional[str] = None
    officer_name: Optional[str] = "Duty Officer"

    @field_validator("status")
    @classmethod
    def validate_status(cls, v: Optional[str]) -> Optional[str]:
        if v is not None and v not in ALLOWED_STATUSES:
            raise ValueError(f"Status '{v}' must be one of {ALLOWED_STATUSES}")
        return v

    @field_validator("category")
    @classmethod
    def validate_category(cls, v: Optional[str]) -> Optional[str]:
        if v is not None and v.lower() not in ALLOWED_CATEGORIES:
            raise ValueError(f"Category '{v}' must be one of {ALLOWED_CATEGORIES}")
        return v.lower() if v else None

    @field_validator("severity")
    @classmethod
    def validate_severity(cls, v: Optional[str]) -> Optional[str]:
        if v is not None and v.capitalize() not in ALLOWED_SEVERITIES:
            raise ValueError(f"Severity '{v}' must be one of {ALLOWED_SEVERITIES}")
        return v.capitalize() if v else None


# Analytics Response Schema
class AnalyticsSummary(BaseModel):
    total_tickets: int
    open_tickets: int
    resolved_tickets: int
    needs_review_count: int
    duplicate_tickets: int
    avg_resolution_hours: Optional[float] = None
    tickets_by_severity: Dict[str, int]
    tickets_by_category: Dict[str, int]
    tickets_by_department: Dict[str, int]
    tickets_by_status: Dict[str, int]
