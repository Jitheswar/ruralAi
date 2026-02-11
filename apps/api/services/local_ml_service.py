"""
Local ML Service — symptom prediction, prescription OCR, and voice transcription
using local models (scikit-learn, Tesseract, faster-whisper).
Replaces cloud AI (GPT/Gemini) for all tasks.
"""

import os
import io
import re
import json
import asyncio
import numpy as np
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
MODELS_DIR = BASE_DIR / "models"
DATA_DIR = BASE_DIR / "data"

# Lazy-loaded globals
_symptom_model = None
_disease_metadata = None
_symptom_mapping = None
_medical_keywords = None
_whisper_model = None


# ─── Loaders ─────────────────────────────────────────────────────────


def _load_symptom_model():
    global _symptom_model
    if _symptom_model is None:
        import joblib
        model_path = MODELS_DIR / "symptom_model.joblib"
        if not model_path.exists():
            raise FileNotFoundError(
                f"Symptom model not found at {model_path}. Run: python scripts/train_model.py"
            )
        _symptom_model = joblib.load(model_path)
    return _symptom_model


def _load_disease_metadata():
    global _disease_metadata
    if _disease_metadata is None:
        path = DATA_DIR / "disease_metadata.json"
        if not path.exists():
            raise FileNotFoundError(f"Disease metadata not found at {path}")
        with open(path, "r") as f:
            _disease_metadata = json.load(f)
    return _disease_metadata


def _load_symptom_mapping():
    global _symptom_mapping
    if _symptom_mapping is None:
        path = DATA_DIR / "symptom_mapping.json"
        if not path.exists():
            raise FileNotFoundError(f"Symptom mapping not found at {path}")
        with open(path, "r") as f:
            raw = json.load(f)
        # Remove comment keys
        _symptom_mapping = {k: v for k, v in raw.items() if not k.startswith("_")}
    return _symptom_mapping


def _load_medical_keywords():
    global _medical_keywords
    if _medical_keywords is None:
        path = DATA_DIR / "medical_keywords.json"
        if not path.exists():
            raise FileNotFoundError(f"Medical keywords not found at {path}")
        with open(path, "r") as f:
            _medical_keywords = json.load(f)
    return _medical_keywords


def _load_whisper_model():
    global _whisper_model
    if _whisper_model is None:
        from faster_whisper import WhisperModel
        model_size = os.getenv("WHISPER_MODEL_SIZE", "base")
        _whisper_model = WhisperModel(model_size, device="cpu", compute_type="int8")
    return _whisper_model


# ─── Symptom Analysis ────────────────────────────────────────────────


def _predict_diseases_sync(symptoms: list[str], top_k: int = 3) -> list[dict]:
    """Convert frontend symptom IDs to feature vector, predict top-k diseases."""
    model_data = _load_symptom_model()
    mapping = _load_symptom_mapping()

    model = model_data["model"]
    label_encoder = model_data["label_encoder"]
    feature_names = model_data["feature_names"]

    features = np.zeros(len(feature_names), dtype=int)

    for symptom_id in symptoms:
        kaggle_columns = mapping.get(symptom_id, [])
        for col_name in kaggle_columns:
            if col_name in feature_names:
                idx = feature_names.index(col_name)
                features[idx] = 1

    if features.sum() == 0:
        return []

    probas = model.predict_proba(features.reshape(1, -1))[0]
    top_indices = np.argsort(probas)[::-1][:top_k]

    results = []
    for idx in top_indices:
        if probas[idx] < 0.01:
            continue
        disease_name = label_encoder.inverse_transform([idx])[0]
        results.append({"name": disease_name, "probability": float(probas[idx])})

    return results


def _find_metadata(disease_name: str, metadata: dict) -> dict:
    """Find disease metadata with fuzzy matching for typos/spacing differences."""
    if disease_name in metadata:
        return metadata[disease_name]

    # Try case-insensitive and stripped matching
    lower = disease_name.lower().strip()
    for key, val in metadata.items():
        if key.lower().strip() == lower:
            return val

    return {}


