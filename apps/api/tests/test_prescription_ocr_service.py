from __future__ import annotations

import io

from PIL import Image, ImageDraw

import services.prescription_ocr_service as ocr_service
from services.prescription_ocr_service import OCRRecognitionResult


def _make_fixture_image() -> bytes:
    img = Image.new("RGB", (1700, 1100), "white")
    draw = ImageDraw.Draw(img)
    lines = [
        "Dr.R Sharma",
        "Date: 12/002/2026",
        "TabParacetamol 500 mg BDx 5 days",
        "Cap Amoxicillin 250 mg TDS for 7 days",
    ]
    y = 100
    for line in lines:
        draw.text((120, y), line, fill="black")
        y += 130
    img = img.resize((2500, 1500))
    buf = io.BytesIO()
    img.save(buf, format="PNG")
    return buf.getvalue()


def test_pipeline_parses_synthetic_fixture(monkeypatch):
    fixture_bytes = _make_fixture_image()

    def fake_recognize(_line_images, _preferred_engine):
        return OCRRecognitionResult(
            lines=[
                "Dr.R Sharma",
                "Date: 12/002/2026",
                "TabParacetamol 500 mg BDx 5 days",
                "Cap Amoxicillin 250 mg TDS for 7 days",
            ],
            confidence=0.91,
            engine="local-trocr",
            warnings=[],
        )

    monkeypatch.setattr(ocr_service, "_recognize_lines", fake_recognize)
    result = ocr_service.extract_prescription_with_local_model(fixture_bytes, "image/png")

    assert "error" not in result
    assert result["ocr_engine"] == "local-trocr"
    assert result["ocr_confidence"] == 0.91
    assert result["date"] == "12/02/2026"
    assert len(result["medicines"]) >= 2
    assert any("paracetamol" in m["brand_name"].lower() for m in result["medicines"])
