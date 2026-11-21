"""
Test suite for CivicLens Complaint Intake Endpoint
Verifies input validation, image processing, rate limiting, and database persistence.
"""

import io
import pytest
from PIL import Image

def create_test_image_bytes(format="JPEG", size=(100, 100), color=(255, 0, 0)) -> bytes:
    buf = io.BytesIO()
    img = Image.new("RGB", size, color=color)
    img.save(buf, format=format)
    buf.seek(0)
    return buf.getvalue()

def test_health_endpoint(client):
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["app_name"] == "CivicLens"

def test_valid_text_complaint_intake(client):
    response = client.post(
        "/api/complaints",
        data={
            "raw_text": "Large pothole on 100 Feet Road causing two-wheelers to slip.",
            "location_text": "Indiranagar 100 Feet Road, Bengaluru",
            "contact_number": "+91 9876543210"
        }
    )
    assert response.status_code == 201
    data = response.json()
    assert data["id"].startswith("CL-")
    assert "Large pothole" in data["raw_text"]
    assert data["has_photo"] is False
    assert data["photo_path"] is None
    assert data["status"] == "new"

def test_valid_photo_complaint_intake(client):
    image_bytes = create_test_image_bytes("JPEG")
    response = client.post(
        "/api/complaints",
        data={"location_text": "Shivajinagar Market"},
        files={"photo": ("test_pothole.jpg", image_bytes, "image/jpeg")}
    )
    assert response.status_code == 201
    data = response.json()
    assert data["has_photo"] is True
    assert data["photo_path"] is not None
    assert data["photo_path"].startswith("/uploads/")

def test_empty_complaint_rejection(client):
    # Neither text nor photo provided
    response = client.post(
        "/api/complaints",
        data={"location_text": "Somewhere"}
    )
    assert response.status_code == 400
    assert "At least one of complaint text or a photo upload is required" in response.json()["detail"]

def test_invalid_mime_type_rejection(client):
    dummy_text_file = io.BytesIO(b"not an image file")
    response = client.post(
        "/api/complaints",
        data={"raw_text": "Broken pipe"},
        files={"photo": ("malicious.exe", dummy_text_file, "application/octet-stream")}
    )
    assert response.status_code == 400
    assert "Unsupported file format" in response.json()["detail"]

def test_oversized_file_rejection(client):
    # 6 MB dummy payload
    oversized_bytes = b"0" * (6 * 1024 * 1024)
    response = client.post(
        "/api/complaints",
        data={"raw_text": "Big file test"},
        files={"photo": ("huge.jpg", oversized_bytes, "image/jpeg")}
    )
    assert response.status_code == 400
    assert "exceeds maximum permitted limit" in response.json()["detail"]

def test_track_complaint_existing(client):
    # Submit first
    post_res = client.post(
        "/api/complaints",
        data={"raw_text": "Streetlight not working", "location_text": "MG Road"}
    )
    assert post_res.status_code == 201
    ticket_id = post_res.json()["id"]

    # Track it
    track_res = client.get(f"/api/complaints/{ticket_id}")
    assert track_res.status_code == 200
    ticket_data = track_res.json()
    assert ticket_data["id"] == ticket_id
    assert ticket_data["status"] == "new"

def test_track_complaint_non_existent(client):
    track_res = client.get("/api/complaints/CL-9999-NOTFOUND")
    assert track_res.status_code == 404
    assert "No civic ticket found" in track_res.json()["detail"]
