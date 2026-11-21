"""
Test suite for CivicLens Severity Rubric and Category Constraints.
Verifies that safety risks outweigh citizen inconvenience.
"""

import pytest
from config import ALLOWED_CATEGORIES, ALLOWED_SEVERITIES, DEPARTMENTS, SEVERITY_RUBRIC
from services.fallback_classifier import classify_with_fallback_rules

def test_allowed_categories_integrity():
    assert len(ALLOWED_CATEGORIES) == 10
    assert "roads" in ALLOWED_CATEGORIES
    assert "waste" in ALLOWED_CATEGORIES
    assert "water supply" in ALLOWED_CATEGORIES
    assert "sewage and drainage" in ALLOWED_CATEGORIES
    assert "electricity and streetlights" in ALLOWED_CATEGORIES
    assert "trees and parks" in ALLOWED_CATEGORIES
    assert "encroachment" in ALLOWED_CATEGORIES
    assert "noise and pollution" in ALLOWED_CATEGORIES
    assert "stray animals" in ALLOWED_CATEGORIES
    assert "other" in ALLOWED_CATEGORIES

def test_departments_mapping_complete():
    for cat in ALLOWED_CATEGORIES:
        assert cat in DEPARTMENTS, f"Category '{cat}' missing from departments.json"
        assert "primary_department" in DEPARTMENTS[cat]
        assert DEPARTMENTS[cat]["primary_department"] != ""

def test_severity_rubric_levels():
    assert "Critical" in SEVERITY_RUBRIC["levels"]
    assert "High" in SEVERITY_RUBRIC["levels"]
    assert "Medium" in SEVERITY_RUBRIC["levels"]
    assert "Low" in SEVERITY_RUBRIC["levels"]

def test_critical_safety_precedence_over_inconvenience():
    # Live wire is life-safety hazard -> must be Critical
    result = classify_with_fallback_rules("Exposed live wire sparking on footpath outside nursery school")
    assert result.severity == "Critical"
    assert result.category == "electricity and streetlights"

def test_open_manhole_hazard_critical():
    # Open manhole on street -> must be Critical
    result = classify_with_fallback_rules("Open manhole on pedestrian path, someone could fall inside")
    assert result.severity == "Critical"
    assert result.category == "sewage and drainage"

def test_routine_cosmetic_issue_low():
    # Faded markings -> Low
    result = classify_with_fallback_rules("Faded zebra crossing paint in front of the community center")
    assert result.severity == "Low"
    assert result.category == "roads"

def test_multilingual_kannada_pothole():
    # Kannada script pothole on road
    result = classify_with_fallback_rules("ರಸ್ತೆಯಲ್ಲಿ ದೊಡ್ಡ ಗುಂಡಿ ಬಿದ್ದಿದೆ, ವಾಹನ ಸವಾರರು ಬೀಳುತ್ತಿದ್ದಾರೆ")
    assert result.category == "roads"
    assert result.detected_language == "Kannada"

def test_multilingual_hindi_garbage():
    # Hindi script garbage
    result = classify_with_fallback_rules("गली में बहुत कचरा पड़ा है और बदबू आ रही है")
    assert result.category == "waste"
    assert result.detected_language == "Hindi"

def test_hinglish_water_leak():
    # Hinglish text
    result = classify_with_fallback_rules("Bhai paani ki main pipeline burst ho gayi hai pura rasta block hai")
    assert result.category == "water supply"
    assert result.detected_language == "Hinglish"
