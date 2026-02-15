from __future__ import annotations

import io

from fastapi.testclient import TestClient
from PIL import Image

from main import app
from services.auth import get_current_user_id
import routers.ocr as ocr_router


def _fake_image_bytes() -> bytes:
    img = Image.new("RGB", (320, 220), "white")
    buf = io.BytesIO()
    img.save(buf, format="PNG")
    return buf.getvalue()


def test_prescription_endpoint_requires_auth():
    client = TestClient(app)
    files = {"image": ("prescription.png", _fake_image_bytes(), "image/png")}
    response = client.post("/api/ocr/prescription", files=files)
    assert response.status_code == 401


def test_prescription_endpoint_returns_ocr_metadata(monkeypatch):
    client = TestClient(app)

    async def fake_extract(_image_data, _mime_type):
        return {
            "medicines": [
                {
                    "brand_name": "Paracetamol",
                    "generic_name": None,
                    "dosage": "500 mg",
                    "frequency": "twice daily",
                    "duration": "5 days",
                }
            ],
            "doctor_name": "R Sharma",
            "date": "12/02/2026",
            "notes": "Synthetic test extraction",
            "raw_text": "Dr.R Sharma\nTab Paracetamol 500 mg BD x 5 days",
            "ocr_engine": "local-trocr",
            "ocr_confidence": 0.9,
            "warnings": [],
        }

    async def fake_db_lookup(_names):
        return [
            {
                "brand_name": "Paracetamol",
                "generic_name": "Paracetamol",
                "market_price": 30.0,
                "jan_aushadhi_price": 5.0,
                "jan_aushadhi_name": "Paracetamol Tablets",
                "savings_percent": 83.33,
                "uses": ["Fever reduction"],
                "side_effects": ["Nausea"],
            }
        ]

    class _DummyQuery:
        def insert(self, _row):
            return self

        def execute(self):
            return {"ok": True}

    class _DummySupabase:
        def table(self, _name):
            return _DummyQuery()

    app.dependency_overrides[get_current_user_id] = lambda: "test-user"
    monkeypatch.setattr(ocr_router, "extract_prescription", fake_extract)
    monkeypatch.setattr(ocr_router, "get_medicines_by_names", fake_db_lookup)
    monkeypatch.setattr(ocr_router, "get_supabase_client", lambda: _DummySupabase())
    monkeypatch.setattr(ocr_router, "get_or_create_self_patient", lambda *_args, **_kwargs: "patient-1")

    try:
        files = {"image": ("prescription.png", _fake_image_bytes(), "image/png")}
        response = client.post("/api/ocr/prescription", files=files)
    finally:
        app.dependency_overrides.clear()

    assert response.status_code == 200
    payload = response.json()
    assert payload["success"] is True
    assert payload["prescription"]["ocr_engine"] == "local-trocr"
    assert isinstance(payload["prescription"]["warnings"], list)
    assert payload["prescription"]["raw_text"]
