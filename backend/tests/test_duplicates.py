"""
Test suite for CivicLens Duplicate Detection and Officer Operations.
"""

import pytest

def test_duplicate_detection_links_to_parent(client):
    # 1. Citizen A submits pothole on MG Road
    res1 = client.post(
        "/api/complaints",
        data={
            "raw_text": "Huge dangerous pothole near Metro Station on MG Road",
            "location_text": "MG Road Metro Station",
            "latitude": 12.9756,
            "longitude": 77.6067
        }
    )
    assert res1.status_code == 201
    parent_id = res1.json()["id"]
    assert res1.json()["is_duplicate"] is False
    assert res1.json()["duplicate_count"] == 0

    # 2. Citizen B submits report for the same pothole within 50 meters
    res2 = client.post(
        "/api/complaints",
        data={
            "raw_text": "Large pothole in front of MG Road Metro, bikes slipping",
            "location_text": "MG Road Metro Pillar 42",
            "latitude": 12.9758,
            "longitude": 77.6069
        }
    )
    assert res2.status_code == 201
    child_data = res2.json()
    assert child_data["is_duplicate"] is True
    assert child_data["parent_ticket_id"] == parent_id

    # 3. Check parent ticket duplicate count
    parent_res = client.get(f"/api/officer/tickets/{parent_id}")
    assert parent_res.status_code == 200
    parent_data = parent_res.json()
    assert parent_data["duplicate_count"] == 1
    assert len(parent_data["duplicates"]) == 1
    assert parent_data["duplicates"][0]["id"] == child_data["id"]

def test_officer_ticket_list_and_sorting(client):
    # Create Low severity ticket
    client.post(
        "/api/complaints",
        data={"raw_text": "Faded zebra crossing markings on 4th cross", "location_text": "Jayanagar"}
    )
    # Create Critical severity ticket
    client.post(
        "/api/complaints",
        data={"raw_text": "Live wire sparking on pedestrian path", "location_text": "Koramangala"}
    )

    list_res = client.get("/api/officer/tickets")
    assert list_res.status_code == 200
    tickets = list_res.json()
    assert len(tickets) >= 2
    # Critical must precede Low in priority order
    assert tickets[0]["severity"] == "Critical"

def test_officer_override_and_audit_logging(client):
    res = client.post(
        "/api/complaints",
        data={"raw_text": "Smelly overflowing garbage bin", "location_text": "Indiranagar"}
    )
    ticket_id = res.json()["id"]

    # Officer overrides severity from Medium to High, and changes status to in_progress
    patch_res = client.patch(
        f"/api/officer/tickets/{ticket_id}",
        json={
            "status": "in_progress",
            "severity": "High",
            "override_reason": "Located directly outside government maternity hospital",
            "officer_name": "Ward Officer Rao"
        }
    )
    assert patch_res.status_code == 200
    updated = patch_res.json()
    assert updated["status"] == "in_progress"
    assert updated["severity"] == "High"
    assert updated["ai_classification_method"] == "manual_override"

    # Verify audit logs
    assert len(updated["audit_logs"]) >= 2
    actions = [log["action"] for log in updated["audit_logs"]]
    assert "manual_override" in actions
    assert "status_change" in actions

def test_real_analytics_endpoint(client):
    # Submit one ticket and resolve it
    res = client.post(
        "/api/complaints",
        data={"raw_text": "Water leakage from pipe", "location_text": "BTM Layout"}
    )
    ticket_id = res.json()["id"]

    client.patch(
        f"/api/officer/tickets/{ticket_id}",
        json={"status": "resolved", "override_reason": "Repaired valve"}
    )

    analytics_res = client.get("/api/analytics")
    assert analytics_res.status_code == 200
    data = analytics_res.json()
    assert data["total_tickets"] >= 1
    assert data["resolved_tickets"] >= 1
    assert "roads" in data["tickets_by_category"]
    assert "water supply" in data["tickets_by_category"]
    assert "Critical" in data["tickets_by_severity"]
