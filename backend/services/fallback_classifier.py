"""
CivicLens Rule-Based Fallback Classifier
Used whenever the Gemini API is unreachable, unconfigured, or returns invalid schemas.
Provides multilingual keyword matching across Indian languages and severity heuristic evaluation.
"""

import re
from typing import Optional, Tuple
from schemas import AIClassificationOutput

# Keyword dictionaries mapping category to multilingual lexical tokens
CATEGORY_KEYWORDS = {
    "roads": [
        "pothole", "gadda", "raste", "saalai", "road", "tar", "asphalt", "crater", "footpath",
        "pavement", "divider", "speed breaker", "highway", "gaddha", "khadda", "salai", "hadi",
        "zebra crossing", "crossing", "markings", "lane",
        "ಗುಂಡಿ", "ಖಡ್ಡಾ", "गड्ढा", "சாலை", "குழி"
    ],
    "waste": [
        "garbage", "kachra", "kachada", "trash", "dustbin", "waste", "rubbish", "dump", "stench",
        "smell", "rotting", "litter", "kuppai", "kachre", "dehr", "dabba", "bin",
        "ಕಸ", "ತಿಪ್ಪೆ", "ಕಸದ", "कचरा", "कूड़ा", "कचरे", "குப்பை"
    ],
    "water supply": [
        "water", "paani", "neeru", "thanni", "pipe", "pipeline", "burst", "leak", "tap",
        "contamination", "drinking water", "jal", "kaveri", "boring", "motor", "pressure",
        "ನೀರು", "ಕೊಳವೆ", "ಕುಡಿಯುವ", "ಪೈಪ್", "पानी", "नल", "जल", "தண்ணீர்", "குழாய்", "குடிநீர்"
    ],
    "sewage and drainage": [
        "sewage", "drain", "drainage", "manhole", "gutter", "naala", "chamber", "overflow",
        "clogged", "blocked drain", "gutter cover", "foul water", "stinking water",
        "ಚರಂಡಿ", "ಮ್ಯಾನ್‌ಹೋಲ್", "ಮ್ಯಾನ್ಹೋಲ್", "गटर", "नाली", "सीवेज", "मैनहोल", "मेनहोल", "சாக்கடை", "மேன்ஹோல்"
    ],
    "electricity and streetlights": [
        "streetlight", "street light", "light", "lamp", "pole", "wire", "cable", "current", "shock", "spark",
        "transformer", "blackout", "dark", "electricity", "meter", "bijli", "vidyut",
        "ಬೆಳಕು", "ವಿದ್ಯುತ್", "ತಂತಿ", "ವೈರ್", "ಕಂಬ", "बिजली", "करंट", "स्ट्रीट लाइट", "மின்சாரம்", "விளக்கு", "தெருவிளக்கு"
    ],
    "trees and parks": [
        "tree", "branch", "mara", "maram", "ped", "leaves", "park", "garden", "fallen tree",
        "overgrown", "bough", "uprooted", "pruning",
        "ಮರ", "ಗಿಡ", "ಉದ್ಯಾನ", "ಕೊಂಬೆ", "ಎಲೆ", "पेड़", "शाखा", "पार्क", "बेंच", "மரம்", "பூங்கா", "கிளை"
    ],
    "encroachment": [
        "encroachment", "illegal", "vendor", "stall", "hawker", "kabza", "footpath blocked",
        "unauthorized", "shopkeeper", "squatter", "shed", "construction",
        "ಅಕ್ರಮ", "कब्जा", "अतिक्रमण", "ஆக்கிரமிப்பு"
    ],
    "noise and pollution": [
        "noise", "loudspeaker", "pollution", "smoke", "dust", "factory", "fumes", "burning",
        "air", "sound", "decibel", "chemical smell", "cracker",
        "ಮಾಲಿನ್ಯ", "ಶಬ್ದ", "ಹೊಗೆ", "ಪ್ರದೂಷಣೆ", "प्रदूषण", "शोर", "ध्वनि", "धुआं", "आग", "மாசு", "புகை"
    ],
    "stray animals": [
        "dog", "stray", "bite", "barking", "rabies", "puppy", "cattle", "cow", "monkey",
        "animal", "bhow", "hucchu", "kutta", "nai",
        "ನಾಯಿ", "ದನ", "ಕುಕ್ಕಲು", "ಕುನ್ನಿ", "ಕುত্তা", "कुत्ता", "कुत्तों", "गाय", "விலங்கு", "நாய்", "வெறிநாய்"
    ]
}

