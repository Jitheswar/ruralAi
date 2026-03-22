"""
Vitals Router — save patient vitals and retrieve health logs from Supabase.
"""

import logging

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel, field_validator, model_validator

from services.auth import get_current_user_id, get_supabase_client
from services.patient_utils import get_or_create_self_patient

logger = logging.getLogger(__name__)

router = APIRouter()


@router.get("/health-logs")
async def get_health_logs(
    log_type: str | None = Query(None),
    user_id: str = Depends(get_current_user_id),
):
    """Fetch health logs for the current user.

    Returns logs the user recorded themselves AND logs recorded for any
    patient record linked to the user (via patients.user_id).  This ensures
    citizens see logs a sahayak recorded on their behalf.
    """
    try:
        supabase = get_supabase_client()

        # 1. Logs recorded by this user directly
        q1 = supabase.table("health_logs").select("*").eq("recorded_by", user_id)
        if log_type:
            q1 = q1.eq("log_type", log_type)
        q1 = q1.order("created_at", desc=True)
        res1 = q1.execute()

        # 2. Logs for patient records linked to this user (citizen's own records
        #    recorded by sahayaks/admins)
        linked_patients = (
            supabase.table("patients")
            .select("id")
            .eq("user_id", user_id)
            .execute()
        )
        linked_ids = [p["id"] for p in (linked_patients.data or [])]

        extra_logs: list = []
        if linked_ids:
            q2 = supabase.table("health_logs").select("*").in_("patient_id", linked_ids)
            if log_type:
                q2 = q2.eq("log_type", log_type)
            q2 = q2.order("created_at", desc=True)
            res2 = q2.execute()
            extra_logs = res2.data or []

        # Merge and deduplicate (a log recorded_by the user for their own
        # patient would appear in both sets)
        seen_ids: set[str] = set()
        merged: list = []
        for log in (res1.data or []) + extra_logs:
            if log["id"] not in seen_ids:
                seen_ids.add(log["id"])
                merged.append(log)

        # Sort merged list by created_at descending
        merged.sort(key=lambda x: x.get("created_at", ""), reverse=True)

        return {"success": True, "logs": merged}
    except Exception as e:
        logger.error("Failed to fetch health logs: %s", e)
        raise HTTPException(status_code=500, detail=f"Failed to fetch health logs: {str(e)}")


class VitalsRequest(BaseModel):
    patient_id: str | None = None
    temperature: float | None = None
    bp_systolic: int | None = None
    bp_diastolic: int | None = None
    pulse: int | None = None
    spo2: int | None = None
    respiratory_rate: int | None = None
    weight: float | None = None
    height: float | None = None
    blood_sugar_value: float | None = None
    blood_sugar_type: str = "random"

    @field_validator('temperature')
    @classmethod
    def validate_temperature(cls, v: float | None) -> float | None:
        if v is not None and not (30.0 <= v <= 45.0):
            raise ValueError('Temperature must be between 30.0 and 45.0 °C')
        return v

    @field_validator('spo2')
    @classmethod
    def validate_spo2(cls, v: int | None) -> int | None:
        if v is not None and not (0 <= v <= 100):
            raise ValueError('SpO2 must be between 0 and 100%')
        return v

    @field_validator('bp_systolic')
    @classmethod
    def validate_bp_systolic(cls, v: int | None) -> int | None:
        if v is not None and not (50 <= v <= 300):
            raise ValueError('Systolic BP must be between 50 and 300 mmHg')
        return v

    @field_validator('bp_diastolic')
    @classmethod
    def validate_bp_diastolic(cls, v: int | None) -> int | None:
        if v is not None and not (30 <= v <= 200):
            raise ValueError('Diastolic BP must be between 30 and 200 mmHg')
        return v

    @model_validator(mode="after")
    def validate_bp_pair(self):
        if (
            self.bp_systolic is not None
            and self.bp_diastolic is not None
            and self.bp_systolic <= self.bp_diastolic
        ):
            raise ValueError("Systolic BP must be greater than diastolic BP")
        return self


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
            patient_id = get_or_create_self_patient(supabase, user_id)

        if not patient_id:
            raise HTTPException(status_code=500, detail="Could not find or create patient record")

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
        logger.error("Failed to save vitals: %s", e)
        raise HTTPException(status_code=500, detail=f"Failed to save vitals: {str(e)}")
