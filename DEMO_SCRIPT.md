# CivicLens: 2 to 3 Minute Live Demonstration Script

This script guides the presenter step-by-step through a live jury presentation of CivicLens, showcasing regional language intake, multimodal photo analysis, automatic deduplication, and the officer command console.

---

## Pre-Demo Setup (Do this before presenting)
1. Ensure the backend server is running:
   ```bash
   cd backend
   python -m uvicorn main:app --reload --port 8000
   ```
2. Ensure the frontend server is running:
   ```bash
   cd frontend
   npm run dev
   ```
3. Ensure the database is pre-populated with realistic demo data:
   ```bash
   cd backend
   python seed_demo_data.py
   ```
4. Open the browser to `http://localhost:5173`.

---

## Demo Script Flow (Total Time: ~2.5 Minutes)

### Act 1: Introduction & The Problem (30 Seconds)
- **Speaker Action**: Show the home page of CivicLens.
- **Presenter Dialogue**:
  > *"Respected jury members, in our cities, when a citizen spots an open, fatal manhole or an overflowing garbage pile, they often face a frustrating bureaucratic barrier: forms that only accept English, dropdown menus with confusing departments, and complaints that disappear into black holes. We built CivicLens: an AI-driven municipal triage platform that turns unstructured complaints into prioritized, deduplicated, and actionable tickets in seconds."*

---

### Act 2: Regional Language Intake (45 Seconds)
- **Speaker Action**: Stay on the "Report Grievance" tab. Type or paste this Kannada grievance into the description box:
  ```
  ರಸ್ತೆಯ ಮಧ್ಯದಲ್ಲಿ ಮ್ಯಾನ್‌ಹೋಲ್ ಮುಚ್ಚಳ ಮುರಿದು ಬಿದ್ದಿದೆ, ವಾಹನಗಳು ಬೀಳುವ ಸಂಭವವಿದೆ.
  ```
- **Speaker Action**: Type Location: `100 Feet Road, Indiranagar, Bengaluru`. Click **Submit Grievance**.
- **Presenter Dialogue**:
  > *"Notice that I am submitting this complaint purely in Kannada script describing a broken, open manhole. Within two seconds, CivicLens analyzes the text:
  > 1. It detected the language as Kannada and stored an accurate English translation.
  > 2. Based on our safety-first severity rubric, it automatically classified this as **Critical** priority because an open manhole represents an immediate threat to human life.
  > 3. It automatically routed the ticket to the **Water Supply & Sewerage Board** and the **Traffic Police**."*
- **Speaker Action**: Point to the assigned Ticket ID (e.g., `CL-2611-XXXXX`). Click the **Copy ID** button.

---

### Act 3: Multimodal Photo Complaint & Visual Verification (30 Seconds)
- **Speaker Action**: Click "Submit another complaint".
- **Speaker Action**: Click the upload photo box and choose a sample photo (or use any photo). In the description, type:
  ```
  Minor roadside branches need clearing.
  ```
- **Presenter Dialogue**:
  > *"Now imagine a citizen uploads a photo of a massive fallen tree blocking a highway, but writes a vague or conflicting description. CivicLens doesn't just read the text: it visually inspects the photograph using multimodal Gemini. If the visual proof contradicts the text, it flags the ticket with a prominent 'Needs Review' tag, ensuring officer attention rather than silent failure."*

---

### Act 4: Automatic Deduplication in Action (30 Seconds)
- **Speaker Action**: Submit a report for the same pothole near Sony World signal:
  ```
  Sony World signal ke pass khadda hai bike phisal rahi hai.
  ```
- **Speaker Action**: Location: `Sony World Signal, Koramangala`. Click **Submit**.
- **Presenter Dialogue**:
  > *"When dozens of citizens report the same pothole or burst pipe, traditional systems create separate tickets, overwhelming the officers. In CivicLens, our deduplication engine calculates geographic proximity and semantic similarity. It recognized this as an active grievance already reported 40 meters away, and merged it as a duplicate under the parent ticket, showing a duplicate count rather than creating noise."*

---

### Act 5: Municipal Officer Dashboard & Live Audit Trail (45 Seconds)
- **Speaker Action**: Switch to the **Officer Console** tab.
- **Presenter Dialogue**:
  > *"Now let's step into the shoes of the municipal ward officer.
  > Notice the queue: it is strictly sorted by safety priority. The Critical sparking live wire and open manhole appear at the very top. Cosmetic issues like faded zebra crossings are at the bottom.
  > Every counter you see here is computed from real database records, with zero mock numbers."*
- **Speaker Action**: Click on the top Critical ticket to open the **Ticket Dossier Modal**.
- **Presenter Dialogue**:
  > *"In the ticket dossier, the officer sees the original regional text, the AI-verified English translation, the photo, the AI safety reasoning, and linked duplicates.
  > If the officer needs to override a category or escalate priority, they can do so right here. Crucially, every single override requires a mandatory justification and is permanently stamped in our immutable municipal audit log."*
- **Speaker Action**: Switch briefly to the **Analytics** tab and show the real-time breakdown of workload by department and severity.
- **Presenter Dialogue**:
  > *"CivicLens provides complete transparency from the citizen's mobile screen to the municipal commissioner's desk. Thank you!"*
