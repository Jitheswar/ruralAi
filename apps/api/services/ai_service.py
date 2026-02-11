"""
Unified AI Service — dispatches requests to local ML models (primary) or
cloud providers (OpenAI/Gemini) as fallback. Includes automatic fallback on errors.
"""

from services.ai_models import get_model_for_task
from services.local_ml_service import (
    analyze_symptoms_local,
    extract_prescription_local,
)
from services.gemini_service import (
    analyze_symptoms as analyze_symptoms_gemini,
    extract_prescription as extract_prescription_gemini,
)
from services.openai_service import (
    analyze_symptoms_openai,
    extract_prescription_openai,
)


def _is_quota_error(result: dict) -> bool:
    """Check if an AI result indicates a quota/rate-limit error."""
    err = result.get("error", "")
    return any(
        kw in err.lower()
        for kw in [
            "quota", "rate", "429", "resource_exhausted",
            "insufficient_quota", "exceeded",
        ]
    )


async def analyze_symptoms(*args, **kwargs) -> dict:
    """Dispatch symptom analysis: local ML -> OpenAI -> Gemini fallback chain."""
    model = get_model_for_task("symptom_analysis")

    # Try local model first
    if model == "local":
        result = await analyze_symptoms_local(*args, **kwargs)
        if "error" not in result:
            return result
        print(f"Local ML failed for symptom_analysis: {result.get('error')}, falling back to cloud")

    # Cloud fallback chain
    if "gpt" in model or model == "local":
        result = await analyze_symptoms_openai(*args, **kwargs)
        if not _is_quota_error(result) and "error" not in result:
            return result
        print(f"OpenAI failed for symptom_analysis, trying Gemini")
        fallback = await analyze_symptoms_gemini(*args, **kwargs)
        if not _is_quota_error(fallback) and "error" not in fallback:
            return fallback
    else:
        result = await analyze_symptoms_gemini(*args, **kwargs)
        if not _is_quota_error(result) and "error" not in result:
            return result
        print(f"Gemini failed for symptom_analysis, trying OpenAI")
        fallback = await analyze_symptoms_openai(*args, **kwargs)
        if not _is_quota_error(fallback) and "error" not in fallback:
            return fallback

    return {"error": "All AI providers failed. Please check your model files and API keys."}


async def extract_prescription(
    image_data: bytes = None, mime_type: str = "image/jpeg", **kwargs
) -> dict:
    """Dispatch prescription OCR: local Tesseract -> OpenAI -> Gemini fallback chain."""
    import base64

    model = get_model_for_task("prescription_ocr")

    # Try local OCR first
    if model == "local":
        result = await extract_prescription_local(image_data, mime_type)
        if "error" not in result:
            return result
        print(f"Local OCR failed: {result.get('error')}, falling back to cloud")

    # Cloud fallback chain
    if "gpt" in model or model == "local":
        image_b64 = base64.b64encode(image_data).decode("utf-8") if image_data else None
        result = await extract_prescription_openai(image_b64=image_b64)
        if not _is_quota_error(result) and "error" not in result:
            return result
        print(f"OpenAI failed for prescription_ocr, trying Gemini")
        fallback = await extract_prescription_gemini(image_data, mime_type)
        if not _is_quota_error(fallback) and "error" not in fallback:
            return fallback
    else:
        result = await extract_prescription_gemini(image_data, mime_type)
        if not _is_quota_error(result) and "error" not in result:
            return result
        print(f"Gemini failed for prescription_ocr, trying OpenAI")
        image_b64 = base64.b64encode(image_data).decode("utf-8") if image_data else None
        fallback = await extract_prescription_openai(image_b64=image_b64)
        if not _is_quota_error(fallback) and "error" not in fallback:
            return fallback

    return {"error": "All AI providers failed. Please check your model files and API keys."}
