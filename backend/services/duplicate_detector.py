"""
CivicLens Intelligent Duplicate Detection Service
Scans active civic tickets within category, geographic proximity, and textual similarity
to automatically link duplicate grievances to their parent tickets.
"""

import math
from difflib import SequenceMatcher
from typing import Optional, Tuple
from sqlalchemy.orm import Session

from models import Ticket, AuditLog

def haversine_distance_meters(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Calculates great-circle distance between two GPS coordinates in meters."""
    R = 6371000.0  # Earth radius in meters
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    delta_phi = math.radians(lat2 - lat1)
    delta_lambda = math.radians(lon2 - lon1)

    a = math.sin(delta_phi / 2.0) ** 2 + math.cos(phi1) * math.cos(phi2) * math.sin(delta_lambda / 2.0) ** 2
    c = 2.0 * math.atan2(math.sqrt(a), math.sqrt(1.0 - a))
    return R * c

def compute_text_similarity(str1: Optional[str], str2: Optional[str]) -> float:
    """Computes combined token Jaccard and character sequence similarity."""
    if not str1 or not str2:
        return 0.0
    s1 = str1.strip().lower()
    s2 = str2.strip().lower()
    
    char_sim = SequenceMatcher(None, s1, s2).ratio()
    
    # Token Jaccard similarity ignoring 1-2 char noise
    tokens1 = set(w for w in s1.replace(",", " ").replace(".", " ").split() if len(w) > 2)
    tokens2 = set(w for w in s2.replace(",", " ").replace(".", " ").split() if len(w) > 2)
    
    if not tokens1 or not tokens2:
        return char_sim
        
    jaccard = len(tokens1 & tokens2) / len(tokens1 | tokens2)
    return max(char_sim, jaccard)

def check_and_link_duplicate(
    db: Session,
    new_ticket: Ticket,
    geo_threshold_meters: float = 300.0,
    text_threshold: float = 0.25
) -> Optional[Ticket]:
    """
    Evaluates candidate open tickets in the same category.
    If a close match in proximity and description is identified,
    links new_ticket as a duplicate child of the existing parent ticket.
    """
    # Look for active open tickets in the same category
    candidates = (
        db.query(Ticket)
        .filter(
            Ticket.id != new_ticket.id,
            Ticket.category == new_ticket.category,
            Ticket.status != "resolved",
            Ticket.is_duplicate == False
        )
        .all()
    )

    best_match: Optional[Ticket] = None
    best_match_reason = ""

    for candidate in candidates:
        is_geo_near = False
        dist_m = None

        # 1. Coordinate-based proximity check
        if (
            new_ticket.latitude is not None and new_ticket.longitude is not None and
            candidate.latitude is not None and candidate.longitude is not None
        ):
            dist_m = haversine_distance_meters(
                new_ticket.latitude, new_ticket.longitude,
                candidate.latitude, candidate.longitude
            )
            if dist_m <= geo_threshold_meters:
                is_geo_near = True

        # 2. Location text similarity check if coordinates absent
        if not is_geo_near and new_ticket.location_text and candidate.location_text:
            loc_sim = compute_text_similarity(new_ticket.location_text, candidate.location_text)
            if loc_sim >= 0.60:
                is_geo_near = True

        # 3. Text description similarity check
        text_sim = compute_text_similarity(
            new_ticket.translated_text or new_ticket.raw_text,
            candidate.translated_text or candidate.raw_text
        )

        # Matching criteria:
        # A) Within 300m and text similarity >= 0.50
        # B) High text similarity (>= 0.78) and same location text
        if is_geo_near and text_sim >= text_threshold:
            best_match = candidate
            best_match_reason = f"Proximity ({f'{dist_m:.0f}m' if dist_m else 'same location'}) and text similarity ({text_sim*100:.1f}%)"
            break
        elif text_sim >= 0.85:
            best_match = candidate
            best_match_reason = f"High textual similarity ({text_sim*100:.1f}%) in category {new_ticket.category}"
            break

    if best_match:
        # Link new ticket to parent
        new_ticket.is_duplicate = True
        new_ticket.parent_ticket_id = best_match.id

        # Update parent duplicate tally
        best_match.duplicate_count += 1

        # Audit log on parent ticket
        db.add(AuditLog(
            ticket_id=best_match.id,
            action="duplicate_linked",
            field_changed="duplicate_count",
            old_value=str(best_match.duplicate_count - 1),
            new_value=str(best_match.duplicate_count),
            reason=f"Linked duplicate grievance {new_ticket.id} ({best_match_reason})",
            officer_name="Automated Deduplication Engine"
        ))

        db.commit()
        return best_match

    return None