async def analyze_symptoms_local(
    symptoms: list[str],
    modifiers: list[str],
    duration_days: int,
    age: int | None = None,
    gender: str | None = None,
    medical_history: list[str] | None = None,
    current_medications: list[str] | None = None,
    medicines_context: str = "",
) -> dict:
    """Local ML symptom analysis. Returns same JSON schema as OpenAI/Gemini."""
    try:
        predictions = await asyncio.to_thread(_predict_diseases_sync, symptoms, 3)

        if not predictions:
            return {
                "possible_conditions": [],
                "severity": "info",
                "summary": "Could not determine a specific condition from the given symptoms. Please consult a doctor.",
                "recommended_medicines": [],
                "home_care": [
                    "Rest and stay hydrated",
                    "Monitor symptoms for changes",
                    "Visit PHC if symptoms worsen",
                ],
                "warning_signs": [
                    "Symptoms worsening",
                    "New symptoms developing",
                    "Difficulty breathing",
                ],
                "see_doctor_urgency": "within_week",
                "follow_up_questions": [
                    "Can you describe the symptoms in more detail?"
                ],
            }

        metadata = _load_disease_metadata()
        top_disease = predictions[0]["name"]
        disease_info = _find_metadata(top_disease, metadata)

        # Build possible_conditions
        possible_conditions = []
        for pred in predictions:
            if pred["probability"] >= 0.3:
                likelihood = "high"
            elif pred["probability"] >= 0.1:
                likelihood = "medium"
            else:
                likelihood = "low"

            info = _find_metadata(pred["name"], metadata)
            possible_conditions.append({
                "name": pred["name"],
                "likelihood": likelihood,
                "description": info.get("summary", f"Possible {pred['name']}"),
            })

        # Severity escalation
        severity = disease_info.get("severity", "info")
        if duration_days >= 7 and severity == "info":
            severity = "warning"
        if "sudden_onset" in modifiers and severity != "critical":
            severity = "warning"

        # Doctor urgency escalation
        urgency = disease_info.get("see_doctor_urgency", "within_week")
        if duration_days >= 5 and urgency == "monitor":
            urgency = "within_week"
        if duration_days >= 7 and urgency in ("monitor", "within_week"):
            urgency = "within_24h"

        # Filter medicines against available DB if possible
        recommended_meds = disease_info.get("recommended_medicines", [])
        if medicines_context and recommended_meds:
            context_lower = medicines_context.lower()
            filtered = [
                m for m in recommended_meds
                if m["generic_name"].lower() in context_lower
            ]
            if filtered:
                recommended_meds = filtered

        return {
            "possible_conditions": possible_conditions,
            "severity": severity,
            "summary": disease_info.get("summary", f"Analysis suggests possible {top_disease}."),
            "recommended_medicines": recommended_meds,
            "home_care": disease_info.get("home_care", ["Rest and stay hydrated"]),
            "warning_signs": disease_info.get("warning_signs", ["Symptoms worsening"]),
            "see_doctor_urgency": urgency,
            "follow_up_questions": disease_info.get("follow_up_questions", []),
        }
    except Exception as e:
        return {"error": f"Local ML prediction failed: {str(e)}"}


# ─── Prescription OCR ────────────────────────────────────────────────


def _preprocess_prescription_image(image_bytes: bytes):
    """Pre-process prescription image for better OCR accuracy."""
    from PIL import Image, ImageFilter, ImageEnhance

    img = Image.open(io.BytesIO(image_bytes))
    img = img.convert("L")

    enhancer = ImageEnhance.Contrast(img)
    img = enhancer.enhance(2.0)

    enhancer = ImageEnhance.Sharpness(img)
    img = enhancer.enhance(2.0)

    img = img.point(lambda x: 0 if x < 140 else 255, "1")
    img = img.filter(ImageFilter.MedianFilter(size=3))

    return img


def _parse_prescription_text(raw_text: str) -> dict:
    """Parse OCR text to extract medicines, dosage, doctor name, date."""
    lines = [l.strip() for l in raw_text.split("\n") if l.strip()]

    medicines = []
    doctor_name = None
    date = None

    # Doctor name patterns
    for line in lines:
        match = re.search(
            r"(?:Dr\.?|Doctor)\s+([A-Z][a-zA-Z\s\.]+)", line, re.IGNORECASE
        )
        if match:
            doctor_name = match.group(1).strip()
            break

    # Date patterns
    for line in lines:
        match = re.search(
            r"(\d{1,2}[/-]\d{1,2}[/-]\d{2,4})", line
        )
        if not match:
            match = re.search(
                r"(\d{1,2}\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\w*\s+\d{2,4})",
                line,
                re.IGNORECASE,
            )
        if match:
            date = match.group(1).strip()
            break

    # Frequency normalization map
    freq_map = {
        "od": "once daily",
        "bd": "twice daily",
        "tds": "three times daily",
        "qid": "four times daily",
        "sos": "as needed",
        "hs": "at bedtime",
        "prn": "as needed",
        "1-0-1": "twice daily (morning-evening)",
        "1-1-1": "three times daily",
        "1-0-0": "once daily (morning)",
        "0-0-1": "once daily (night)",
        "0-1-0": "once daily (afternoon)",
    }

    # Medicine patterns
    med_pattern = re.compile(
        r"(?:Tab\.?|Cap\.?|Syp\.?|Inj\.?|Oint\.?|Cream|Drops?|Gel)?\s*"
        r"([A-Za-z][A-Za-z\s\-]+?)\s+"
        r"(\d+\s*(?:mg|ml|g|mcg|%)?)\s*"
        r"((?:BD|TDS|QID|OD|SOS|HS|PRN|"
        r"[0-1]-[0-1]-[0-1]|"
        r"once|twice|thrice|"
        r"\d+\s*times?\s*(?:a|per)\s*day))\s*"
        r"(?:x\s*|for\s*)?(\d+\s*(?:days?|weeks?|months?))?\s*",
        re.IGNORECASE,
    )

    for line in lines:
        match = med_pattern.search(line)
        if match:
            name = match.group(1).strip()
            dosage = match.group(2).strip()
            frequency_raw = match.group(3).strip().lower()
            duration = match.group(4).strip() if match.group(4) else ""
            frequency = freq_map.get(frequency_raw, frequency_raw)

            medicines.append({
                "brand_name": name,
                "generic_name": None,
                "dosage": dosage,
                "frequency": frequency,
                "duration": duration,
            })

    # Fallback: if regex didn't catch medicines, try line-by-line heuristic
    if not medicines:
        dosage_forms = ["tab", "cap", "syp", "inj", "oint", "cream", "drops", "gel"]
        for line in lines:
            lower_line = line.lower()
            if any(form in lower_line for form in dosage_forms):
                medicines.append({
                    "brand_name": line.strip()[:60],
                    "generic_name": None,
                    "dosage": "",
                    "frequency": "",
                    "duration": "",
                })

    confidence = (
        "high" if medicines and doctor_name
        else "medium" if medicines
        else "low"
    )

    return {
        "medicines": medicines,
        "doctor_name": doctor_name,
        "date": date,
        "notes": f"Extracted via local OCR (Tesseract). {len(lines)} lines parsed.",
        "confidence": confidence,
    }


