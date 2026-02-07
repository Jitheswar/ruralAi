"""Voice transcription stub endpoints."""

from fastapi import APIRouter, UploadFile, File
from pydantic import BaseModel

router = APIRouter()

# Mock transcription responses keyed by rough "intent"
MOCK_TRANSCRIPTIONS = [
    {
        "hindi_text": "मुझे सीने में दर्द हो रहा है और पसीना आ रहा है",
        "english_text": "I am having chest pain and sweating",
        "medical_terms": [
            {"term": "Chest pain", "snomed_code": "29857009", "category": "cardiac"},
            {"term": "Hyperhidrosis", "snomed_code": "52613005", "category": "cardiac"},
        ],
        "suggested_symptoms": ["chest_pain", "sweating"],
        "confidence": 0.92,
    },
    {
        "hindi_text": "मुझे दो दिन से बुखार है और सिर दर्द भी है",
        "english_text": "I have had fever for two days and also headache",
        "medical_terms": [
            {"term": "Fever", "snomed_code": "386661006", "category": "general"},
            {"term": "Headache", "snomed_code": "25064002", "category": "neuro"},
        ],
        "suggested_symptoms": ["fever", "headache"],
        "confidence": 0.95,
    },
    {
        "hindi_text": "पेट में दर्द है और उल्टी हो रही है",
        "english_text": "I have stomach pain and vomiting",
        "medical_terms": [
            {"term": "Abdominal pain", "snomed_code": "21522001", "category": "gastro"},
            {"term": "Vomiting", "snomed_code": "422400008", "category": "gastro"},
        ],
        "suggested_symptoms": ["abdominal_pain", "vomiting"],
        "confidence": 0.89,
    },
]

# Cycle through mock responses
_call_counter = 0


@router.post("/transcribe")
async def transcribe_voice(audio: UploadFile = File(...)):
    """
    Accept an audio file and return mock Hindi→English transcription
    with SNOMED-coded medical terms.

    In production: Whisper/IndicASR → NER → SNOMED mapping.
    """
    global _call_counter

    # Read file to acknowledge it (don't process)
    await audio.read()

    result = MOCK_TRANSCRIPTIONS[_call_counter % len(MOCK_TRANSCRIPTIONS)]
    _call_counter += 1

    return {
        "success": True,
        "transcription": result,
    }


class TextTranscribeRequest(BaseModel):
    text: str
    language: str = "hi"


@router.post("/transcribe-text")
async def transcribe_text(req: TextTranscribeRequest):
    """
    Accept text input (for testing without audio) and return mock medical terms.
    """
    # Simple keyword matching for demo
    text_lower = req.text.lower()

    terms = []
    symptoms = []

    keyword_map = {
        "chest": ({"term": "Chest pain", "snomed_code": "29857009", "category": "cardiac"}, "chest_pain"),
        "fever": ({"term": "Fever", "snomed_code": "386661006", "category": "general"}, "fever"),
        "headache": ({"term": "Headache", "snomed_code": "25064002", "category": "neuro"}, "headache"),
        "cough": ({"term": "Cough", "snomed_code": "49727002", "category": "respiratory"}, "cough"),
        "stomach": ({"term": "Abdominal pain", "snomed_code": "21522001", "category": "gastro"}, "abdominal_pain"),
        "vomit": ({"term": "Vomiting", "snomed_code": "422400008", "category": "gastro"}, "vomiting"),
        "breathe": ({"term": "Dyspnea", "snomed_code": "267036007", "category": "respiratory"}, "shortness_of_breath"),
    }

    for keyword, (term, symptom_id) in keyword_map.items():
        if keyword in text_lower:
            terms.append(term)
            symptoms.append(symptom_id)

    return {
        "success": True,
        "transcription": {
            "hindi_text": req.text if req.language == "hi" else "",
            "english_text": req.text if req.language == "en" else f"[Translated] {req.text}",
            "medical_terms": terms,
            "suggested_symptoms": symptoms,
            "confidence": 0.85,
        },
    }
