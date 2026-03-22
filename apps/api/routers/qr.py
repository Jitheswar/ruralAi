"""QR code token endpoints — generate and verify signed patient record pointers.

The QR payload contains only a signed pointer {sub, typ, exp, sig}, never
sensitive medical data.  The signing secret (QR_SIGNING_SECRET) must stay
server-side.
"""

import hashlib
import hmac
import json
import logging
import os
import time

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

from services.auth import get_current_user_id, get_supabase_client

logger = logging.getLogger(__name__)

router = APIRouter()

# Default TTL: 10 minutes
DEFAULT_TTL_SECONDS = int(os.getenv("QR_TTL_SECONDS", "600"))


def _get_signing_secret() -> bytes:
    secret = os.getenv("QR_SIGNING_SECRET", "")
    if not secret:
        raise RuntimeError("QR_SIGNING_SECRET must be set")
    return secret.encode()


def _sign(payload: dict) -> str:
    """Return a hex HMAC-SHA256 signature over the canonical JSON of *payload*."""
    canon = json.dumps(payload, sort_keys=True, separators=(",", ":"))
    return hmac.new(_get_signing_secret(), canon.encode(), hashlib.sha256).hexdigest()


def _verify_sig(payload: dict, sig: str) -> bool:
    expected = _sign(payload)
    return hmac.compare_digest(expected, sig)


# ── Request / response models ──────────────────────────────────────

class GenerateRequest(BaseModel):
    """Generate a QR token for a patient or health-log record."""
    subject_id: str          # patient_id or health_log_id
    subject_type: str = "patient"  # "patient" or "health_log"
    ttl_seconds: int | None = None


class GenerateResponse(BaseModel):
    qr_payload: str          # JSON string to encode into the QR image


class VerifyRequest(BaseModel):
    qr_payload: str          # raw JSON string scanned from the QR


# ── Endpoints ───────────────────────────────────────────────────────

@router.post("/generate", response_model=GenerateResponse)
async def generate_qr_token(
    req: GenerateRequest,
    user_id: str = Depends(get_current_user_id),
):
    """Generate a signed, time-limited QR payload for a record.

    The caller must own the patient record (created_by or user_id match) or
    be an admin.
    """
    supabase = get_supabase_client()

    # Authorization: ensure the caller can access this record
    if req.subject_type == "patient":
        patient = (
            supabase.table("patients")
            .select("id, created_by, user_id")
            .eq("id", req.subject_id)
            .maybeSingle()
            .execute()
        )
        if not patient.data:
            raise HTTPException(status_code=404, detail="Patient not found")
        p = patient.data
        # Check caller role
        user_row = (
            supabase.table("users")
            .select("role")
            .eq("id", user_id)
            .maybeSingle()
            .execute()
        )
        role = user_row.data.get("role", "citizen") if user_row.data else "citizen"
        if role != "admin" and p["created_by"] != user_id and p.get("user_id") != user_id:
            raise HTTPException(status_code=403, detail="Not authorized to share this record")
    elif req.subject_type == "health_log":
        log = (
            supabase.table("health_logs")
            .select("id, recorded_by, patient_id")
            .eq("id", req.subject_id)
            .maybeSingle()
            .execute()
        )
        if not log.data:
            raise HTTPException(status_code=404, detail="Health log not found")
        if log.data["recorded_by"] != user_id:
            # Also allow if the patient is linked to this user
            patient = (
                supabase.table("patients")
                .select("user_id")
                .eq("id", log.data["patient_id"])
                .maybeSingle()
                .execute()
            )
            if not patient.data or patient.data.get("user_id") != user_id:
                raise HTTPException(status_code=403, detail="Not authorized to share this record")
    else:
        raise HTTPException(status_code=400, detail=f"Unsupported subject_type: {req.subject_type}")

    ttl = req.ttl_seconds if req.ttl_seconds and req.ttl_seconds > 0 else DEFAULT_TTL_SECONDS
    exp = int(time.time()) + ttl

    token_body = {
        "sub": req.subject_id,
        "typ": req.subject_type,
        "exp": exp,
    }
    sig = _sign(token_body)
    token_body["sig"] = sig

    return GenerateResponse(qr_payload=json.dumps(token_body, separators=(",", ":")))


@router.post("/verify")
async def verify_qr_token(
    req: VerifyRequest,
    user_id: str = Depends(get_current_user_id),
):
    """Verify a scanned QR token and return the referenced record.

    Checks signature validity + expiry before any database lookup.
    """
    try:
        payload = json.loads(req.qr_payload)
    except (json.JSONDecodeError, TypeError):
        raise HTTPException(status_code=400, detail="Invalid QR payload")

    required = {"sub", "typ", "exp", "sig"}
    if not required.issubset(payload.keys()):
        raise HTTPException(status_code=400, detail="Malformed QR token — missing fields")

    sig = payload.pop("sig")
    if not _verify_sig(payload, sig):
        raise HTTPException(status_code=403, detail="Invalid QR signature")

    if int(payload["exp"]) < int(time.time()):
        raise HTTPException(status_code=410, detail="QR code has expired")

    supabase = get_supabase_client()
    subject_type = payload["typ"]
    subject_id = payload["sub"]

    if subject_type == "patient":
        result = (
            supabase.table("patients")
            .select("id, name, phone, age, gender, village, district, abha_id, created_at")
            .eq("id", subject_id)
            .maybeSingle()
            .execute()
        )
        if not result.data:
            raise HTTPException(status_code=404, detail="Patient record not found")
        return {"success": True, "type": "patient", "record": result.data}

    elif subject_type == "health_log":
        result = (
            supabase.table("health_logs")
            .select("id, patient_id, log_type, data, notes, created_at")
            .eq("id", subject_id)
            .maybeSingle()
            .execute()
        )
        if not result.data:
            raise HTTPException(status_code=404, detail="Health log not found")
        return {"success": True, "type": "health_log", "record": result.data}

    raise HTTPException(status_code=400, detail=f"Unknown record type: {subject_type}")
