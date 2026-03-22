"""
AI Model Registry — lists available models for each provider.
Centralizes model selection so we can switch models easily.
"""

import os
import json

# Google Gemini Models
GEMINI_MODELS = {
    "gemini-2.0-flash": "Fast, cost-effective. Best for most tasks.",
    "gemini-2.0-flash-lite": "Fastest, cheapest. Good for simple tasks.",
    "gemini-1.5-flash": "Previous gen fast model. Stable free tier.",
    "gemini-pro": "Legacy stable model (1.0).",
}

# OpenAI Models (available if user provides key)
OPENAI_MODELS = {
    "gpt-4o": "Most capable. Great for medical reasoning.",
    "gpt-4o-mini": "Fast and cheap. Good for simple analysis.",
    "gpt-4-turbo": "Previous gen, still very capable.",
}

# Local Models (no API key needed)
LOCAL_MODELS = {
    "local-symptom-rf": "Random Forest symptom classifier (132 features, 41 diseases)",
    "local-ocr-tesseract": "Tesseract OCR + regex prescription parser",
    "local-whisper-base": "Whisper base model for speech-to-text",
}

# Cloud fallback model names (used when "local" falls through to cloud)
CLOUD_FALLBACK = {
    "symptom_analysis": {"openai": "gpt-4o-mini", "gemini": "gemini-2.0-flash"},
    "prescription_ocr": {"openai": "gpt-4o", "gemini": "gemini-2.0-flash"},
    "text_extraction": {"openai": "gpt-4o-mini", "gemini": "gemini-2.0-flash"},
    "medicine_recommendation": {"openai": "gpt-4o-mini", "gemini": "gemini-2.0-flash"},
}


def _use_local() -> bool:
    """Check USE_LOCAL_MODELS at call time (not import time)."""
    return os.getenv("USE_LOCAL_MODELS", "true").lower() == "true"


def get_model_for_task(task: str) -> str:
    """Get the selected model name for a given task."""
    if _use_local():
        return "local"
    fallback = CLOUD_FALLBACK.get(task, {})
    return fallback.get("openai", "gpt-4o-mini")


def get_cloud_model_for_task(task: str, provider: str) -> str:
    """Get the correct cloud model name for a task+provider.
    Prevents passing 'local' as a model name to cloud APIs."""
    fallback = CLOUD_FALLBACK.get(task, {})
    return fallback.get(provider, "gemini-2.0-flash" if provider == "gemini" else "gpt-4o-mini")


def parse_json_response(text: str) -> dict:
    """Extract JSON from AI response (handles markdown code blocks).
    Shared by both OpenAI and Gemini services."""
    cleaned = text.strip()
    if cleaned.startswith("```"):
        lines = cleaned.split("\n")
        if lines and lines[0].startswith("```"):
            lines = lines[1:]
        if lines and lines[-1].strip() == "```":
            lines = lines[:-1]
        cleaned = "\n".join(lines)
    try:
        return json.loads(cleaned)
    except json.JSONDecodeError:
        return {"error": "Failed to parse AI response", "raw": text}


def list_available_models() -> dict:
    """List all available models grouped by provider."""
    use_local = _use_local()
    return {
        "local": LOCAL_MODELS,
        "gemini": GEMINI_MODELS,
        "openai": OPENAI_MODELS,
        "selected": {task: get_model_for_task(task) for task in CLOUD_FALLBACK},
        "mode": "local" if use_local else "cloud",
    }
