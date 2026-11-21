# CivicLens Prompt & AI Engineering Log

This log documents every major prompt, AI tool interaction, architectural decision, and engineering artifact produced during the build, in accordance with the *Prompt to Product* hackathon regulations.

---

## Log Entry 2: Backend Skeleton, Data Models & Complaint Intake Pipeline
- **Timestamp**: 2026-11-21 10:54 IST
- **Phase**: Phase 1 (Backend Skeleton & Complaint Intake)
- **Tool**: Google Antigravity (Gemini 3.8 Flash)
- **Prompt Summary**:
  Build FastAPI backend core, SQLAlchemy SQLite data models for tickets and audit logs, configuration files for the 10 canonical civic categories, editable department routing table (`departments.json`), strict safety-first severity rubric (`severity_rubric.json`), safe image re-encoding/sanitization via Pillow (stripping EXIF metadata), per-IP in-memory rate limiting, and citizen tracking endpoint.
- **Artifacts Produced**:
  - `backend/config.py` (central `APP_NAME`, allowed categories, severities, rate limits)
  - `backend/departments.json` (dynamic category to primary/secondary department mapping)
  - `backend/severity_rubric.json` (strict multi-tier safety rubric)
  - `backend/database.py` (SQLAlchemy engine & session management)
  - `backend/models.py` (`Ticket` & `AuditLog` database models with duplicate references)
  - `backend/schemas.py` (`AIClassificationOutput`, `TicketRead`, `TicketDetailRead`, `OfficerUpdateRequest`)
  - `backend/services/image_processor.py` (Pillow-based validation, EXIF strip, JPEG re-encode)
  - `backend/services/rate_limiter.py` (sliding-window IP rate limiter)
  - `backend/routes/complaints.py` (`POST /api/complaints`, `GET /api/complaints/{id}`)
  - `backend/main.py` (CORS middleware, static file mounting for uploads, health check)
  - `backend/tests/test_intake.py` (comprehensive 8-test unit suite covering valid text, photo intake, validation rejection, 5MB limit, and tracking lookups)
- **Verification**:
  - Ran `pytest backend/tests/test_intake.py -v`: 8 of 8 unit tests passed with 100% success.


## Log Entry 1: Project Initialization & Architecture Design
- **Timestamp**: 2026-11-21 10:40 IST
- **Phase**: Phase 0 (Setup & Architecture)
- **Tool**: Google Antigravity (Gemini 3.8 Flash)
- **Prompt Summary**:
  Initialize project structure, environment configuration templates, git repository rules, and architectural specification for the CivicLens intelligent municipal triage system.
- **Artifacts Produced**:
  - `.gitignore` (securing `.env`, SQLite DBs, uploads, node_modules)
  - `.env.example` (clean template with no secrets)
  - `README.md` (architecture diagram, quickstart, system specs)
  - `PROMPT_LOG.md` (compliance audit log)
- **Architectural Decisions**:
  - Centralized application branding to `APP_NAME = "CivicLens"` across backend config and frontend constants.
  - Multi-tier safety classification prioritizing imminent safety over inconvenience.
  - Structured schema output via Gemini 2.5 Flash with strict Pydantic parsing and rule-based fallback.

---

## Log Entry 2: Backend Skeleton, Data Models & Complaint Intake Pipeline
- **Timestamp**: 2026-11-21 10:54 IST
- **Phase**: Phase 1 (Backend Skeleton & Complaint Intake)
- **Tool**: Google Antigravity (Gemini 3.8 Flash)
- **Prompt Summary**:
  Build FastAPI backend core, SQLAlchemy SQLite data models for tickets and audit logs, configuration files for the 10 canonical civic categories, editable department routing table (`departments.json`), strict safety-first severity rubric (`severity_rubric.json`), safe image re-encoding/sanitization via Pillow (stripping EXIF metadata), per-IP in-memory rate limiting, and citizen tracking endpoint.
- **Artifacts Produced**:
  - `backend/config.py` (central `APP_NAME`, allowed categories, severities, rate limits)
  - `backend/departments.json` (dynamic category to primary/secondary department mapping)
  - `backend/severity_rubric.json` (strict multi-tier safety rubric)
  - `backend/database.py` (SQLAlchemy engine & session management)
  - `backend/models.py` (`Ticket` & `AuditLog` database models with duplicate references)
  - `backend/schemas.py` (`AIClassificationOutput`, `TicketRead`, `TicketDetailRead`, `OfficerUpdateRequest`)
  - `backend/services/image_processor.py` (Pillow-based validation, EXIF strip, JPEG re-encode)
  - `backend/services/rate_limiter.py` (sliding-window IP rate limiter)
  - `backend/routes/complaints.py` (`POST /api/complaints`, `GET /api/complaints/{id}`)
  - `backend/main.py` (CORS middleware, static file mounting for uploads, health check)
  - `backend/tests/test_intake.py` (comprehensive 8-test unit suite covering valid text, photo intake, validation rejection, 5MB limit, and tracking lookups)
- **Verification**:
  - Ran `pytest backend/tests/test_intake.py -v`: 8 of 8 unit tests passed with 100% success.

