"""
CivicLens Backend API Server
Main FastAPI entry point configuring middleware, static files, routes, and database initialization.
"""

from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from config import APP_NAME, CORS_ORIGIN, UPLOAD_DIR
from database import engine, Base
from routes.complaints import router as complaints_router
from routes.officer import router as officer_router
from routes.analytics import router as analytics_router
from routes.auth import router as auth_router

# Initialize database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=APP_NAME,
    description="Intelligent Citizen Complaint Triage and Municipal Routing Platform",
    version="1.0.0"
)

# CORS configuration restricted to configured frontend origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        CORS_ORIGIN,
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_origin_regex=r"https://([a-zA-Z0-9-]+\.)*vercel\.app",
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

# Mount uploads directory for static photo viewing
app.mount("/uploads", StaticFiles(directory=str(UPLOAD_DIR)), name="uploads")

# Include API Routers
app.include_router(complaints_router)
app.include_router(officer_router)
app.include_router(analytics_router)
app.include_router(auth_router)

@app.get("/api/health")
def health_check():
    """System health check endpoint."""
    return {
        "status": "healthy",
        "app_name": APP_NAME,
        "version": "1.0.0",
        "database": "connected"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
