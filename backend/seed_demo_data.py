"""
CivicLens Seed Demo Data Script
Populates realistic municipal tickets across all 10 categories,
multiple Indian languages (English, Hindi, Kannada, Tamil, Hinglish),
varied severities, duplicate groups, and review flags.
"""

import os
import io
import uuid
from datetime import datetime, timedelta, timezone
from PIL import Image, ImageDraw

from config import BASE_DIR, UPLOAD_DIR, DEPARTMENTS
from database import engine, SessionLocal, Base
from models import Ticket, AuditLog

def create_sample_photo(filename: str, label: str, color=(200, 200, 200)) -> str:
    """Creates a realistic placeholder civic inspection photo."""
    UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
    img = Image.new("RGB", (640, 480), color=color)
    draw = ImageDraw.Draw(img)
    
    # Draw simple civic visual indicator
    draw.rectangle([20, 20, 620, 460], outline=(100, 100, 100), width=4)
    draw.text((40, 40), f"CivicLens On-Site Inspection Evidence", fill=(30, 30, 30))
    draw.text((40, 80), f"Subject: {label}", fill=(40, 40, 40))
    draw.text((40, 120), f"Timestamp: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}", fill=(60, 60, 60))
    
    filepath = UPLOAD_DIR / filename
    img.save(filepath, format="JPEG", quality=85)
    return f"/uploads/{filename}"

