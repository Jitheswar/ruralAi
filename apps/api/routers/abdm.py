"""ABDM (Ayushman Bharat Digital Mission) stub endpoints.

NOTE: These are development stubs. For production, integrate with
the real ABDM Gateway APIs (https://sandbox.abdm.gov.in/docs/).
"""

import json
import os
import secrets

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

router = APIRouter()

_mock_data_path = os.path.join(os.path.dirname(__file__), "..", "data", "mock_abdm_responses.json")


def _load_mock_data() -> dict:
    with open(_mock_data_path) as f:
        return json.load(f)


# In-memory OTP store for stub mode (transaction_id -> otp)
_pending_otps: dict[str, str] = {}


# --- Request / Response models ---


class ABHASearchRequest(BaseModel):
    abha_id: str


class ABHACreateRequest(BaseModel):
    name: str
    phone: str
    gender: str
    year_of_birth: int
    district: str
    state: str


class AuthInitRequest(BaseModel):
    abha_id: str
    purpose: str = "KYC"


class AuthConfirmRequest(BaseModel):
    transaction_id: str
    otp: str


class ConsentRequest(BaseModel):
    patient_abha_id: str
    hip_id: str
    purpose: str = "CAREMGT"
    date_from: str
    date_to: str


# --- Endpoints ---


@router.post("/search")
async def search_abha(req: ABHASearchRequest):
    """Search for a patient by ABHA ID."""
    mock = _load_mock_data()
    profiles = mock.get("profiles", {})

    if req.abha_id in profiles:
        return {"found": True, "profile": profiles[req.abha_id]}

    return {"found": False, "profile": None}


@router.post("/create")
async def create_abha(req: ABHACreateRequest):
    """Stub: Create a new ABHA ID for a patient."""
    mock_abha_id = f"{req.year_of_birth}-{req.phone[-4:]}-{hash(req.name) % 10000:04d}"
    return {
        "success": True,
        "abha_id": mock_abha_id,
        "health_id": f"{req.name.lower().replace(' ', '')[:10]}@abdm",
        "message": "ABHA ID created (stub — integrate ABDM Gateway for production)",
    }


@router.post("/auth/init")
async def auth_init(req: AuthInitRequest):
    """Stub: Initiate ABDM authentication. Generates a random OTP stored server-side."""
    txn_id = f"txn_{secrets.token_hex(6)}"
    otp = f"{secrets.randbelow(900000) + 100000}"
    _pending_otps[txn_id] = otp

    return {
        "transaction_id": txn_id,
        "message": f"OTP sent to registered mobile (stub mode — OTP: {otp})",
        "stub_otp": otp,
    }


@router.post("/auth/confirm")
async def auth_confirm(req: AuthConfirmRequest):
    """Stub: Confirm ABDM authentication with OTP."""
    expected_otp = _pending_otps.pop(req.transaction_id, None)

    if expected_otp is None:
        raise HTTPException(status_code=400, detail="Invalid or expired transaction ID")

    if req.otp != expected_otp:
        raise HTTPException(status_code=401, detail="Invalid OTP")

    return {
        "success": True,
        "access_token": f"stub_token_{secrets.token_hex(16)}",
        "message": "Authenticated (stub mode)",
    }


@router.post("/consent/request")
async def request_consent(req: ConsentRequest):
    """Stub: Request health data consent from patient."""
    mock = _load_mock_data()
    return {
        "consent_request_id": f"cr_{secrets.token_hex(6)}",
        "status": "REQUESTED",
        "message": "Consent request sent (stub)",
        "consent_artefact": mock.get("consent_artefact_sample"),
    }


@router.get("/consent/{consent_id}/status")
async def consent_status(consent_id: str):
    """Stub: Check consent request status."""
    return {
        "consent_id": consent_id,
        "status": "GRANTED",
        "granted_at": "2025-01-15T10:30:00Z",
    }