# Critical life-safety indicator phrases
CRITICAL_TRIGGERS = [
    "live wire", "exposed wire", "sparking", "open manhole", "broken manhole", "cave in",
    "burst main", "major burst", "gas leak", "chemical leak", "danger to life", "risk to life",
    "shock hazard", "current shock", "arterial road blocked", "collapsed wall",
    "करंट", "खुला मैनहोल", "खुला मेनहोल", "तार टूटा", "जान जा सकती", "ಲೈವ್ ವೈರ್", "ತೆರೆದ ಮ್ಯಾನ್‌ಹೋಲ್",
    "ಉಯಿರುಕ್ಕು ಆಪತ್ತು", "உயிருக்கு ஆபத்து", "மேன்ஹோல்", "ಬಂದ್ ಆಗಿದೆ"
]

# High safety & health risk phrases
HIGH_TRIGGERS = [
    "deep crater", "accident", "slip", "hospital", "school", "sewage in house", "water contamination",
    "dirty water", "foul smell water", "aggressive dog", "dog bite", "rabies", "flooding", "waterlogging",
    "knee deep", "dangling branch", "hanging branch", "blackout",
    "काटने", "काट रहा", "जहरीला", "धुआं", "ಒಡೆದು", "ನದಿಯಂತೆ", "ಕಲಬೆರಕೆ", "கடிக்க", "துர்நாற்றம்", "வெறிநாய்",
    "ghis gaya", "phisl", "hospital le jana"
]

# Low cosmetic phrases
LOW_TRIGGERS = [
    "faded", "paint", "zebra crossing", "aesthetic", "bench", "leaf litter", "graffiti",
    "poster", "minor scratch", "cleaning needed", "cosmetic",
    "पेंट", "हिल रहा", "ಒಣಗಿದ ಎಲೆ", "ಕಳೆ", "மங்கிவிட்டன"
]

def detect_script_language(text: str) -> str:
    """Detects Indian language script or default Latin transliteration."""
    if not text:
        return "English"
    if re.search(r"[\u0C80-\u0CFF]", text):
        return "Kannada"
    if re.search(r"[\u0900-\u097F]", text):
        return "Hindi"
    if re.search(r"[\u0B80-\u0BFF]", text):
        return "Tamil"
    if re.search(r"[\u0C00-\u0C7F]", text):
        return "Telugu"
    if re.search(r"[\u0980-\u09FF]", text):
        return "Bengali"
    if re.search(r"\b(hai|mein|mera|nahi|karo|bhai|yaar|bohot|idhar|paani|gadda|kachra)\b", text, re.IGNORECASE):
        return "Hinglish"
    return "English"

def classify_with_fallback_rules(raw_text: Optional[str], has_photo: bool = False) -> AIClassificationOutput:
    """
    Deterministically triage citizen complaints using keyword frequencies,
    script detection, and priority trigger evaluation.
    """
    text_lower = (raw_text or "").lower()
    language = detect_script_language(raw_text or "")

    # 1. Determine Category
    scores = {}
    for category, keywords in CATEGORY_KEYWORDS.items():
        score = sum(1 for kw in keywords if kw in text_lower)
        if score > 0:
            scores[category] = score

    if scores:
        best_category = max(scores, key=scores.get)
    else:
        best_category = "other"

    # 2. Determine Severity
    assigned_severity = "Medium"
    reason = "Standard municipal maintenance issue with moderate local civic impact."

    # Check for Critical triggers
    for trig in CRITICAL_TRIGGERS:
        if trig in text_lower:
            assigned_severity = "Critical"
            reason = f"Imminent public safety hazard detected: identified life-safety risk keyword '{trig}'."
            break

    # If not Critical, check High triggers
    if assigned_severity == "Medium":
        for trig in HIGH_TRIGGERS:
            if trig in text_lower:
                assigned_severity = "High"
                reason = f"Elevated public safety or health hazard identified: trigger keyword '{trig}'."
                break

    # Check for Low triggers if no elevated triggers were found
    if assigned_severity == "Medium":
        for trig in LOW_TRIGGERS:
            if trig in text_lower:
                assigned_severity = "Low"
                reason = f"Routine cosmetic or aesthetic civic maintenance: trigger keyword '{trig}'."
                break

    # Photo-only without text fallback
    if not raw_text and has_photo:
        best_category = "roads"
        assigned_severity = "Medium"
        reason = "Photo-only submission queued for officer inspection (AI offline)."

    return AIClassificationOutput(
        category=best_category,
        severity=assigned_severity,
        severity_reason=reason,
        detected_language=language,
        translated_text=raw_text if raw_text else "[Photo submitted without text description]",
        confidence_score=0.55,
        photo_summary="Visual artifact present" if has_photo else None,
        photo_text_discrepancy=False,
        discrepancy_explanation=None,
        secondary_department=None
    )
