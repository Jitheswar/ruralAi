"""
Symptom Analysis Router — AI-powered symptom checking with Gemini.
Emergency rules (json-logic) run locally first, then AI analysis.
"""

from fastapi import APIRouter, Depends
from pydantic import BaseModel

from services.ai_service import analyze_symptoms
from services.medicine_db import get_all_medicine_names
from services.auth import get_current_user_id, get_supabase_client

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
        # Check required symptoms (all must be present)
        required = rule.get("required_symptoms", [])
        required_met = all(
            any(s in symptoms for s in group) for group in required
        )

        # Check any_of (at least one must be present)
        any_of = rule.get("any_of", [])
        any_met = any(s in symptoms for s in any_of) if any_of else True

        # Check modifier requirement
        req_mod = rule.get("requires_modifier")
        mod_met = req_mod in modifiers if req_mod else True

        if (required_met or not required) and any_met and mod_met:
            # For rules without required_symptoms, at least one any_of must match
            if not required and not any(s in symptoms for s in any_of):
                continue
            alerts.append(
                {
                    "rule_id": rule["id"],
                    "name": rule["name"],
                    "severity": rule["severity"],
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


class SymptomAnalysisResponse(BaseModel):
    emergency_alerts: list[dict]
    ai_analysis: dict
    has_emergency: bool
    saved: bool = False


# --- Endpoints ---


@router.post("/analyze", response_model=SymptomAnalysisResponse)
async def analyze(
    req: SymptomAnalysisRequest,
    user_id: str = Depends(get_current_user_id)
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
            # Check if user has any patients created by them
            res = supabase.table("patients").select("id").eq("created_by", user_id).limit(1).execute()
            if res.data:
                patient_id = res.data[0]["id"]
            else:
                # Create new patient (avoid querying users table — RLS recursion)
                new_patient = {
                    "created_by": user_id,
                    "name": "My Health Profile",
                    "age": req.age,
                    "gender": req.gender,
                }
                create_res = supabase.table("patients").insert(new_patient).execute()
                if create_res.data:
                    patient_id = create_res.data[0]["id"]

        if patient_id:
            log_entry = {
                "patient_id": patient_id,
                "recorded_by": user_id,
                "log_type": "symptoms",
                "data": {
                    "input": req.dict() if hasattr(req, 'dict') else req.model_dump(),
                    "analysis": ai_result,
                    "emergency_alerts": emergency_alerts,
                },
                "notes": ai_result.get("summary", "Symptom check"),
            }
            supabase.table("health_logs").insert(log_entry).execute()
            saved = True

    except Exception as e:
        print(f"Failed to auto-save record: {e}")

    return SymptomAnalysisResponse(
        emergency_alerts=emergency_alerts,
        ai_analysis=ai_result,
        has_emergency=has_emergency,
        saved=saved,
    )
