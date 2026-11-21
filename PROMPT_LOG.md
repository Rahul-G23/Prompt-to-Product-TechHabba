# CivicLens Prompt & AI Engineering Log

This log documents every major prompt, AI tool interaction, architectural decision, and engineering artifact produced during the build, in accordance with the *Prompt to Product* hackathon regulations.

---

## Log Entry 5: Evaluation Benchmark & Seed Dataset
- **Timestamp**: 2026-11-21 11:18 IST
- **Phase**: Phase 5 (Evaluation Benchmark & Demo Seeding)
- **Tool**: Google Antigravity (Gemini 3.8 Flash)
- **Prompt Summary**:
  Author `seed_demo_data.py` to populate realistic civic tickets across English, Hindi, Kannada, Tamil, and Hinglish, including photos, duplicates, and review flags. Build 28-case evaluation benchmark (`eval_benchmark.py`) testing category precision, safety severity adherence, multilingual detection, prompt injection resilience, and multi-department overlap.
- **Artifacts Produced**:
  - `backend/seed_demo_data.py` (populates 8 realistic civic scenarios, photo proofs, and duplicate linkages)
  - `backend/eval_benchmark.py` (evaluates 28 ground-truth labelled cases across 5 languages)
  - `backend/eval_results.json` (persisted empirical benchmark metrics)
- **Verification**:
  - Seed execution: Completed with code 0.
  - Evaluation results: Category accuracy 96.4% (27/28), Severity accuracy 92.9% (26/28), Language detection accuracy 100.0% (28/28), Life-safety violations: 0.

---

## Log Entry 6: Final Documentation, Slides, Demo Script & Delivery
- **Timestamp**: 2026-11-21 11:20 IST
- **Phase**: Phase 6 (Documentation & Final Delivery)
- **Tool**: Google Antigravity (Gemini 3.8 Flash)
- **Prompt Summary**:
  Compile comprehensive hackathon deliverables: write-up report ready for PDF export (`WRITEUP.md`), pitch deck slides ready for conversion (`SLIDES.md`), 2-3 minute timed live presentation walkthrough (`DEMO_SCRIPT.md`), finalized project README with exact run/test instructions, and prompt log audit trail.
- **Artifacts Produced**:
  - `WRITEUP.md` (comprehensive 9-section report ready for PDF export)
  - `SLIDES.md` (10-slide presentation deck)
  - `DEMO_SCRIPT.md` (timed 2.5-minute presenter walkthrough covering regional language, photo, duplicate, and dashboard)
  - `PROMPT_LOG.md` (complete audit record of prompts, phases, tools, and outputs)
  - `README.md` (updated quickstart, architecture, and exact evaluation commands)


## Log Entry 4: Officer Console, Dedup Engine, Citizen Tracker & Analytics
- **Timestamp**: 2026-11-21 11:13 IST
- **Phase**: Phases 3 & 4 (Officer Experience, Deduplication & Analytics)
- **Tool**: Google Antigravity (Gemini 3.8 Flash)
- **Prompt Summary**:
  Develop full React + Vite + Tailwind frontend application with dark mode persistence and WCAG AA contrast. Construct Priority Queue view sorted strictly by safety severity (Critical first, then FIFO by age). Build interactive ticket dossier modal supporting photo inspection, AI reasoning review, and auditable manual overrides. Implement geographic and textual duplicate detection engine linking secondary grievances to parent tickets. Develop public citizen tracking view with lifecycle stepper and live municipal analytics engine computing genuine database metrics.
- **Artifacts Produced**:
  - `backend/routes/officer.py` (priority queue, ticket dossier, auditable overrides)
  - `backend/routes/analytics.py` (true computed aggregates for severities, categories, and resolution times)
  - `backend/services/duplicate_detector.py` (Haversine distance and combined SequenceMatcher/token Jaccard deduplication)
  - `backend/tests/test_duplicates.py` (automated verification of deduplication, priority sorting, override auditing, and analytics)
  - `frontend/src/config.js` (`APP_NAME = "CivicLens"`, category mappings)
  - `frontend/src/components/Icons.jsx` (accessible pure SVG icon set; zero emojis used as icons)
  - `frontend/src/components/SeverityBadge.jsx` (dual text + SVG icon severity indicators)
  - `frontend/src/components/StatusBadge.jsx` (accessible ticket status chips)
  - `frontend/src/components/Navbar.jsx` (navigation, branding, and dark mode toggle)
  - `frontend/src/components/ComplaintForm.jsx` (multilingual complaint intake, GPS capture, 5MB client-side image check, loading/offline states)
  - `frontend/src/components/OfficerDashboard.jsx` (officer priority console, KPI cards, multi-faceted filtering, review queue)
  - `frontend/src/components/TicketDetailModal.jsx` (detailed dossier, photo preview, AI reasoning breakdown, duplicate listings, audit logs, and override commit)
  - `frontend/src/components/TrackTicket.jsx` (citizen tracking portal by ID with progress stepper)
  - `frontend/src/components/AnalyticsView.jsx` (real-time municipal analytics dashboard)
