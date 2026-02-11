"""
Vitals Router — save patient vitals to Supabase health_logs.
"""

from fastapi import APIRouter, Depends
from pydantic import BaseModel

from services.auth import get_current_user_id, get_supabase_client

router = APIRouter()


class VitalsRequest(BaseModel):
    patient_id: str | None = None
    temperature: str | None = None
    bp_systolic: str | None = None
    bp_diastolic: str | None = None
    pulse: str | None = None
    spo2: str | None = None
    respiratory_rate: str | None = None
    weight: str | None = None
    height: str | None = None
    blood_sugar_value: str | None = None
    blood_sugar_type: str = "random"


@router.post("/save")
async def save_vitals(
    req: VitalsRequest,
    user_id: str = Depends(get_current_user_id),
):
    """Save patient vitals to Supabase health_logs."""
    try:
        supabase = get_supabase_client()
        patient_id = req.patient_id

        # If no patient_id, find or create "Self" patient for this user
        if not patient_id:
            res = supabase.table("patients").select("id").eq("created_by", user_id).limit(1).execute()
            if res.data:
                patient_id = res.data[0]["id"]
            else:
                # Create new patient (avoid querying users table — RLS recursion)
                new_patient = {
                    "created_by": user_id,
                    "name": "My Health Profile",
                }
                create_res = supabase.table("patients").insert(new_patient).execute()
                if create_res.data:
                    patient_id = create_res.data[0]["id"]

        if not patient_id:
            return {"success": False, "error": "Could not find or create patient record"}

        vitals_data = {
            "temperature": req.temperature,
            "bp": {"systolic": req.bp_systolic, "diastolic": req.bp_diastolic},
            "pulse": req.pulse,
            "spo2": req.spo2,
            "respiratory_rate": req.respiratory_rate,
            "weight": req.weight,
            "height": req.height,
            "blood_sugar": {"value": req.blood_sugar_value, "type": req.blood_sugar_type},
        }

        log_entry = {
            "patient_id": patient_id,
            "recorded_by": user_id,
            "log_type": "vitals",
            "data": vitals_data,
            "notes": "Vitals recorded",
        }
        supabase.table("health_logs").insert(log_entry).execute()

        return {"success": True, "saved": True, "patient_id": patient_id}

    except Exception as e:
        print(f"Failed to save vitals: {e}")
        return {"success": False, "error": f"Failed to save vitals: {str(e)}"}
