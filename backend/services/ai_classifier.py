"""
CivicLens AI Classifier Service
Integrates Gemini multimodal models with strict JSON schema constraints,
automatic retry, injection defense, and rule-based fallback.
"""

import json
import logging
from pathlib import Path
from typing import Optional, Tuple
from PIL import Image

from config import GEMINI_API_KEY, GEMINI_MODEL, UPLOAD_DIR
from schemas import AIClassificationOutput
from prompts.classifier_v1 import SYSTEM_INSTRUCTION, build_classification_prompt
from services.fallback_classifier import classify_with_fallback_rules

logger = logging.getLogger("civiclens.ai")

def _call_gemini_api(raw_text: Optional[str], photo_path: Optional[str] = None) -> AIClassificationOutput:
    """
    Executes Gemini call with structured JSON schema output and multimodal support.
    Tries google.genai unified SDK first, then google.generativeai standard SDK.
    """
    if not GEMINI_API_KEY or GEMINI_API_KEY.strip() == "" or GEMINI_API_KEY == "your_gemini_api_key_here":
        raise ValueError("GEMINI_API_KEY is not configured.")

    has_photo = bool(photo_path and (Path(__file__).resolve().parent.parent / photo_path.lstrip("/")).exists())
    user_prompt = build_classification_prompt(raw_text=raw_text, has_photo=has_photo)

    # Prepare photo part if present
    loaded_img = None
    if has_photo:
        abs_img_path = Path(__file__).resolve().parent.parent / photo_path.lstrip("/")
        loaded_img = Image.open(abs_img_path)

    # 1. Try google.genai unified SDK
    try:
        from google import genai
        from google.genai import types

        client = genai.Client(api_key=GEMINI_API_KEY)
        contents = [user_prompt]
        if loaded_img:
            contents.append(loaded_img)

        config = types.GenerateContentConfig(
            system_instruction=SYSTEM_INSTRUCTION,
            response_mime_type="application/json",
            temperature=0.1
        )

        response = client.models.generate_content(
            model=GEMINI_MODEL,
            contents=contents,
            config=config
        )

        response_text = response.text
        parsed = AIClassificationOutput.model_validate_json(response_text)
        return parsed

    except Exception as genai_err:
        logger.warning(f"google.genai call attempt failed: {genai_err}. Trying google.generativeai fallback...")

        # 2. Try google.generativeai standard SDK
        import google.generativeai as legacy_genai
        legacy_genai.configure(api_key=GEMINI_API_KEY)

        model = legacy_genai.GenerativeModel(
            model_name=GEMINI_MODEL,
            system_instruction=SYSTEM_INSTRUCTION
        )

        contents = [user_prompt]
        if loaded_img:
            contents.append(loaded_img)

        response = model.generate_content(
            contents,
            generation_config=legacy_genai.GenerationConfig(
                response_mime_type="application/json",
                temperature=0.1
            )
        )

        response_text = response.text
        parsed = AIClassificationOutput.model_validate_json(response_text)
        return parsed


def classify_complaint(
    raw_text: Optional[str],
    photo_path: Optional[str] = None
) -> Tuple[AIClassificationOutput, str, bool, Optional[str]]:
    """
    Classifies citizen complaint with safety-first rubric and strict validation.
    
    Returns:
        (output, classification_method, needs_review, review_reason)
    """
    has_photo = bool(photo_path)
    
    # Check if Gemini API Key is available
    if not GEMINI_API_KEY or GEMINI_API_KEY.strip() == "" or GEMINI_API_KEY == "your_gemini_api_key_here":
        logger.info("Gemini API key not configured. Using deterministic rule-based classifier.")
        result = classify_with_fallback_rules(raw_text, has_photo=has_photo)
        return (result, "rule_based_fallback", True, "AI unavailable, rule-based result")

    # Attempt 1: Primary Gemini Call
    for attempt in (1, 2):
        try:
            result = _call_gemini_api(raw_text, photo_path)
            method = "gemini_multimodal" if has_photo else "gemini_text"
            
            # Check for photo vs text discrepancy
            if result.photo_text_discrepancy:
                return (
                    result,
                    method,
                    True,
                    f"Photo and text discrepancy: {result.discrepancy_explanation or 'Visual proof conflicts with description'}"
                )
            
            # Check for low confidence review flag (< 0.65)
            if result.confidence_score < 0.65:
                return (
                    result,
                    method,
                    True,
                    f"Low AI confidence score ({result.confidence_score:.2f}) requires human verification."
                )

            return (result, method, False, None)

        except Exception as exc:
            logger.error(f"Gemini triage attempt {attempt} failed: {exc}")
            if attempt == 1:
                # Retry once
                continue

    # Fallback to rule-based keyword classifier
    logger.warning("All Gemini API attempts failed. Falling back to rule-based classifier.")
    fallback_result = classify_with_fallback_rules(raw_text, has_photo=has_photo)
    return (
        fallback_result,
        "rule_based_fallback",
        True,
        "AI unavailable, rule-based result"
    )