- **Verification**:
  - Backend tests: All 27 unit tests passing (100% test pass rate in 0.60s).
  - Frontend build: `npm run build` completed cleanly with zero Rollup/JSX errors.


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

## Log Entry 5: Evaluation Benchmark & Seed Dataset
- **Timestamp**: 2026-11-21 11:18 IST
- **Phase**: Phase 5 (Evaluation Benchmark & Demo Seeding)
- **Tool**: Google Antigravity (Gemini 3.8 Flash)
- **Prompt Summary**:
  Author `seed_demo_data.py` to populate realistic civic tickets across English, Hindi, Kannada, Tamil, and Hinglish, including photos, duplicates, and review flags. Build 28-case evaluation benchmark (`eval_benchmark.py`) testing category precision, safety severity adherence, multilingual detection, prompt injection resilience, and multi-department overlap.
- **Artifacts Produced**:
  - `backend/seed_demo_data.py` (populates 8 realistic civic scenarios, photo proofs, and duplicate linkages)
  - `backend/eval_benchmark.py` (evaluates 28 ground-truth labelled cases across 5 languages)
  - `backend/eval_results.json` (persisted empirical benchmark metrics)
- **Verification**:
  - Seed execution: Completed with code 0.
  - Evaluation results: Category accuracy 96.4% (27/28), Severity accuracy 92.9% (26/28), Language detection accuracy 100.0% (28/28), Life-safety violations: 0.

---

## Log Entry 6: Final Documentation, Slides, Demo Script & Delivery
- **Timestamp**: 2026-11-21 11:20 IST
- **Phase**: Phase 6 (Documentation & Final Delivery)
- **Tool**: Google Antigravity (Gemini 3.8 Flash)
- **Prompt Summary**:
  Compile comprehensive hackathon deliverables: write-up report ready for PDF export (`WRITEUP.md`), pitch deck slides ready for conversion (`SLIDES.md`), 2-3 minute timed live presentation walkthrough (`DEMO_SCRIPT.md`), finalized project README with exact run/test instructions, and prompt log audit trail.
- **Artifacts Produced**:
  - `WRITEUP.md` (comprehensive 9-section report ready for PDF export)
  - `SLIDES.md` (10-slide presentation deck)
  - `DEMO_SCRIPT.md` (timed 2.5-minute presenter walkthrough covering regional language, photo, duplicate, and dashboard)
  - `PROMPT_LOG.md` (complete audit record of prompts, phases, tools, and outputs)
  - `README.md` (updated quickstart, architecture, and exact evaluation commands)


## Log Entry 4: Officer Console, Dedup Engine, Citizen Tracker & Analytics
- **Timestamp**: 2026-11-21 11:13 IST
- **Phase**: Phases 3 & 4 (Officer Experience, Deduplication & Analytics)
- **Tool**: Google Antigravity (Gemini 3.8 Flash)
- **Prompt Summary**:
  Develop full React + Vite + Tailwind frontend application with dark mode persistence and WCAG AA contrast. Construct Priority Queue view sorted strictly by safety severity (Critical first, then FIFO by age). Build interactive ticket dossier modal supporting photo inspection, AI reasoning review, and auditable manual overrides. Implement geographic and textual duplicate detection engine linking secondary grievances to parent tickets. Develop public citizen tracking view with lifecycle stepper and live municipal analytics engine computing genuine database metrics.
- **Artifacts Produced**:
  - `backend/routes/officer.py` (priority queue, ticket dossier, auditable overrides)
  - `backend/routes/analytics.py` (true computed aggregates for severities, categories, and resolution times)
  - `backend/services/duplicate_detector.py` (Haversine distance and combined SequenceMatcher/token Jaccard deduplication)
  - `backend/tests/test_duplicates.py` (automated verification of deduplication, priority sorting, override auditing, and analytics)
  - `frontend/src/config.js` (`APP_NAME = "CivicLens"`, category mappings)
  - `frontend/src/components/Icons.jsx` (accessible pure SVG icon set; zero emojis used as icons)
  - `frontend/src/components/SeverityBadge.jsx` (dual text + SVG icon severity indicators)
  - `frontend/src/components/StatusBadge.jsx` (accessible ticket status chips)
  - `frontend/src/components/Navbar.jsx` (navigation, branding, and dark mode toggle)
  - `frontend/src/components/ComplaintForm.jsx` (multilingual complaint intake, GPS capture, 5MB client-side image check, loading/offline states)
  - `frontend/src/components/OfficerDashboard.jsx` (officer priority console, KPI cards, multi-faceted filtering, review queue)
  - `frontend/src/components/TicketDetailModal.jsx` (detailed dossier, photo preview, AI reasoning breakdown, duplicate listings, audit logs, and override commit)
  - `frontend/src/components/TrackTicket.jsx` (citizen tracking portal by ID with progress stepper)
  - `frontend/src/components/AnalyticsView.jsx` (real-time municipal analytics dashboard)
- **Verification**:
  - Backend tests: All 27 unit tests passing (100% test pass rate in 0.60s).
  - Frontend build: `npm run build` completed cleanly with zero Rollup/JSX errors.


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

