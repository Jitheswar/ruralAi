"""ABDM (Ayushman Bharat Digital Mission) stub endpoints."""

import json
import os
from typing import Optional

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

router = APIRouter()

# Load mock data
_mock_data_path = os.path.join(os.path.dirname(__file__), "..", "data", "mock_abdm_responses.json")


def _load_mock_data() -> dict:
    with open(_mock_data_path) as f:
        return json.load(f)


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
    """Search for a patient by ABHA ID. Returns mock profile data."""
    mock = _load_mock_data()
    profiles = mock.get("profiles", {})

    if req.abha_id in profiles:
        return {"found": True, "profile": profiles[req.abha_id]}

    return {"found": False, "profile": None}


@router.post("/create")
async def create_abha(req: ABHACreateRequest):
    """Stub: Create a new ABHA ID for a patient."""
    # In production this calls ABDM's /v1/registration/aadhaar/generateOtp flow
    mock_abha_id = f"{req.year_of_birth}-{req.phone[-4:]}-{hash(req.name) % 10000:04d}"
    return {
        "success": True,
        "abha_id": mock_abha_id,
        "health_id": f"{req.name.lower().replace(' ', '')[:10]}@abdm",
        "message": "ABHA ID created (mock)",
    }


@router.post("/auth/init")
async def auth_init(req: AuthInitRequest):
    """Stub: Initiate ABDM authentication (OTP to Aadhaar-linked mobile)."""
    return {
        "transaction_id": f"txn_{hash(req.abha_id) % 100000:05d}",
        "message": "OTP sent to registered mobile (mock)",
    }


@router.post("/auth/confirm")
async def auth_confirm(req: AuthConfirmRequest):
    """Stub: Confirm ABDM authentication with OTP."""
    if req.otp != "123456":
        raise HTTPException(status_code=401, detail="Invalid OTP")

    return {
        "success": True,
        "access_token": "mock_abdm_access_token_xyz",
        "token_valid_till": "2025-12-31T23:59:59Z",
    }


@router.post("/consent/request")
async def request_consent(req: ConsentRequest):
    """Stub: Request health data consent from patient."""
    mock = _load_mock_data()
    return {
        "consent_request_id": f"cr_{hash(req.patient_abha_id) % 100000:05d}",
        "status": "REQUESTED",
        "message": "Consent request sent (mock)",
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
