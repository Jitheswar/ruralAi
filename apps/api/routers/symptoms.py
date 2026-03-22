"""
Symptom Analysis Router — AI-powered symptom checking with Gemini.
Emergency rules (json-logic) run locally first, then AI analysis.
"""

import logging

from fastapi import APIRouter, Depends, Request
from pydantic import BaseModel, field_validator

from services.rate_limit import limiter

from services.ai_service import analyze_symptoms
from services.medicine_db import get_all_medicine_names
from services.auth import get_current_user_id, get_supabase_client
from services.patient_utils import get_or_create_self_patient

logger = logging.getLogger(__name__)

router = APIRouter()

# --- JSON-logic emergency rules (inline, no dependency on Node.js) ---

EMERGENCY_RULES = [
    {
        "id": "cardiac_emergency",
        "name": "Suspected Cardiac Event",
        "severity": "critical",
        "required_symptoms": [["chest_pain"]],
        "any_of": ["sweating", "breathlessness", "left_arm_pain"],
        "message": "Possible heart attack. Call emergency services (108) immediately.",
        "instructions": [
            "Make the person sit or lie down comfortably",
            "Loosen any tight clothing",
            "If available, give one aspirin (300mg) to chew",
            "Do NOT give water if unconscious",
            "Call 108 for ambulance",
        ],
    },
    {
        "id": "stroke_emergency",
        "name": "Suspected Stroke",
        "severity": "critical",
        "any_of": ["sudden_numbness", "face_drooping", "speech_difficulty"],
        "requires_modifier": "sudden_onset",
        # Safety-first: still alert on FAST symptoms if onset modifier is missing.
        "modifier_optional": True,
        "message": "Possible stroke detected. Time is critical. Call 108 immediately.",
        "instructions": [
            "Note the time symptoms started",
            "Do NOT give food or water",
            "Keep the person lying down with head slightly elevated",
            "Call 108 for ambulance",
        ],
    },
    {
        "id": "severe_breathing",
        "name": "Severe Breathing Difficulty",
        "severity": "critical",
        "required_symptoms": [["breathlessness"]],
        "any_of": ["bluish_lips", "chest_pain"],
        "message": "Severe breathing difficulty detected. Seek immediate medical help.",
        "instructions": [
            "Help the person sit upright",
            "If they have an inhaler, help them use it",
            "Loosen tight clothing around chest and neck",
            "Call 108 for ambulance",
        ],
    },
]


def check_emergency_rules(symptoms: list[str], modifiers: list[str]) -> list[dict]:
    """Check symptoms against emergency rules (instant, no API call)."""
    alerts = []
    for rule in EMERGENCY_RULES:
        required_groups = rule.get("required_symptoms", [])
        any_of = rule.get("any_of", [])
        req_mod = rule.get("requires_modifier")
        modifier_optional = rule.get("modifier_optional", False)

        # All required symptom groups must have at least one match
        required_met = all(
            any(s in symptoms for s in group) for group in required_groups
        )

        # At least one any_of symptom must be present (if specified)
        any_met = any(s in symptoms for s in any_of) if any_of else False

        # Modifier must be present (if specified)
        mod_present = req_mod in modifiers if req_mod else True
        mod_met = mod_present if req_mod and not modifier_optional else True

        # Rule triggers when:
        # - All required groups satisfied (or none specified)
        # - At least one any_of symptom matches (rules must have a trigger)
        # - Required modifier is present (if specified)
        has_required = required_met if required_groups else True
        has_trigger = any_met

        if has_required and has_trigger and mod_met:
            confidence = "high" if mod_present else "medium"
            alerts.append(
                {
                    "rule_id": rule["id"],
                    "name": rule["name"],
                    "severity": rule["severity"],
                    "confidence": confidence,
                    "message": rule["message"],
                    "instructions": rule["instructions"],
                }
            )
    return alerts


# --- Request/Response models ---


class SymptomAnalysisRequest(BaseModel):
    symptoms: list[str]
    modifiers: list[str] = []
    duration_days: int = 1
    age: int | None = None
    gender: str | None = None
    medical_history: list[str] = []
    current_medications: list[str] = []
    patient_id: str | None = None

    @field_validator('symptoms')
    @classmethod
    def validate_symptoms_length(cls, v: list[str]) -> list[str]:
        if len(v) > 20:
            raise ValueError('Maximum 20 symptoms allowed')
        return v

    @field_validator('modifiers')
    @classmethod
    def validate_modifiers_length(cls, v: list[str]) -> list[str]:
        if len(v) > 10:
            raise ValueError('Maximum 10 modifiers allowed')
        return v


class SymptomAnalysisResponse(BaseModel):
    emergency_alerts: list[dict]
    ai_analysis: dict
    has_emergency: bool
    saved: bool = False


# --- Endpoints ---


@router.post("/analyze", response_model=SymptomAnalysisResponse)
@limiter.limit("10/minute")
async def analyze(
    request: Request,
    req: SymptomAnalysisRequest,
    user_id: str = Depends(get_current_user_id),
):
    """Analyze symptoms: emergency rules first (instant), then AI analysis."""

    # 1. Check emergency rules instantly
    emergency_alerts = check_emergency_rules(req.symptoms, req.modifiers)
    has_emergency = len(emergency_alerts) > 0

    # 2. Get medicine context for AI
    medicines_context = await get_all_medicine_names()

    # 3. AI analysis via Unified Service (OpenAI/Gemini)
    ai_result = await analyze_symptoms(
        symptoms=req.symptoms,
        modifiers=req.modifiers,
        duration_days=req.duration_days,
        age=req.age,
        gender=req.gender,
        medical_history=req.medical_history,
        current_medications=req.current_medications,
        medicines_context=medicines_context,
    )



    # 4. Save to Health Records (Supabase)
    saved = False
    try:
        supabase = get_supabase_client()
        patient_id = req.patient_id

        # If no patient_id provided, find or create "Self" patient for this user
        if not patient_id:
            patient_id = get_or_create_self_patient(supabase, user_id, req.age, req.gender)

        if patient_id:
            log_entry = {
                "patient_id": patient_id,
                "recorded_by": user_id,
                "log_type": "symptoms",
                "data": {
                    "input": req.model_dump(),
                    "analysis": ai_result,
                    "emergency_alerts": emergency_alerts,
                },
                "notes": ai_result.get("summary", "Symptom check"),
            }
            supabase.table("health_logs").insert(log_entry).execute()
            saved = True

    except Exception as e:
        logger.error("Failed to auto-save record: %s", e)

    return SymptomAnalysisResponse(
        emergency_alerts=emergency_alerts,
        ai_analysis=ai_result,
        has_emergency=has_emergency,
        saved=saved,
    )
