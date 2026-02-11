"""
AI Model Registry — lists available models for each provider.
Centralizes model selection so we can switch models easily.
"""

import os

# Google Gemini Models
GEMINI_MODELS = {
    "gemini-2.0-flash": "Fast, cost-effective. Best for most tasks.",
    "gemini-2.0-flash-lite": "Fastest, cheapest. Good for simple tasks.",
    "gemini-1.5-flash": "Previous gen fast model. Stable free tier.",
    "gemini-pro": "Legacy stable model (1.0).",
    "gemini-2.0-flash-vision": "Same as 2.0-flash, supports image input.",
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

# Toggle: set USE_LOCAL_MODELS=false in .env to use cloud APIs
_USE_LOCAL = os.getenv("USE_LOCAL_MODELS", "true").lower() == "true"

# Default model selections
SELECTED_MODELS = {
    "symptom_analysis": "local" if _USE_LOCAL else "gpt-4o-mini",
    "prescription_ocr": "local" if _USE_LOCAL else "gpt-4o-mini",
    "text_extraction": "local" if _USE_LOCAL else "gemini-2.0-flash",
    "medicine_recommendation": "local" if _USE_LOCAL else "gpt-4o-mini",
}


def get_model_for_task(task: str) -> str:
    """Get the selected model name for a given task."""
    return SELECTED_MODELS.get(task, "local" if _USE_LOCAL else "gemini-2.0-flash")


def list_available_models() -> dict:
    """List all available models grouped by provider."""
    return {
        "local": LOCAL_MODELS,
        "gemini": GEMINI_MODELS,
        "openai": OPENAI_MODELS,
        "selected": SELECTED_MODELS,
        "mode": "local" if _USE_LOCAL else "cloud",
    }
