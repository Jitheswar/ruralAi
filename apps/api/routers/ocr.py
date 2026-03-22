"""
Prescription OCR Router — local prescription scanning and
Supabase medicine DB lookups/price comparisons.
"""

import logging
import re

from fastapi import APIRouter, UploadFile, File, Depends, HTTPException, Request
from pydantic import BaseModel

from services.rate_limit import limiter

from services.ai_service import extract_prescription
from services.medicine_db import search_medicines, get_medicines_by_names
from services.auth import get_current_user_id, get_supabase_client
from services.patient_utils import get_or_create_self_patient

logger = logging.getLogger(__name__)

router = APIRouter()

MAX_IMAGE_SIZE = 10 * 1024 * 1024  # 10 MB


def _normalize_medicine_name(name: str) -> str:
    return re.sub(r"[^a-z0-9]+", " ", name.lower()).strip()


def _confidence_to_score(confidence: str | float | int | None) -> float:
    if isinstance(confidence, (float, int)):
        return max(0.0, min(1.0, float(confidence)))
    if not confidence:
        return 0.0
    token = str(confidence).strip().lower()
    return {
        "high": 0.9,
        "medium": 0.65,
        "low": 0.35,
    }.get(token, 0.0)


def _is_reasonable_match(search_term: str, candidate: str) -> bool:
    if not search_term or not candidate:
        return False
    if search_term == candidate:
        return True

    shorter, longer = (search_term, candidate) if len(search_term) <= len(candidate) else (candidate, search_term)
    if len(shorter) >= 5 and shorter in longer:
        return True

    search_tokens = set(search_term.split())
    candidate_tokens = set(candidate.split())
    common = search_tokens.intersection(candidate_tokens)
    return any(len(token) >= 5 for token in common)


@router.post("/prescription")
@limiter.limit("10/minute")
async def scan_prescription(
    request: Request,
    image: UploadFile = File(...),
    user_id: str = Depends(get_current_user_id)
):
    """
    Accept a prescription image, extract medicines via local OCR,
    then look up Jan Aushadhi alternatives from the medicine database.
    """
    image_bytes = await image.read()
    if len(image_bytes) > MAX_IMAGE_SIZE:
        raise HTTPException(status_code=413, detail="Image too large. Maximum size is 10 MB.")
    mime_type = image.content_type or "image/jpeg"

    # 1. Extract medicines from image using local OCR pipeline
    extraction = await extract_prescription(image_bytes, mime_type)

    if "error" in extraction:
        return {"success": False, "error": extraction["error"]}

    raw_medicines = extraction.get("medicines", [])
    doctor_name = extraction.get("doctor_name") or "Unknown"
    date = extraction.get("date") or "Not specified"
    raw_text = extraction.get("raw_text", "")
    ocr_engine = extraction.get("ocr_engine", "local-ocr")
    ocr_confidence = _confidence_to_score(extraction.get("ocr_confidence") or extraction.get("confidence"))
    warnings = extraction.get("warnings", []) if isinstance(extraction.get("warnings"), list) else []

    # 2. Look up each extracted medicine in our database for Jan Aushadhi alternatives
    medicine_names = [
        m.get("brand_name") or m.get("generic_name", "")
        for m in raw_medicines
        if m.get("brand_name") or m.get("generic_name")
    ]

    db_matches = await get_medicines_by_names(medicine_names) if medicine_names else []

    # 3. Build enriched results
    enriched_medicines = []
    total_market = 0.0
    total_jan_aushadhi = 0.0

    for raw_med in raw_medicines:
        brand = raw_med.get("brand_name", "")
        generic = raw_med.get("generic_name", "")
        search_term = _normalize_medicine_name(brand or generic)

        # Find best match from DB
        db_match = None
        for dbm in db_matches:
            brand_name = _normalize_medicine_name(dbm.get("brand_name", ""))
            generic_name = _normalize_medicine_name(dbm.get("generic_name", ""))
            if (
                _is_reasonable_match(search_term, brand_name)
                or _is_reasonable_match(search_term, generic_name)
            ):
                db_match = dbm
                break

        market_price = float(db_match["market_price"]) if db_match and db_match.get("market_price") else 0
        jan_price = float(db_match["jan_aushadhi_price"]) if db_match and db_match.get("jan_aushadhi_price") else 0
        savings = float(db_match["savings_percent"]) if db_match and db_match.get("savings_percent") else 0

        total_market += market_price
        total_jan_aushadhi += jan_price

        enriched_medicines.append({
            "name": brand or generic or "Unknown",
            "generic_name": db_match["generic_name"] if db_match else generic,
            "dosage": raw_med.get("dosage", ""),
            "frequency": raw_med.get("frequency", ""),
            "duration": raw_med.get("duration", ""),
            "market_price": market_price,
            "jan_aushadhi_price": jan_price,
            "jan_aushadhi_name": db_match["jan_aushadhi_name"] if db_match else "",
            "savings_percent": savings,
            "uses": db_match.get("uses", []) if db_match else [],
            "side_effects": db_match.get("side_effects", []) if db_match else [],
            "found_in_db": db_match is not None,
        })

    # 4. Save to Health Records (Supabase) — BEFORE returning response
    saved = False
    try:
        supabase = get_supabase_client()
        patient_id = get_or_create_self_patient(supabase, user_id)

        if patient_id:
            log_entry = {
                "patient_id": patient_id,
                "recorded_by": user_id,
                "log_type": "prescription",
                "data": {
                    "extraction": extraction,
                    "analysis": {
                         "medicines": enriched_medicines,
                         "doctor_name": doctor_name,
                         "date": date,
                         "total_market_price": total_market,
                         "total_jan_aushadhi_price": total_jan_aushadhi,
                         "notes": extraction.get("notes", ""),
                         "raw_text": raw_text,
                         "ocr_engine": ocr_engine,
                         "ocr_confidence": ocr_confidence,
                         "warnings": warnings,
                    }
                },
                "notes": f"Prescription from {doctor_name}",
            }
            supabase.table("health_logs").insert(log_entry).execute()
            saved = True

    except Exception as e:
        logger.error("Failed to auto-save prescription record: %s", e)

    return {
        "success": True,
        "saved": saved,
        "prescription": {
            "medicines": enriched_medicines,
            "doctor_name": doctor_name,
            "date": date,
            "total_market_price": round(total_market, 2),
            "total_jan_aushadhi_price": round(total_jan_aushadhi, 2),
            "notes": extraction.get("notes", ""),
            "raw_text": raw_text,
            "ocr_engine": ocr_engine,
            "ocr_confidence": ocr_confidence,
            "warnings": warnings,
        },
    }


