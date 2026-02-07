"""Prescription OCR stub endpoints."""

from fastapi import APIRouter, UploadFile, File
from pydantic import BaseModel
from typing import Optional

router = APIRouter()

# Mock medicine extraction results
MOCK_PRESCRIPTIONS = [
    {
        "medicines": [
            {
                "name": "Amoxicillin 500mg",
                "dosage": "1 tablet",
                "frequency": "3 times a day",
                "duration": "5 days",
                "market_price": 85.0,
                "jan_aushadhi_price": 12.5,
                "jan_aushadhi_name": "Amoxicillin 500mg Cap",
                "savings_percent": 85,
            },
            {
                "name": "Paracetamol 650mg",
                "dosage": "1 tablet",
                "frequency": "As needed (max 4/day)",
                "duration": "3 days",
                "market_price": 30.0,
                "jan_aushadhi_price": 5.0,
                "jan_aushadhi_name": "Paracetamol 650mg Tab",
                "savings_percent": 83,
            },
            {
                "name": "Pantoprazole 40mg",
                "dosage": "1 tablet",
                "frequency": "Once daily before breakfast",
                "duration": "7 days",
                "market_price": 120.0,
                "jan_aushadhi_price": 18.0,
                "jan_aushadhi_name": "Pantoprazole 40mg Tab",
                "savings_percent": 85,
            },
        ],
        "doctor_name": "Dr. Sharma",
        "date": "2025-01-10",
        "total_market_price": 235.0,
        "total_jan_aushadhi_price": 35.5,
    },
    {
        "medicines": [
            {
                "name": "Metformin 500mg",
                "dosage": "1 tablet",
                "frequency": "Twice daily with meals",
                "duration": "30 days",
                "market_price": 65.0,
                "jan_aushadhi_price": 11.0,
                "jan_aushadhi_name": "Metformin 500mg Tab",
                "savings_percent": 83,
            },
            {
                "name": "Amlodipine 5mg",
                "dosage": "1 tablet",
                "frequency": "Once daily",
                "duration": "30 days",
                "market_price": 45.0,
                "jan_aushadhi_price": 7.0,
                "jan_aushadhi_name": "Amlodipine 5mg Tab",
                "savings_percent": 84,
            },
        ],
        "doctor_name": "Dr. Patel",
        "date": "2025-01-12",
        "total_market_price": 110.0,
        "total_jan_aushadhi_price": 18.0,
    },
]

_call_counter = 0


@router.post("/prescription")
async def scan_prescription(image: UploadFile = File(...)):
    """
    Accept a prescription image and return extracted medicine data
    with Jan Aushadhi price comparisons.

    In production: Tesseract/PaddleOCR → NER → Medicine DB lookup.
    """
    global _call_counter

    # Read file to acknowledge it
    await image.read()

    result = MOCK_PRESCRIPTIONS[_call_counter % len(MOCK_PRESCRIPTIONS)]
    _call_counter += 1

    return {
        "success": True,
        "prescription": result,
    }


class MedicineLookupRequest(BaseModel):
    medicine_name: str


@router.post("/medicine-lookup")
async def lookup_medicine(req: MedicineLookupRequest):
    """Look up Jan Aushadhi alternative for a given medicine name."""
    name_lower = req.medicine_name.lower()

    alternatives = {
        "amoxicillin": {
            "found": True,
            "brand_name": "Amoxicillin 500mg",
            "jan_aushadhi_name": "Amoxicillin 500mg Cap",
            "market_price": 85.0,
            "jan_aushadhi_price": 12.5,
            "available_at": ["Jan Aushadhi Kendra, Block PHC", "District Hospital Pharmacy"],
        },
        "paracetamol": {
            "found": True,
            "brand_name": "Paracetamol 650mg",
            "jan_aushadhi_name": "Paracetamol 650mg Tab",
            "market_price": 30.0,
            "jan_aushadhi_price": 5.0,
            "available_at": ["Jan Aushadhi Kendra, Block PHC"],
        },
        "metformin": {
            "found": True,
            "brand_name": "Metformin 500mg",
            "jan_aushadhi_name": "Metformin 500mg Tab",
            "market_price": 65.0,
            "jan_aushadhi_price": 11.0,
            "available_at": ["Jan Aushadhi Kendra, Block PHC", "District Hospital Pharmacy"],
        },
        "amlodipine": {
            "found": True,
            "brand_name": "Amlodipine 5mg",
            "jan_aushadhi_name": "Amlodipine 5mg Tab",
            "market_price": 45.0,
            "jan_aushadhi_price": 7.0,
            "available_at": ["Jan Aushadhi Kendra, Block PHC"],
        },
        "pantoprazole": {
            "found": True,
            "brand_name": "Pantoprazole 40mg",
            "jan_aushadhi_name": "Pantoprazole 40mg Tab",
            "market_price": 120.0,
            "jan_aushadhi_price": 18.0,
            "available_at": ["District Hospital Pharmacy"],
        },
    }

    for key, data in alternatives.items():
        if key in name_lower:
            return data

    return {"found": False, "message": f"No Jan Aushadhi alternative found for '{req.medicine_name}'"}
