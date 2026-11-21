# CivicLens: Intelligent Citizen Complaint Triage System

[![Build Status](https://img.shields.io/badge/Unit%20Tests-27%2F27%20Passing-emerald)](backend/tests/)
[![Category Accuracy](https://img.shields.io/badge/Category%20Accuracy-96.4%25-blue)](backend/eval_results.json)
[![Severity Accuracy](https://img.shields.io/badge/Severity%20Accuracy-92.9%25-blue)](backend/eval_results.json)
[![Safety Violations](https://img.shields.io/badge/Safety%20Violations-0%20(Zero%20Tolerance)-emerald)](backend/eval_results.json)

**CivicLens** is an AI-powered municipal grievance triage and prioritization platform designed for Indian urban local bodies (BBMP, BMC, MCD, GCC). When citizens report civic issues (potholes, garbage, broken streetlights, water pipeline leaks, fallen trees), submissions are frequently unstructured, submitted in regional languages, missing proper departmental routing, or duplicated across wards.

CivicLens turns unstructured citizen submissions (in **English, Hindi, Kannada, Tamil, Telugu, Marathi, Bengali, or Hinglish**, with optional photographic proof and GPS coordinates) into structured, prioritized, deduplicated, and accurately routed municipal tickets that officers can immediately act upon.

---

## Key Features

1. **Multilingual Intake Engine**: Accepts free-form plain text in regional languages and scripts, transliterated colloquial text (Hinglish, Kanglish), or multimodal photo-first complaints. Preserves original text and stores verified English translations.
2. **Safety-First Severity Rubric**: Standardized 4-tier rubric (`Critical`, `High`, `Medium`, `Low`) based strictly on imminent danger to life and bodily safety rather than mere inconvenience.
3. **Automated Departmental Routing**: Configurable rule engine mapping categories to primary and secondary municipal departments without code changes (`backend/departments.json`).
4. **Intelligent Deduplication Engine**: Clusters incoming complaints against existing open tickets within geographic proximity (Haversine distance $\le 300\text{m}$) and semantic similarity, attaching duplicates to parent tickets.
5. **Municipal Officer Dashboard**: High-contrast, WCAG AA compliant operational console sorted strictly by priority. Includes manual override controls with complete audit logging.
6. **Citizen Ticket Tracking**: Public-facing status tracking portal allowing citizens to monitor progress via ticket reference ID with a visual remediation lifecycle stepper.
7. **Real Municipal Analytics**: 100% real persisted data calculating workload, category distributions, severity allocations, and average resolution times.
8. **Robust Fail-Safe & Safety**: Strict prompt boundaries against injection, PII protection (phone numbers excluded from AI prompts), Pydantic v2 schema validation, single-attempt retry, and deterministic rule-based keyword fallback if AI services are unavailable.

---

## Architecture Overview

```
                      +-----------------------------------+
                      |       Citizen Intake Web UI       |
                      |  (React + Tailwind + Dark Mode)   |
                      +-----------------+-----------------+
                                        | (REST API / Multipart Form)
                                        v
                      +-----------------------------------+
                      |        FastAPI Backend App        |
                      |  - PII Protection & Sanitization  |
                      |  - PIL Image Validator/Re-encoder |
                      |  - Sliding-Window IP Rate Limiter |
                      +--------+-----------------+--------+
                               |                 |
                +--------------+                 +---------------+
                |                                                |
                v                                                v
   +-------------------------+                     +---------------------------+
   |   Multimodal Gemini     |                     |    Rule-Based Fallback    |
   |   Structured Output     |                     |    & Duplicate Engine     |
   | (gemini-2.5-flash)      |                     | (Haversine + Token Jaccard)
   +------------+------------+                     +-------------+-------------+
                |                                                |
                +-----------------------+------------------------+
                                        |
                                        v
                      +-----------------------------------+
                      |      SQLite Database (SQLAlchemy) |
                      | - Tickets & Duplicate Links       |
                      | - Audit Logs & Overrides          |
                      +-----------------+-----------------+
                                        |
                                        v
                      +-----------------------------------+
                      |     Officer Dashboard & Track     |
                      |   (Real Metrics, Filter, Audit)   |
                      +-----------------------------------+
```

---

## Tech Stack

- **Backend**: Python 3.11+, FastAPI, Pydantic v2, SQLAlchemy, SQLite, Pillow (image sanitization & metadata stripping).
- **AI / LLM**: Google Gemini API (`gemini-2.5-flash`) via `google-genai` / `google-generativeai` with structured schema enforcement.
- **Frontend**: React 18, Vite 6, Tailwind CSS 3, Accessible pure SVG icons (zero emojis as icons, WCAG AA contrast).
- **Testing & Benchmarks**: Pytest (27 unit tests), 28-case multilingual empirical evaluation benchmark.

---

## Quickstart & Installation

### Prerequisites
- Python 3.11+
- Node.js 18+ and npm

### 1. Backend Setup
```bash
# Navigate to backend directory
cd backend

# Create and activate virtual environment
python -m venv venv

# On Windows:
.\venv\Scripts\activate
# On Linux/macOS:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Configure environment variables
cp ../.env.example .env
# Edit .env and supply your GEMINI_API_KEY (optional: fallback works offline without a key)
```

### 2. Frontend Setup
```bash
# In a separate terminal, navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```
The frontend will start at **http://localhost:5173**.

### 3. Start Backend Server
```bash
cd backend
python -m uvicorn main:app --reload --port 8000
```
The backend API server will start at **http://127.0.0.1:8000** (Swagger documentation available at `http://127.0.0.1:8000/docs`).

### 4. Populate Realistic Demo Data
To populate sample grievances across English, Hindi, Kannada, Tamil, Hinglish, photo proofs, and duplicate tickets:
```bash
cd backend
python seed_demo_data.py
```

### 5. Run the Automated Unit Tests
To verify all 27 unit tests (intake validation, 5MB image limit, severity rubric, injection defense, deduplication, officer overrides, and analytics):
```bash
cd backend
python -m pytest tests/ -v
```

### 6. Run the 28-Case Multilingual AI Evaluation Benchmark
To benchmark accuracy across English, Hindi, Kannada, Tamil, and Hinglish complaints:
```bash
cd backend
python eval_benchmark.py
```

---

## Environment Variables

| Variable | Description | Default |
|---|---|---|
| `APP_NAME` | Product display name (single config constant) | `CivicLens` |
| `GEMINI_API_KEY` | Google Gemini API Key | *(Optional, fallback active if blank)* |
| `GEMINI_MODEL` | Gemini Model Identifier | `gemini-2.5-flash` |
| `DATABASE_URL` | SQLite database path | `sqlite:///./civiclens.db` |
| `CORS_ORIGIN` | Allowed web frontend origin | `http://localhost:5173` |
| `UPLOAD_DIR` | Directory for re-encoded citizen uploads | `./uploads` |

---

## Hackathon Deliverables

- [WRITEUP.md](WRITEUP.md) &mdash; Comprehensive 9-section report ready to export to PDF covering problem understanding, architecture, AI engineering, safety rubric, evaluation, limitations, and future work.
- [SLIDES.md](SLIDES.md) &mdash; 10-slide pitch deck ready for conversion to PDF.
- [DEMO_SCRIPT.md](DEMO_SCRIPT.md) &mdash; 2.5-minute presenter walkthrough covering regional language intake, multimodal photo analysis, automatic deduplication, and officer dashboard.
- [PROMPT_LOG.md](PROMPT_LOG.md) &mdash; Complete prompt audit log recording timestamps, tools, and produced artifacts in compliance with hackathon regulations.
