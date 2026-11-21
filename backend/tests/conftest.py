"""
Shared Pytest Fixtures for CivicLens Backend Test Suite
"""

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from main import app
from database import Base, get_db
import services.ai_classifier as ai_classifier_module
from services.fallback_classifier import classify_with_fallback_rules

import routes.complaints as complaints_route_mod

# Shared in-memory SQLite database with StaticPool
TEST_DATABASE_URL = "sqlite:///:memory:"
engine = create_engine(
    TEST_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool
)
TestingSession = sessionmaker(autocommit=False, autoflush=False, bind=engine)

@pytest.fixture(scope="session", autouse=True)
def setup_test_db():
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)

@pytest.fixture(autouse=True)
def mock_gemini_in_tests(monkeypatch):
    """
    Ensures unit tests run deterministically offline without network calls.
    Uses the high-accuracy fallback rules engine.
    """
    def mock_classify(raw_text, photo_path=None):
        out = classify_with_fallback_rules(raw_text, has_photo=bool(photo_path))
        return (out, "rule_based_fallback", False, None)

    monkeypatch.setattr(complaints_route_mod, "classify_complaint", mock_classify)
    monkeypatch.setattr(ai_classifier_module, "classify_complaint", mock_classify)




@pytest.fixture
def db_session():
    connection = engine.connect()
    transaction = connection.begin()
    session = TestingSession(bind=connection, join_transaction_mode="create_savepoint")
    yield session
    session.close()
    transaction.rollback()
    connection.close()

@pytest.fixture
def client(db_session):
    def override_get_db():
        try:
            yield db_session
        finally:
            pass

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()
