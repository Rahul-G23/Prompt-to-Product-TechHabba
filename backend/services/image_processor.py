"""
CivicLens Image Processor Service
Safely validates, strips metadata/EXIF, re-encodes, and saves citizen complaint photos.
"""

import io
import uuid
from pathlib import Path
from typing import Tuple, Optional
from PIL import Image, ImageOps
from fastapi import UploadFile, HTTPException
from config import UPLOAD_DIR, MAX_FILE_SIZE_BYTES, ALLOWED_MIME_TYPES

def sanitize_and_save_image(file: UploadFile, max_dim: int = 1920) -> str:
    """
    Validates, strips all EXIF metadata, resizes if larger than max_dim,
    and re-encodes the image into a clean JPEG format.
    Returns the relative path to the saved file (e.g. 'uploads/img_uuid.jpg').
    """
    # 1. MIME type validation
    if file.content_type not in ALLOWED_MIME_TYPES:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file format '{file.content_type}'. Allowed types: JPEG, PNG, WEBP."
        )

    # 2. Read content and check size limit (5 MB)
    content = file.file.read()
    if len(content) > MAX_FILE_SIZE_BYTES:
        raise HTTPException(
            status_code=400,
            detail=f"File size exceeds maximum permitted limit of 5 MB (received {len(content) / (1024*1024):.2f} MB)."
        )

    if len(content) == 0:
        raise HTTPException(
            status_code=400,
            detail="Uploaded file is empty."
        )

    try:
        # 3. Verify image integrity with Pillow
        image_stream = io.BytesIO(content)
        img = Image.open(image_stream)
        img.verify()  # Verifies file header and block structure

        # Re-open after verify() (Pillow requirement)
        image_stream.seek(0)
        img = Image.open(image_stream)

        # Transpose image based on orientation tag if present, then strip EXIF
        img = ImageOps.exif_transpose(img)

        # Convert to RGB mode (handles RGBA, P, CMYK cleanly)
        if img.mode != "RGB":
            img = img.convert("RGB")

        # 4. Optional dimension constraint
        if img.width > max_dim or img.height > max_dim:
            img.thumbnail((max_dim, max_dim), Image.Resampling.LANCZOS)

        # 5. Generate secure filename and write to disk
        filename = f"complaint_{uuid.uuid4().hex[:12]}.jpg"
        save_path = UPLOAD_DIR / filename

        # Save with clean quality, without original EXIF
        img.save(save_path, format="JPEG", quality=88, optimize=True)

        # Return web-friendly relative path
        return f"/uploads/{filename}"

    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid or corrupted image file: {str(exc)}"
        )
