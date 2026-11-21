# CivicLens: Intelligent Citizen Complaint Triage System

CivicLens is an AI-powered municipal triage platform designed for modern Indian cities. When citizens report civic issues (potholes, garbage, broken streetlights, water pipeline leaks, fallen trees), reports are frequently unstructured, submitted in regional languages, lacking structured classification, or duplicated across wards.

CivicLens turns unstructured citizen submissions (in English, Hindi, Kannada, Tamil, Telugu, Marathi, Bengali, or Hinglish, with optional photographic proof) into structured, prioritized, duplicate-checked, and accurately routed municipal tickets that officers can immediately act upon.

---

## Key Features

1. **Multilingual Intake Engine**: Accepts plain text in regional languages and scripts, transliterated text (Hinglish), or multimodal photo-first complaints. Preserves original text and stores verified English translations.
2. **Safety-First Severity Classification**: Standardized 4-tier rubric (`Critical`, `High`, `Medium`, `Low`) based on imminent danger to life and public safety rather than mere inconvenience.
3. **Automated Departmental Routing**: Configurable rule engine mapping categories to primary and secondary municipal departments without code changes.
4. **Intelligent Duplicate Detection**: Groups incoming complaints against existing open tickets within geographic proximity and semantic similarity, attaching duplicates to parent tickets.
5. **Municipal Officer Dashboard**: High-contrast, WCAG AA compliant operational console sorted strictly by priority. Includes manual override controls with complete audit logging.
6. **Citizen Ticket Tracking**: Public-facing status tracking portal allowing citizens to monitor progress via ticket ID.
7. **Robust Fallback & Safety**: Strict prompt boundaries against injection, PII protection (phone numbers excluded from AI prompts), Pydantic schema validation, and rule-based keyword fallback if AI services are unavailable.

---

## Architecture Overview

```
                      +-----------------------------------+
                      |       Citizen Intake Web UI       |
                      |  (React + Tailwind + Dark Mode)   |
                      +-----------------+-----------------+
                                        | (REST API / JSON / Multipart)
                                        v
                      +-----------------------------------+
                      |        FastAPI Backend App        |
                      |  - PII Protection & Sanitization  |
                      |  - PIL Image Validator/Re-encoder |
                      |  - IP Rate Limiter                |
                      +--------+-----------------+--------+
                               |                 |
                +--------------+                 +---------------+
                |                                                |
                v                                                v
   +-------------------------+                     +---------------------------+
   |   Multimodal Gemini     |                     |    Rule-Based Fallback    |
   |   Structured Output     |                     |    & Duplicate Engine     |
   | (gemini-2.5-flash / Pro)|                     | (Levenshtein + Geo-Dist)  |
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

- **Backend**: Python 3.11+, FastAPI, Pydantic v2, SQLAlchemy, SQLite, Pillow (image sanitization).
- **AI / LLM**: Google Gemini API via `google-genai` SDK / official client with structured schema constraints.
- **Frontend**: React 18, Vite, Tailwind CSS, Lucide icons (pure SVG, no emojis as icons).
- **Testing & Benchmarks**: Pytest, evaluation benchmark with 25+ real-world multilingual test cases.

---

## Setup & Quickstart

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
# Edit .env and supply your GEMINI_API_KEY
```

### 2. Frontend Setup
```bash
# Navigate to frontend directory
cd ../frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

### 3. Running Backend Server
```bash
cd backend
python -m uvicorn main:app --reload --port 8000
```

### 4. Running the Seed Data Script
To populate realistic civic tickets across categories, severities, and languages:
```bash
cd backend
python seed_demo_data.py
```

### 5. Running the AI Evaluation Benchmark
To test accuracy, multilingual capabilities, prompt injection defenses, and fallback routines:
```bash
cd backend
python eval_benchmark.py
```

---

## Environment Variables

| Variable | Description | Default |
|---|---|---|
| `APP_NAME` | Product display name | `CivicLens` |
| `GEMINI_API_KEY` | Google Gemini API Key | *(Required for AI features)* |
| `GEMINI_MODEL` | Gemini Model Identifier | `gemini-2.5-flash` |
| `DATABASE_URL` | SQLite or PostgreSQL connection string | `sqlite:///./civiclens.db` |
| `CORS_ORIGIN` | Allowed web frontend origin | `http://localhost:5173` |
| `UPLOAD_DIR` | Directory for re-encoded citizen uploads | `./uploads` |

---

## AI Disclosure & Prompt Engineering
In adherence to hackathon regulations, all AI interactions, prompts, schema designs, and build logs are documented in [PROMPT_LOG.md](PROMPT_LOG.md).
