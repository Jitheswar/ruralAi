"""Voice transcription endpoints — uses local Whisper model (primary) or Gemini (fallback)."""

from fastapi import APIRouter, UploadFile, File, Depends, HTTPException, Request
from pydantic import BaseModel

from services.rate_limit import limiter

from services.ai_models import get_model_for_task
from services.local_ml_service import transcribe_audio_local, extract_medical_terms_local
from services.auth import get_current_user_id

router = APIRouter()

MAX_AUDIO_SIZE = 25 * 1024 * 1024  # 25 MB

# Languages supported by local keyword extraction
LOCAL_SUPPORTED_LANGUAGES = {"en", "hi"}


def _normalize_language(lang: str) -> str:
    """Normalize BCP-47 tags (e.g. 'hi-IN' -> 'hi', 'ta-IN' -> 'ta') to short codes."""
    if not lang:
        return "hi"
    short = lang.split("-")[0].lower().strip()
    return short if short else "hi"


MEDICAL_EXTRACTION_PROMPT = """You are a medical transcription assistant for rural India.
Analyze the following patient description and extract:

1. The original text (if Hindi, keep as-is)
2. English translation
3. Medical terms with SNOMED codes and categories (cardiac, neuro, respiratory, gastro, general, dermatological)
4. Suggested symptom IDs for our system (use snake_case like: chest_pain, fever, headache, cough, abdominal_pain, vomiting, breathlessness, dizziness, fatigue, body_ache, joint_pain, rash, diarrhea, sweating, nausea)

Respond ONLY with valid JSON:
{
  "hindi_text": "original Hindi text or empty",
  "english_text": "English translation or original",
  "medical_terms": [
    {"term": "Medical term", "snomed_code": "code", "category": "category"}
  ],
  "suggested_symptoms": ["symptom_id_1", "symptom_id_2"],
  "confidence": 0.0 to 1.0
}"""


@router.post("/transcribe")
@limiter.limit("10/minute")
async def transcribe_voice(
    request: Request,
    audio: UploadFile = File(...),
    user_id: str = Depends(get_current_user_id),
):
    """
    Accept an audio file and transcribe it.
    Uses local Whisper model (primary) or Gemini (fallback).
    """
    audio_bytes = await audio.read()
    if len(audio_bytes) > MAX_AUDIO_SIZE:
        raise HTTPException(status_code=413, detail="Audio file too large. Maximum size is 25 MB.")
    mime_type = audio.content_type or "audio/wav"

    model = get_model_for_task("text_extraction")
    local_error = None

    if model == "local":
        result = await transcribe_audio_local(audio_bytes, mime_type)
        if "error" not in result:
            return {"success": True, "transcription": result}
        local_error = result.get("error")
        print(f"Local Whisper failed: {local_error}, falling back to Gemini")

    # Fallback to Gemini
    try:
        from services.gemini_service import _get_client, _parse_json_response
        from google.genai import types

        client = _get_client()
        if not client:
            if local_error:
                return {"success": False, "error": local_error}
            return {"success": False, "error": "No transcription service available"}

        model_name = "gemini-2.0-flash"
        audio_part = types.Part.from_bytes(data=audio_bytes, mime_type=mime_type)

        prompt = f"""{MEDICAL_EXTRACTION_PROMPT}

Transcribe this audio recording from a patient describing their symptoms.
The audio may be in Hindi, English, or a mix. Extract all medical information."""

        response = client.models.generate_content(
            model=model_name,
            contents=[prompt, audio_part],
        )
        gemini_result = _parse_json_response(response.text)

        if "error" in gemini_result and "raw" in gemini_result:
            return {"success": False, "error": gemini_result["error"]}

        return {"success": True, "transcription": gemini_result}

    except Exception as e:
        return {"success": False, "error": f"Transcription failed: {str(e)}"}


class TextTranscribeRequest(BaseModel):
    text: str
    language: str = "hi"


@router.post("/transcribe-text")
async def transcribe_text(
    req: TextTranscribeRequest,
    user_id: str = Depends(get_current_user_id),
):
    """
    Accept text input and extract medical terms.
    Accepts BCP-47 tags (hi-IN, ta-IN, etc.) and normalizes server-side.
    Uses local keyword matching for en/hi, cloud for other languages.
    """
    language = _normalize_language(req.language)
    model = get_model_for_task("text_extraction")
    local_error = None

    # Only attempt local extraction for supported languages
    if model == "local" and language in LOCAL_SUPPORTED_LANGUAGES:
        result = await extract_medical_terms_local(req.text, language)
        if "error" not in result:
            return {"success": True, "transcription": result}
        local_error = result.get("error")
        print(f"Local text extraction failed: {local_error}, falling back to Gemini")
    elif model == "local" and language not in LOCAL_SUPPORTED_LANGUAGES:
        # Skip local for unsupported languages, go directly to cloud
        local_error = f"Local extraction not supported for language: {language}"

    # Fallback to Gemini
    try:
        from services.gemini_service import _get_client, _parse_json_response

        client = _get_client()
        if not client:
            if local_error:
                return {
                    "success": False,
                    "error": f"Language '{language}' requires cloud processing, but no cloud service is available. "
                             f"Local extraction only supports: {', '.join(sorted(LOCAL_SUPPORTED_LANGUAGES))}.",
                }
            return {"success": False, "error": "No text analysis service available"}

        model_name = "gemini-2.0-flash"
        prompt = f"""{MEDICAL_EXTRACTION_PROMPT}

Patient's description (language: {language}):
"{req.text}"
"""
        response = client.models.generate_content(
            model=model_name,
            contents=prompt,
        )
        gemini_result = _parse_json_response(response.text)

        if "error" in gemini_result and "raw" in gemini_result:
            return {"success": False, "error": gemini_result["error"]}

        return {"success": True, "transcription": gemini_result}

    except Exception as e:
        return {"success": False, "error": f"Text analysis failed: {str(e)}"}
