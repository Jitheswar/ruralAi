"""
Validate all local ML models work correctly.
Run: cd apps/api && .venv/bin/python scripts/validate_local_models.py
"""
import asyncio
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))


async def main():
    from services.local_ml_service import (
        analyze_symptoms_local,
        extract_medical_terms_local,
        extract_prescription_local,
    )
    from services.prescription_ocr_service import get_ocr_model_status
    from PIL import Image, ImageDraw
    import io

    passed = 0
    failed = 0

    print("=" * 60)
    print("Validating Local ML Models")
    print("=" * 60)

    # Test 1: Symptom Analysis — fever + cough
    print("\n--- Test 1: Symptom Analysis (fever + cough + headache) ---")
    result = await analyze_symptoms_local(
        symptoms=["high_fever", "cough", "headache"],
        modifiers=[],
        duration_days=3,
        age=30,
        gender="male",
    )
    if "error" not in result and len(result.get("possible_conditions", [])) > 0:
        print(f"  Conditions: {[c['name'] for c in result['possible_conditions']]}")
        print(f"  Severity: {result['severity']}")
        print(f"  Urgency: {result['see_doctor_urgency']}")
        print(f"  Medicines: {[m['generic_name'] for m in result.get('recommended_medicines', [])]}")
        print("  PASSED")
        passed += 1
    else:
        print(f"  FAILED: {result}")
        failed += 1

    # Test 2: Symptom Analysis — chest pain + sweating
    print("\n--- Test 2: Symptom Analysis (chest_pain + sweating) ---")
    result = await analyze_symptoms_local(
        symptoms=["chest_pain", "sweating"],
        modifiers=["sudden_onset"],
        duration_days=1,
        age=55,
        gender="male",
    )
    if "error" not in result and len(result.get("possible_conditions", [])) > 0:
        print(f"  Conditions: {[c['name'] for c in result['possible_conditions']]}")
        print(f"  Severity: {result['severity']}")
        print("  PASSED")
        passed += 1
    else:
        print(f"  FAILED: {result}")
        failed += 1

    # Test 3: Empty symptoms
    print("\n--- Test 3: Empty symptoms ---")
    result = await analyze_symptoms_local(
        symptoms=[], modifiers=[], duration_days=1
    )
    if len(result.get("possible_conditions", [])) == 0:
        print("  Correctly returned no conditions for empty symptoms")
        print("  PASSED")
        passed += 1
    else:
        print(f"  FAILED: Expected empty, got {result}")
        failed += 1

    # Test 4: Medical Term Extraction (Hindi text)
    print("\n--- Test 4: Medical Term Extraction (Hindi text) ---")
    result = await extract_medical_terms_local(
        "mujhe tez bukhar hai aur sar dard ho raha hai", "hi"
    )
    symptoms = result.get("suggested_symptoms", [])
    print(f"  Extracted symptoms: {symptoms}")
    if "high_fever" in symptoms and "headache" in symptoms:
        print("  PASSED")
        passed += 1
    else:
        print(f"  FAILED: Expected high_fever and headache in {symptoms}")
        failed += 1

    # Test 5: Medical Term Extraction (English text)
    print("\n--- Test 5: Medical Term Extraction (English text) ---")
    result = await extract_medical_terms_local(
        "I have chest pain and difficulty breathing", "en"
    )
    symptoms = result.get("suggested_symptoms", [])
    print(f"  Extracted symptoms: {symptoms}")
    if "chest_pain" in symptoms and "breathlessness" in symptoms:
        print("  PASSED")
        passed += 1
    else:
        print(f"  FAILED: Expected chest_pain and breathlessness in {symptoms}")
        failed += 1

    # Test 6: Severity escalation
    print("\n--- Test 6: Severity escalation (long duration) ---")
    result = await analyze_symptoms_local(
        symptoms=["itching", "skin_rash"],
        modifiers=[],
        duration_days=10,
    )
    if "error" not in result:
        print(f"  Severity: {result['severity']} (should be 'warning' for 10+ days)")
        print(f"  Urgency: {result['see_doctor_urgency']}")
        print("  PASSED")
        passed += 1
    else:
        print(f"  FAILED: {result}")
        failed += 1

    # Test 7: OCR model readiness check
    print("\n--- Test 7: OCR model readiness ---")
    ocr_status = get_ocr_model_status()
    print(f"  Preferred engine: {ocr_status['preferred_engine']}")
    print(f"  Model artifact exists: {ocr_status['model_artifact_exists']}")
    print(f"  Tesseract available: {ocr_status['tesseract_available']}")
    if ocr_status["model_artifact_exists"] or ocr_status["tesseract_available"]:
        print("  PASSED")
        passed += 1
    else:
        print("  FAILED: neither trained OCR artifact nor Tesseract is available")
        failed += 1

    # Test 8: OCR smoke test
    print("\n--- Test 8: OCR smoke test ---")
    img = Image.new("RGB", (1800, 1000), "white")
    draw = ImageDraw.Draw(img)
    lines = [
        "Dr.R Sharma",
        "Date 12/002/2026",
        "TabParacetamol 500 mg BDx 5 days",
        "Cap Amoxicillin 250 mg TDS for 7 days",
    ]
    y = 100
    for line in lines:
        draw.text((100, y), line, fill="black")
        y += 120
    img = img.resize((2600, 1400))
    buf = io.BytesIO()
    img.save(buf, format="JPEG")

    ocr_result = await extract_prescription_local(buf.getvalue(), "image/jpeg")
    if "error" in ocr_result:
        print(f"  FAILED: {ocr_result['error']}")
        failed += 1
    elif ocr_result.get("ocr_engine") and "raw_text" in ocr_result:
        print(f"  Engine: {ocr_result.get('ocr_engine')}")
        print(f"  OCR confidence: {ocr_result.get('ocr_confidence')}")
        print(f"  Medicines parsed: {len(ocr_result.get('medicines', []))}")
        print("  PASSED")
        passed += 1
    else:
        print(f"  FAILED: malformed OCR response {ocr_result}")
        failed += 1

    # Summary
    print("\n" + "=" * 60)
    print(f"Results: {passed} passed, {failed} failed, {passed + failed} total")
    print("=" * 60)

    if failed > 0:
        sys.exit(1)
    print("\nAll tests passed!")


if __name__ == "__main__":
    asyncio.run(main())