def _extract_prescription_sync(image_bytes: bytes) -> dict:
    """Full pipeline: preprocess -> OCR -> parse."""
    import pytesseract

    try:
        img = _preprocess_prescription_image(image_bytes)
        raw_text = pytesseract.image_to_string(img, config="--oem 3 --psm 6")

        if not raw_text.strip():
            return {
                "error": "Could not extract any text from the image. Please ensure the prescription is clearly visible."
            }

        return _parse_prescription_text(raw_text)
    except Exception as e:
        return {"error": f"Local OCR failed: {str(e)}"}


async def extract_prescription_local(
    image_data: bytes, mime_type: str = "image/jpeg"
) -> dict:
    """Async wrapper for local prescription extraction."""
    return await asyncio.to_thread(_extract_prescription_sync, image_data)


# ─── Voice Transcription ─────────────────────────────────────────────


def _transcribe_audio_sync(audio_bytes: bytes, mime_type: str) -> dict:
    """Transcribe audio using Whisper, then extract medical terms."""
    import tempfile

    model = _load_whisper_model()
    keywords_data = _load_medical_keywords()

    suffix = ".wav"
    if "m4a" in mime_type:
        suffix = ".m4a"
    elif "mp3" in mime_type:
        suffix = ".mp3"
    elif "ogg" in mime_type:
        suffix = ".ogg"
    elif "webm" in mime_type:
        suffix = ".webm"

    with tempfile.NamedTemporaryFile(suffix=suffix, delete=True) as tmp:
        tmp.write(audio_bytes)
        tmp.flush()

        segments, info = model.transcribe(
            tmp.name, beam_size=5, language=None, task="transcribe"
        )
        full_text = " ".join(seg.text for seg in segments).strip()

    if not full_text:
        return {"error": "Could not transcribe any speech from the audio."}

    detected_lang = info.language if info.language else "en"
    is_hindi = detected_lang in ("hi", "ur") or any(
        0x0900 <= ord(c) <= 0x097F for c in full_text
    )

    return _extract_terms_from_text(
        full_text, keywords_data, is_hindi=is_hindi
    )


def _extract_terms_from_text(
    text: str, keywords_data: dict, is_hindi: bool = False
) -> dict:
    """Extract medical terms and symptom IDs from text using keyword matching."""
    text_lower = text.lower()
    suggested_symptoms = []
    medical_terms = []

    symptom_kw = keywords_data.get("symptom_keywords", {})
    snomed_map = keywords_data.get("medical_terms_snomed", {})

    for symptom_id, lang_keywords in symptom_kw.items():
        all_keywords = lang_keywords.get("en", []) + lang_keywords.get("hi", [])
        for kw in all_keywords:
            if kw.lower() in text_lower:
                if symptom_id not in suggested_symptoms:
                    suggested_symptoms.append(symptom_id)
                for term_name, snomed_info in snomed_map.items():
                    if (
                        term_name.lower() in kw.lower()
                        or kw.lower() in term_name.lower()
                    ):
                        medical_terms.append({
                            "term": kw,
                            "snomed_code": snomed_info["code"],
                            "category": snomed_info["category"],
                        })
                        break
                break

    confidence = 0.9 if suggested_symptoms else 0.5

    return {
        "hindi_text": text if is_hindi else "",
        "english_text": text,
        "medical_terms": medical_terms,
        "suggested_symptoms": suggested_symptoms,
        "confidence": confidence,
    }


async def transcribe_audio_local(
    audio_bytes: bytes, mime_type: str = "audio/wav"
) -> dict:
    """Async wrapper for local audio transcription."""
    return await asyncio.to_thread(_transcribe_audio_sync, audio_bytes, mime_type)


async def extract_medical_terms_local(text: str, language: str = "hi") -> dict:
    """Extract medical terms from text input (no audio needed)."""
    keywords_data = _load_medical_keywords()
    is_hindi = language == "hi" or any(0x0900 <= ord(c) <= 0x097F for c in text)
    return _extract_terms_from_text(text, keywords_data, is_hindi=is_hindi)
