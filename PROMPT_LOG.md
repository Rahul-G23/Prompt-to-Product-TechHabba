# CivicLens Prompt & AI Engineering Log

This log documents every major prompt, AI tool interaction, architectural decision, and engineering artifact produced during the build, in accordance with the *Prompt to Product* hackathon regulations.

---

## Log Entry 3: Multimodal Gemini AI, Safety Rubric, Injection Defense & Fallback
- **Timestamp**: 2026-11-21 10:58 IST
- **Phase**: Phase 2 (AI Classification, Rubric, and Fallback Engine)
- **Tool**: Google Antigravity (Gemini 3.8 Flash)
- **Prompt Summary**:
  Design versioned system prompt (`classifier_v1.py`) with canonical category schema, safety-first severity rubric, strict JSON output structure, prompt injection boundary defenses, and multilingual translation support. Implement `ai_classifier.py` with multimodal image reading and single-attempt retry. Construct deterministic rule-based fallback classifier (`fallback_classifier.py`) spanning English, Hindi, Kannada, Tamil, Telugu, and Hinglish. Wire intake endpoint to automated classification.
- **Artifacts Produced**:
  - `backend/prompts/classifier_v1.py` (versioned prompt template, delimited user block, strict JSON schema instructions)
  - `backend/services/fallback_classifier.py` (deterministic regex and keyword classifier across 10 categories and 4 severities)
  - `backend/services/ai_classifier.py` (Gemini API integration with schema validation, retry mechanism, multimodal support, and graceful fallback)
  - `backend/routes/complaints.py` (updated intake endpoint executing automated classification and dynamic department routing)
  - `backend/tests/test_rubric.py` (unit tests verifying category limits, department completeness, and safety priority logic)
  - `backend/tests/test_validation.py` (unit tests verifying Pydantic validation, injection delimitation, and crash resilience)
- **Verification**:
  - Ran `pytest backend/tests/ -v`: 23 of 23 unit tests passed with 100% success.


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

## Log Entry 3: Multimodal Gemini AI, Safety Rubric, Injection Defense & Fallback
- **Timestamp**: 2026-11-21 10:58 IST
- **Phase**: Phase 2 (AI Classification, Rubric, and Fallback Engine)
- **Tool**: Google Antigravity (Gemini 3.8 Flash)
- **Prompt Summary**:
  Design versioned system prompt (`classifier_v1.py`) with canonical category schema, safety-first severity rubric, strict JSON output structure, prompt injection boundary defenses, and multilingual translation support. Implement `ai_classifier.py` with multimodal image reading and single-attempt retry. Construct deterministic rule-based fallback classifier (`fallback_classifier.py`) spanning English, Hindi, Kannada, Tamil, Telugu, and Hinglish. Wire intake endpoint to automated classification.
- **Artifacts Produced**:
  - `backend/prompts/classifier_v1.py` (versioned prompt template, delimited user block, strict JSON schema instructions)
  - `backend/services/fallback_classifier.py` (deterministic regex and keyword classifier across 10 categories and 4 severities)
  - `backend/services/ai_classifier.py` (Gemini API integration with schema validation, retry mechanism, multimodal support, and graceful fallback)
  - `backend/routes/complaints.py` (updated intake endpoint executing automated classification and dynamic department routing)
  - `backend/tests/test_rubric.py` (unit tests verifying category limits, department completeness, and safety priority logic)
  - `backend/tests/test_validation.py` (unit tests verifying Pydantic validation, injection delimitation, and crash resilience)
- **Verification**:
  - Ran `pytest backend/tests/ -v`: 23 of 23 unit tests passed with 100% success.


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