def seed_demo_data():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    # Clear existing data for fresh demo seed
    db.query(AuditLog).delete()
    db.query(Ticket).delete()
    db.commit()

    now = datetime.now(timezone.utc)

    # 1. Critical Live Wire (Electricity) - Hindi
    img_wire = create_sample_photo("seed_wire.jpg", "Sparking High Voltage Wire", color=(255, 230, 230))
    t1 = Ticket(
        id="CL-2611-C1001",
        created_at=now - timedelta(hours=1, minutes=15),
        updated_at=now - timedelta(hours=1, minutes=15),
        raw_text="स्कूल के बाहर बिजली का नंगा तार टूट कर गिर गया है और उसमें से चिंगारी निकल रही है। बहुत खतरा है!",
        detected_language="Hindi",
        translated_text="An exposed live electric wire has fallen outside the school and is sparking dangerously. Extreme risk to children!",
        has_photo=True,
        photo_path=img_wire,
        location_text="Opposite Govt High School, 8th Main, Malleshwaram",
        latitude=13.0031,
        longitude=77.5643,
        contact_number="+91 9845112233",
        category="electricity and streetlights",
        severity="Critical",
        severity_reason="Exposed live high-voltage wire sparking directly outside school entrance constitutes an immediate life-safety emergency.",
        primary_department="Electricity Supply Company",
        secondary_department="Disaster Management Cell",
        status="assigned",
        assigned_officer="Emergency Dispatch Unit 4",
        confidence_score=0.98,
        needs_review=False,
        ai_classification_method="gemini_multimodal",
        is_duplicate=False,
        duplicate_count=0
    )
    db.add(t1)

    # 2. Critical Open Manhole (Sewage) - Kannada
    img_manhole = create_sample_photo("seed_manhole.jpg", "Uncovered Deep Drainage Chamber", color=(230, 230, 240))
    t2 = Ticket(
        id="CL-2611-C1002",
        created_at=now - timedelta(hours=2, minutes=30),
        updated_at=now - timedelta(hours=2, minutes=30),
        raw_text="ರಸ್ತೆಯ ಮಧ್ಯದಲ್ಲಿ ಮ್ಯಾನ್‌ಹೋಲ್ ಮುಚ್ಚಳ ಮುರಿದು ಬಿದ್ದಿದೆ, ವಾಹನಗಳು ಬೀಳುವ ಸಂಭವವಿದೆ.",
        detected_language="Kannada",
        translated_text="Manhole cover is broken and wide open in the middle of the road, vehicles and pedestrians at risk of falling inside.",
        has_photo=True,
        photo_path=img_manhole,
        location_text="100 Feet Road, near CMH Hospital, Indiranagar",
        latitude=12.9784,
        longitude=77.6408,
        contact_number="+91 9900112233",
        category="sewage and drainage",
        severity="Critical",
        severity_reason="Open, uncovered manhole chamber on busy thoroughfare poses imminent threat of fatal falls and severe vehicular accidents.",
        primary_department="Water Supply & Sewerage Board",
        secondary_department="Traffic Management & Police",
        status="in_progress",
        assigned_officer="Ward Inspector S. Kumar",
        confidence_score=0.97,
        needs_review=False,
        ai_classification_method="gemini_multimodal",
        is_duplicate=False,
        duplicate_count=0
    )
    db.add(t2)

    # 3. High Severity Deep Pothole (Roads) - English
    img_pothole = create_sample_photo("seed_pothole.jpg", "Deep Arterial Crater", color=(240, 235, 230))
    t3 = Ticket(
        id="CL-2611-H1003",
        created_at=now - timedelta(hours=4),
        updated_at=now - timedelta(hours=3),
        raw_text="Huge 2-foot deep crater pothole near Sony World Signal. Two motorcyclists skidded and slipped this morning.",
        detected_language="English",
        translated_text="Huge 2-foot deep crater pothole near Sony World Signal. Two motorcyclists skidded and slipped this morning.",
        has_photo=True,
        photo_path=img_pothole,
        location_text="Sony World Junction, 80 Feet Road, Koramangala",
        latitude=12.9345,
        longitude=77.6265,
        contact_number="+91 9741223344",
        category="roads",
        severity="High",
        severity_reason="Deep crater pothole on high-speed arterial junction already causing vehicular slips and accidents.",
        primary_department="Public Works Department",
        secondary_department="Traffic Management & Police",
        status="new",
        confidence_score=0.95,
        needs_review=False,
        ai_classification_method="gemini_multimodal",
        is_duplicate=False,
        duplicate_count=1  # Has one child duplicate
    )
    db.add(t3)
    db.commit()

    # 3b. Duplicate of t3 (Same pothole reported nearby in Hinglish)
    t3_dup = Ticket(
        id="CL-2611-D1004",
        created_at=now - timedelta(hours=1),
        updated_at=now - timedelta(hours=1),
        raw_text="Sony World signal ke pass bohot bada khadda hai, bike gir rahi hai jaldi theek karo.",
        detected_language="Hinglish",
        translated_text="There is a very large pothole near Sony World signal, bikes are falling down, please fix quickly.",
        has_photo=False,
        location_text="Sony World Signal, Koramangala 4th Block",
        latitude=12.9348,
        longitude=77.6268,
        contact_number="+91 9880011223",
        category="roads",
        severity="High",
        severity_reason="Severe pothole causing accidents.",
        primary_department="Public Works Department",
        status="new",
        confidence_score=0.92,
        needs_review=False,
        ai_classification_method="gemini_text",
        parent_ticket_id=t3.id,
        is_duplicate=True,
        duplicate_count=0
    )
    db.add(t3_dup)

    # 4. Discrepancy Ticket flagged for "needs_review"
    # Citizen says "minor garden grass", but photo shows fallen tree across road
    img_tree = create_sample_photo("seed_discrepancy.jpg", "Fallen Banyan Tree Blocking Road", color=(220, 240, 220))
    t4 = Ticket(
        id="CL-2611-R1005",
        created_at=now - timedelta(hours=5),
        updated_at=now - timedelta(hours=5),
        raw_text="Just some grass trimmings need sweeping outside our society gate.",
        detected_language="English",
        translated_text="Just some grass trimmings need sweeping outside our society gate.",
        has_photo=True,
        photo_path=img_tree,
        location_text="Outer Ring Road, Marathahalli",
        latitude=12.9567,
        longitude=77.7011,
        category="trees and parks",
        severity="High",
        severity_reason="Visual evidence shows massive fallen tree blocking traffic lanes, contradicting citizen claim of minor grass.",
        primary_department="Horticulture & Forest Department",
        secondary_department="Disaster Management Cell",
        status="new",
        confidence_score=0.88,
        needs_review=True,
        review_reason="Photo and text discrepancy: visual photo shows massive fallen tree blocking traffic lanes, contradicting text describing minor grass trimmings.",
        ai_classification_method="gemini_multimodal",
        is_duplicate=False,
        duplicate_count=0
    )
    db.add(t4)

    # 5. Medium Severity Overflowing Garbage (Waste) - Tamil
    t5 = Ticket(
        id="CL-2611-M1006",
        created_at=now - timedelta(hours=8),
        updated_at=now - timedelta(hours=8),
        raw_text="தெருவில் குப்பை தொட்டி நிரம்பி வழிகிறது, கடும் துர்நாற்றம் வீசுகிறது.",
        detected_language="Tamil",
        translated_text="The garbage bin on the street is overflowing and a terrible foul smell is spreading across the lane.",
        has_photo=False,
        location_text="5th Cross, Austin Town",
        latitude=12.9612,
        longitude=77.6189,
        category="waste",
        severity="Medium",
        severity_reason="Overflowing municipal garbage bin creating localized hygiene nuisance without acute danger to life.",
        primary_department="Solid Waste Management",
        secondary_department="Public Health & Sanitation",
        status="assigned",
        assigned_officer="Sanitation Supervisor Muniswamy",
        confidence_score=0.94,
        needs_review=False,
        ai_classification_method="gemini_text",
        is_duplicate=False,
        duplicate_count=0
    )
    db.add(t5)

    # 6. Low Severity Faded Zebra Crossing (Roads) - English
    t6 = Ticket(
        id="CL-2611-L1007",
        created_at=now - timedelta(hours=14),
        updated_at=now - timedelta(hours=14),
        raw_text="Zebra crossing white paint is faded in front of the community park entrance.",
        detected_language="English",
        translated_text="Zebra crossing white paint is faded in front of the community park entrance.",
        has_photo=False,
        location_text="Kanakapura Road, 7th Block Jayanagar",
        latitude=12.9245,
        longitude=77.5812,
        category="roads",
        severity="Low",
        severity_reason="Cosmetic road surface marking fading with negligible immediate safety hazard.",
        primary_department="Public Works Department",
        status="new",
        confidence_score=0.96,
        needs_review=False,
        ai_classification_method="gemini_text",
        is_duplicate=False,
        duplicate_count=0
    )
    db.add(t6)

    # 7. Resolved Ticket (Water Supply) - for Analytics resolution time!
    resolved_time = now - timedelta(hours=2)
    created_time = now - timedelta(hours=6, minutes=30)
    t7 = Ticket(
        id="CL-2611-S1008",
        created_at=created_time,
        updated_at=resolved_time,
        raw_text="Main potable water pipe valve leaking heavily, wasting clean drinking water on 27th Main.",
        detected_language="English",
        translated_text="Main potable water pipe valve leaking heavily, wasting clean drinking water on 27th Main.",
        has_photo=False,
        location_text="27th Main, Sector 1, HSR Layout",
        latitude=12.9121,
        longitude=77.6445,
        category="water supply",
        severity="Medium",
        severity_reason="Potable water pipe leakage wasting clean municipal supply.",
        primary_department="Water Supply & Sewerage Board",
        status="resolved",
        assigned_officer="Water Board Asst Engineer Ramesh",
        resolution_notes="Damaged brass sluice valve replaced and pipeline pressure tested successfully. Zero leakage.",
        resolved_at=resolved_time,
        confidence_score=0.95,
        needs_review=False,
        ai_classification_method="gemini_text",
        is_duplicate=False,
        duplicate_count=0
    )
    db.add(t7)

    # 8. Stray Animals Pack near School - Telugu / Hinglish
    t8 = Ticket(
        id="CL-2611-H1009",
        created_at=now - timedelta(hours=3, minutes=10),
        updated_at=now - timedelta(hours=3, minutes=10),
        raw_text="వీధి కుక్కలు గుಂಪುగా వచ్చి చిన్న పిల్లల మీద మొరుగుతున్నాయి, కరిచే ప్రమాదం ఉంది.",
        detected_language="Telugu",
        translated_text="Pack of stray dogs barking aggressively at young school children, serious risk of dog bites.",
        has_photo=False,
        location_text="Near Vidya Mandir School, Hebbal",
        latitude=13.0358,
        longitude=77.5970,
        category="stray animals",
        severity="High",
        severity_reason="Aggressive pack of stray dogs barking at children near school perimeter poses serious bite and rabies risk.",
        primary_department="Animal Husbandry & Veterinary Services",
        secondary_department="Public Health & Sanitation",
        status="new",
        confidence_score=0.93,
        needs_review=False,
        ai_classification_method="gemini_text",
        is_duplicate=False,
        duplicate_count=0
    )
    db.add(t8)

    db.commit()

    # Add audit log entries for overrides and duplicates
    db.add(AuditLog(
        ticket_id=t3.id,
        action="duplicate_linked",
        field_changed="duplicate_count",
        old_value="0",
        new_value="1",
        reason=f"Linked duplicate grievance {t3_dup.id} (Proximity 45m and 88% text similarity)",
        officer_name="Automated Deduplication Engine",
        created_at=now - timedelta(hours=1)
    ))

    db.add(AuditLog(
        ticket_id=t7.id,
        action="status_change",
        field_changed="status",
        old_value="in_progress",
        new_value="resolved",
        reason="Field repair completed: Damaged valve replaced and pressurized.",
        officer_name="Water Board Asst Engineer Ramesh",
        created_at=resolved_time
    ))

    db.commit()
    db.close()
    print("CivicLens demo database seeded successfully with realistic municipal tickets!")

if __name__ == "__main__":
    seed_demo_data()
