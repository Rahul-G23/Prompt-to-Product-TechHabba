"""
Tests for CivicLens Authentication, Issue Resolution Workflow, and Officer Logs.
"""

import io
from PIL import Image

def create_test_image_bytes():
    buf = io.BytesIO()
    img = Image.new("RGB", (100, 100), color=(50, 150, 250))
    img.save(buf, format="JPEG")
    buf.seek(0)
    return buf

def test_auth_login_admin(client):
    res = client.post(
        "/api/auth/login",
        json={"role": "admin", "password": "admin123"}
    )
    assert res.status_code == 200
    data = res.json()
    assert data["success"] is True
    assert data["user"]["role"] == "admin"
    assert "token" in data

def test_auth_login_admin_wrong_password(client):
    res = client.post(
        "/api/auth/login",
        json={"role": "admin", "password": "wrongpassword"}
    )
    assert res.status_code == 401

def test_auth_login_citizen(client):
    res = client.post(
        "/api/auth/login",
        json={"role": "citizen", "phone_number": "9876543210"}
    )
    assert res.status_code == 200
    data = res.json()
    assert data["success"] is True
    assert data["user"]["role"] == "citizen"

def test_officer_resolve_ticket_with_summary_and_photo(client):
    # 1. Create a ticket
    create_res = client.post(
        "/api/complaints",
        data={"raw_text": "Dangerous pothole on bridge road", "location_text": "Hebbal Flyover"}
    )
    assert create_res.status_code == 201
    ticket_id = create_res.json()["id"]

    # 2. Try resolving without photo - should fail (422 or 400)
    fail_res = client.post(
        f"/api/officer/tickets/{ticket_id}/resolve",
        data={"completion_summary": "Pothole filled with cold mix mastic asphalt."}
    )
    assert fail_res.status_code in (400, 422)

    # 3. Resolve properly with both completion summary and completed photo proof
    img_bytes = create_test_image_bytes()
    resolve_res = client.post(
        f"/api/officer/tickets/{ticket_id}/resolve",
        data={
            "completion_summary": "Pothole excavated, filled with dense bituminous macadam, and compacted using 2-ton vibratory roller. Surface level verified.",
            "officer_name": "Executive Engineer V. Murthy"
        },
        files={"completion_photo": ("resolved_pothole.jpg", img_bytes, "image/jpeg")}
    )
    assert resolve_res.status_code == 200
    resolved_data = resolve_res.json()
    assert resolved_data["status"] == "resolved"
    assert resolved_data["has_completion_photo"] is True
    assert resolved_data["completion_photo_path"] is not None
    assert "macadam" in resolved_data["completion_summary"]

    # Verify audit log includes resolution action
    logs = resolved_data["audit_logs"]
    assert any(log["action"] == "issue_resolved" for log in logs)

def test_officer_global_audit_logs(client):
    res = client.get("/api/officer/logs?limit=50")
    assert res.status_code == 200
    logs = res.json()
    assert isinstance(logs, list)
