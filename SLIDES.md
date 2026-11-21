# CivicLens: Intelligent Municipal Grievance Triage System
## Pitch Deck & Presentation Slides (Prompt to Product Hackathon)

---

### Slide 1: Title & Vision
# CivicLens
### Intelligent AI Triage & Safety-First Prioritization for Indian Cities
- **Presenter**: Team CivicLens
- **Hackathon Track**: Prompt to Product &bull; AI for Public Governance
- **Core Mission**: Transforming unstructured citizen complaints into structured, prioritized, deduplicated, and immediately actionable municipal tickets.

---

### Slide 2: The Urban Grievance Crisis
# The Problem: Bureaucratic Paralysis in Indian Cities
- **Multilingual Barrier**: Citizens report in Hindi, Kannada, Tamil, Telugu, or Hinglish, but civic dashboards require manual translation.
- **Departmental Misrouting**: Citizens do not know municipal jurisdictions. Reports get bounced across departments for weeks.
- **Inconvenience vs Life-Safety**: Faded zebra crossings get the same priority as open, fatal manholes and sparking high-voltage wires.
- **Duplicate Tsunami**: When a water main ruptures, 50 citizens file redundant complaints, flooding the officer queue.

---

### Slide 3: The CivicLens Solution
# CivicLens: AI That Understands Civic Ground Reality
- **Zero-Friction Intake**: Citizens write freely in any regional language or upload a photo with GPS.
- **Safety-First Rubric**: Imminent risk to human life strictly outweighs public inconvenience.
- **Automated Routing**: Dynamic mapping of grievances to primary and secondary municipal agencies.
- **Intelligent Deduplication**: Merges complaints within 300 meters into a single actionable parent ticket.
- **Officer Command Console**: Priority-sorted dispatch dashboard with full audit trail.

---

### Slide 4: System Architecture
# Modern, Resilient, Accessible Architecture
```
[Citizen Intake Form] ──> [FastAPI Backend Gateway] ──> [Gemini 2.5 Flash]
 (React + Tailwind)        (Pillow Image Sanitizer)      (Structured Schema)
                                   │                              │
                                   ▼                              ▼
                         [Deduplication Engine] <── [Rule Fallback Engine]
                         (Haversine + Jaccard)       (Zero-Downtime Guard)
                                   │
                                   ▼
                         [SQLAlchemy SQLite DB]
                                   │
                                   ▼
                      [Officer Priority Console]
```
- **Backend**: Python FastAPI, Pydantic v2, SQLAlchemy, SQLite, Pillow
- **AI**: Google Gemini API (Multimodal JSON Schema) + Multilingual Keyword Fallback
- **Frontend**: React 18, Vite, Tailwind CSS, Pure Accessible SVG Icons

---

### Slide 5: AI Design & Prompt Security
# Robust AI Engineering & Injection Defense
- **Strict Boundary Delimitation**: Untrusted user text is isolated in `<citizen_complaint_text>` tags to block jailbreaks and overrides.
- **PII Defense**: Citizen phone numbers are strictly preserved in the database and never passed to the LLM.
- **Multimodal Visual Verification**: Gemini inspects the photo. If visual proof contradicts the text (e.g. text says "grass" but photo shows a fallen tree), it sets a `needs_review` flag with explanation.
- **Graceful Fallback**: Automatic single retry on validation error; seamless fallback to deterministic regex classifier if API is offline. The system never crashes.

---

### Slide 6: Safety-First Severity Rubric
# Life-Safety Risk Strictly Outweighs Inconvenience
- **Critical (Immediate 1-2h Dispatch)**:
  - Exposed live electric wires, open manholes on active roads, water main burst undermining roads, fallen trees blocking arterial highways.
- **High (Urgent Response)**:
  - Deep crater potholes causing accidents, raw sewage backflow into homes, aggressive stray dog packs near schools.
- **Medium (Routine Maintenance)**:
  - Overflowing garbage bins (2-3 days), residential streetlights out, minor pipeline drips.
- **Low (Cosmetic)**:
  - Faded zebra crossing paint, park bench weathering, minor wall posters.

---

### Slide 7: Deduplication & Auditability
# Eliminating Redundancy with Complete Accountability
- **Spatial + Semantic Deduplication**:
  - Compares complaints within 300-meter radius (Haversine formula).
  - Evaluates token Jaccard & sequence similarity.
  - Automatically links duplicates to parent ticket and tracks duplicate count (`+X dup`).
- **Complete Officer Audit Trail**:
  - Every status progression and manual override (category, severity, department) is logged in the `audit_logs` database table with timestamp, officer identity, and justification.

---

### Slide 8: Empirical Evaluation Results
# Rigorous Testing Across 5 Indian Languages
- **Benchmark Size**: 28 ground-truth labelled civic grievances (English, Hindi, Kannada, Tamil, Hinglish, Adversarial cases).
- **Key Metrics**:
  - **Category Accuracy**: **96.4%** (27/28)
  - **Severity Rubric Accuracy**: **92.9%** (26/28)
  - **Language Detection Accuracy**: **100.0%** (28/28)
  - **Life-Safety Downgrade Violations**: **0** (Zero tolerance for safety failures!)
- **Prompt Injection Resilience**: System successfully resisted adversarial override attempts and accurately flagged hazards.

---

### Slide 9: Limitations & Production Roadmap
# Honest Limitations & Next Horizons
- **Current Limitations**:
  - Open prototype officer console without authentication (designed for rapid jury demo).
  - Browser-based GPS accuracy dependent on device hardware.
  - Maximum 5 MB per image upload.
- **Production Roadmap**:
  - WhatsApp & IVR voice hotline integration (dial-in voice complaints in rural dialects).
  - GIS geospatial map view with pothole and waste density heatmaps.
  - Automated contractor SLA escalation alerts to Zonal Commissioners.
  - Edge AI mobile application for field inspectors to verify work completion.

---

### Slide 10: Conclusion
# CivicLens: Built for Responsive Municipal Governance
- **Tested & Proven**: 27/27 automated unit tests passed &bull; 96.4% classification accuracy.
- **Real-World Impact**: Accelerates critical emergency dispatch from days to minutes.
- **Citizen Empowerment**: Every Indian citizen can report grievances in their mother tongue with dignity and transparency.

**Thank you! Questions?**