class MedicineLookupRequest(BaseModel):
    medicine_name: str


@router.post("/medicine-lookup")
@limiter.limit("20/minute")
async def lookup_medicine(request: Request, req: MedicineLookupRequest):
    """Look up a medicine in the database — returns Jan Aushadhi alternative and details."""
    results = await search_medicines(req.medicine_name, limit=5)

    if not results:
        return {"found": False, "message": f"No results found for '{req.medicine_name}'"}

    # Return the best match (first result) plus alternatives
    best = results[0]
    return {
        "found": True,
        "medicine_name": best.get("brand_name", ""),
        "generic_name": best.get("generic_name", ""),
        "salt_composition": best.get("salt_composition", ""),
        "category": best.get("category", ""),
        "market_price": float(best["market_price"]) if best.get("market_price") else None,
        "jan_aushadhi_name": best.get("jan_aushadhi_name", ""),
        "jan_aushadhi_price": float(best["jan_aushadhi_price"]) if best.get("jan_aushadhi_price") else None,
        "savings_percent": float(best["savings_percent"]) if best.get("savings_percent") else None,
        "dosage_form": best.get("dosage_form", ""),
        "strength": best.get("strength", ""),
        "uses": best.get("uses", []),
        "side_effects": best.get("side_effects", []),
        "contraindications": best.get("contraindications", []),
        "hindi_name": best.get("hindi_name", ""),
        "is_nlem": best.get("is_nlem", False),
        "alternatives": [
            {
                "brand_name": r.get("brand_name", ""),
                "generic_name": r.get("generic_name", ""),
                "strength": r.get("strength", ""),
                "market_price": float(r["market_price"]) if r.get("market_price") else None,
                "jan_aushadhi_price": float(r["jan_aushadhi_price"]) if r.get("jan_aushadhi_price") else None,
            }
            for r in results[1:]
        ],
    }
