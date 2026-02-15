from services.prescription_ocr_service import parse_prescription_text


def test_parser_handles_dr_compact_name_and_malformed_date():
    raw = "\n".join(
        [
            "Dr.R Sharma",
            "Date: 12/002/2026",
            "TabParacetamol 500 mg BDx 5 days",
        ]
    )
    parsed = parse_prescription_text(raw)

    assert parsed["doctor_name"] == "R Sharma"
    assert parsed["date"] == "12/02/2026"
    assert len(parsed["medicines"]) >= 1
    assert parsed["medicines"][0]["frequency"] == "twice daily"


def test_parser_normalizes_common_frequency_abbreviations():
    raw = "Cap Amoxicillin 250 mg TDS for 7 days"
    parsed = parse_prescription_text(raw)
    assert len(parsed["medicines"]) == 1

    med = parsed["medicines"][0]
    assert med["frequency"] == "three times daily"
    assert med["duration"] == "7 days"
    assert med["dosage"] == "250 mg"


def test_parser_handles_missing_spacing_between_dosage_form_and_name():
    raw = "SypCetirizine 5 mg ODx 3 days"
    parsed = parse_prescription_text(raw)
    assert len(parsed["medicines"]) == 1
    assert parsed["medicines"][0]["frequency"] == "once daily"
    assert parsed["medicines"][0]["duration"] == "3 days"
