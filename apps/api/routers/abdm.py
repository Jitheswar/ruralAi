"""ABDM (Ayushman Bharat Digital Mission) stub endpoints.

NOTE: These are development stubs. For production, integrate with
the real ABDM Gateway APIs (https://sandbox.abdm.gov.in/docs/).
"""

import json
import logging
import os
import secrets
from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel

from services.auth import get_supabase_client
from services.rate_limit import limiter

logger = logging.getLogger(__name__)

router = APIRouter()

_mock_data_path = os.path.join(os.path.dirname(__file__), "..", "data", "mock_abdm_responses.json")

_mock_data_cache: dict | None = None


def _load_mock_data() -> dict:
    global _mock_data_cache
    if _mock_data_cache is None:
        with open(_mock_data_path) as f:
            _mock_data_cache = json.load(f)
    return _mock_data_cache


_OTP_TTL_SECONDS = int(os.getenv("ABDM_OTP_TTL_SECONDS", "300"))
_OTP_MAX_ATTEMPTS = int(os.getenv("ABDM_OTP_MAX_ATTEMPTS", "5"))
_OTP_STORE_TABLE = "abdm_pending_otps"
_OTP_STORE_ERROR = (
    "ABDM OTP store unavailable. Run migration 'add_abdm_pending_otps.sql' and "
    "ensure database connectivity."
)


def _now_utc() -> datetime:
    return datetime.now(timezone.utc)


def _otp_store():
    try:
        return get_supabase_client().table(_OTP_STORE_TABLE)
    except Exception as e:
        raise HTTPException(status_code=503, detail=_OTP_STORE_ERROR) from e


def _cleanup_expired_otps():
    try:
        _otp_store().delete().lt("expires_at", _now_utc().isoformat()).execute()
    except Exception as e:
        raise HTTPException(status_code=503, detail=_OTP_STORE_ERROR) from e


def _delete_txn(transaction_id: str):
    try:
        _otp_store().delete().eq("transaction_id", transaction_id).execute()
    except Exception as e:
        raise HTTPException(status_code=503, detail=_OTP_STORE_ERROR) from e


def _fetch_txn(transaction_id: str) -> dict | None:
    try:
        res = (
            _otp_store()
            .select("transaction_id, otp, attempts, max_attempts, expires_at")
            .eq("transaction_id", transaction_id)
            .limit(1)
            .execute()
        )
    except Exception as e:
        raise HTTPException(status_code=503, detail=_OTP_STORE_ERROR) from e
    data = res.data or []
    return data[0] if data else None


def _is_expired(expires_at: str | None) -> bool:
    if not expires_at:
        return True
    try:
        parsed = datetime.fromisoformat(expires_at.replace("Z", "+00:00"))
    except Exception:
        return True
    return parsed <= _now_utc()


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
@limiter.limit("5/minute")
async def auth_init(request: Request, req: AuthInitRequest):
    """Stub: Initiate ABDM authentication. Generates a random OTP stored server-side."""
    _cleanup_expired_otps()

    txn_id = f"txn_{secrets.token_hex(6)}"
    otp = f"{secrets.randbelow(900000) + 100000}"
    expires_at = _now_utc() + timedelta(seconds=_OTP_TTL_SECONDS)

    try:
        _otp_store().insert(
            {
                "transaction_id": txn_id,
                "abha_id": req.abha_id,
                "otp": otp,
                "attempts": 0,
                "max_attempts": _OTP_MAX_ATTEMPTS,
                "expires_at": expires_at.isoformat(),
            }
        ).execute()
    except Exception as e:
        raise HTTPException(status_code=503, detail=_OTP_STORE_ERROR) from e

    # Log OTP at DEBUG level only — suppressed in production
    logger.debug("ABDM STUB: transaction=%s otp=%s", txn_id, otp)

    return {
        "transaction_id": txn_id,
        "message": "OTP sent to registered mobile number",
    }


@router.post("/auth/confirm")
async def auth_confirm(req: AuthConfirmRequest):
    """Stub: Confirm ABDM authentication with OTP."""
    otp_entry = _fetch_txn(req.transaction_id)

    if otp_entry is None:
        raise HTTPException(status_code=400, detail="Invalid or expired transaction ID")

    if _is_expired(otp_entry.get("expires_at")):
        _delete_txn(req.transaction_id)
        raise HTTPException(status_code=400, detail="Invalid or expired transaction ID")

    if req.otp != otp_entry["otp"]:
        attempts = int(otp_entry.get("attempts") or 0) + 1
        max_attempts = int(otp_entry.get("max_attempts") or _OTP_MAX_ATTEMPTS)
        if attempts >= max_attempts:
            _delete_txn(req.transaction_id)
        else:
            try:
                _otp_store().update(
                    {"attempts": attempts}
                ).eq("transaction_id", req.transaction_id).execute()
            except Exception as e:
                raise HTTPException(status_code=503, detail=_OTP_STORE_ERROR) from e
        raise HTTPException(status_code=401, detail="Invalid OTP")

    _delete_txn(req.transaction_id)

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
