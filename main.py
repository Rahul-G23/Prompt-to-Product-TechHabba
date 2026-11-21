"""
CivicLens Root ASGI Entrypoint
Allows running 'uvicorn main:app --reload' directly from the repository root,
as well as 'uvicorn backend.main:app --reload' or 'cd backend && uvicorn main:app --reload'.
"""

import sys
import os

# Add the backend directory to Python sys.path so relative imports in backend modules resolve smoothly
CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
BACKEND_DIR = os.path.join(CURRENT_DIR, "backend")

if BACKEND_DIR not in sys.path:
    sys.path.insert(0, BACKEND_DIR)

from backend.main import app

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.main:app", host="0.0.0.0", port=8000, reload=True)
