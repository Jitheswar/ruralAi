"""Voice transcription endpoints — uses local Whisper model (primary) or Gemini (fallback)."""

from fastapi import APIRouter, UploadFile, File
from pydantic import BaseModel

from services.ai_models import get_model_for_task
from services.local_ml_service import transcribe_audio_local, extract_medical_terms_local

router = APIRouter()

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
async def transcribe_voice(audio: UploadFile = File(...)):
    """
    Accept an audio file and transcribe it.
    Uses local Whisper model (primary) or Gemini (fallback).
    """
    audio_bytes = await audio.read()
    mime_type = audio.content_type or "audio/wav"

    model = get_model_for_task("text_extraction")

    if model == "local":
        result = await transcribe_audio_local(audio_bytes, mime_type)
        if "error" not in result:
            return {"success": True, "transcription": result}
        print(f"Local Whisper failed: {result.get('error')}, falling back to Gemini")

    # Fallback to Gemini
    try:
        from services.gemini_service import _get_client, _parse_json_response
        from google.genai import types

        client = _get_client()
        if not client:
            # If local also failed, return that error
            if model == "local" and "error" in result:
                return {"success": False, "error": result["error"]}
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
async def transcribe_text(req: TextTranscribeRequest):
    """
    Accept text input and extract medical terms.
    Uses local keyword matching (primary) or Gemini (fallback).
    """
    model = get_model_for_task("text_extraction")

    if model == "local":
        result = await extract_medical_terms_local(req.text, req.language)
        if "error" not in result:
            return {"success": True, "transcription": result}
        print(f"Local text extraction failed: {result.get('error')}, falling back to Gemini")

    # Fallback to Gemini
    try:
        from services.gemini_service import _get_client, _parse_json_response

        client = _get_client()
        if not client:
            if model == "local" and "error" in result:
                return {"success": False, "error": result["error"]}
            return {"success": False, "error": "No text analysis service available"}

        model_name = "gemini-2.0-flash"
        prompt = f"""{MEDICAL_EXTRACTION_PROMPT}

Patient's description (language: {req.language}):
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
