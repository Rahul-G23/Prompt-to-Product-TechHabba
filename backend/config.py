"""
CivicLens Configuration Module
Centralizes all application constants, environment settings, and resource paths.
"""

import json
import os
from pathlib import Path
from typing import Dict, Any, List

# Core Application Branding (Single point of configuration)
APP_NAME: str = os.getenv("APP_NAME", "CivicLens")

# Directory Paths
BASE_DIR: Path = Path(__file__).resolve().parent
ROOT_DIR: Path = BASE_DIR.parent
UPLOAD_DIR: Path = BASE_DIR / "uploads"
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

# Database Configuration
DATABASE_URL: str = os.getenv("DATABASE_URL", f"sqlite:///{BASE_DIR / 'civiclens.db'}")

# Gemini AI Configuration
GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
GEMINI_MODEL: str = os.getenv("GEMINI_MODEL", "gemini-2.5-flash")

# Security and Rate Limiting
CORS_ORIGIN: str = os.getenv("CORS_ORIGIN", "http://localhost:5173")
MAX_FILE_SIZE_BYTES: int = 5 * 1024 * 1024  # 5 MB
ALLOWED_MIME_TYPES: List[str] = ["image/jpeg", "image/png", "image/webp"]
RATE_LIMIT_REQUESTS_PER_MINUTE: int = 30

# Allowed Civic Categories (Strict canonical list)
ALLOWED_CATEGORIES: List[str] = [
    "roads",
    "waste",
    "water supply",
    "sewage and drainage",
    "electricity and streetlights",
    "trees and parks",
    "encroachment",
    "noise and pollution",
    "stray animals",
    "other",
]

# Allowed Severity Levels
ALLOWED_SEVERITIES: List[str] = ["Critical", "High", "Medium", "Low"]

# Allowed Ticket Statuses
ALLOWED_STATUSES: List[str] = ["new", "assigned", "in_progress", "resolved"]

# Load Department Routing Table
DEPARTMENTS_PATH: Path = BASE_DIR / "departments.json"
def load_departments() -> Dict[str, Any]:
    if DEPARTMENTS_PATH.exists():
        with open(DEPARTMENTS_PATH, "r", encoding="utf-8") as f:
            return json.load(f)
    return {}

DEPARTMENTS: Dict[str, Any] = load_departments()

# Load Severity Rubric
SEVERITY_RUBRIC_PATH: Path = BASE_DIR / "severity_rubric.json"
def load_severity_rubric() -> Dict[str, Any]:
    if SEVERITY_RUBRIC_PATH.exists():
        with open(SEVERITY_RUBRIC_PATH, "r", encoding="utf-8") as f:
            return json.load(f)
    return {}

SEVERITY_RUBRIC: Dict[str, Any] = load_severity_rubric()
