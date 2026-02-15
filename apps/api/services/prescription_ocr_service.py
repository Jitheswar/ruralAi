"""
Prescription OCR Service
------------------------
Local OCR pipeline for prescriptions:
1) page pre-processing
2) line segmentation
3) recognizer inference (TrOCR when available, Tesseract fallback)
4) structured parsing + medicine normalization
"""

from __future__ import annotations

import io
import json
import os
import re
import shutil
from dataclasses import dataclass
from difflib import SequenceMatcher
from pathlib import Path

import numpy as np
from PIL import Image, ImageEnhance, ImageOps

BASE_DIR = Path(__file__).resolve().parent.parent
ROOT_DIR = BASE_DIR.parent.parent
SEED_MEDICINES_SQL = ROOT_DIR / "supabase" / "seed-medicines.sql"

DEFAULT_OCR_ENGINE = os.getenv("PRESCRIPTION_OCR_ENGINE", "trocr").strip().lower()
DEFAULT_OCR_MODEL_PATH = os.getenv(
    "PRESCRIPTION_OCR_MODEL_PATH",
    "models/prescription_ocr_trocr_int8.onnx",
).strip()
DEFAULT_OCR_MODEL_DIR = os.getenv(
    "PRESCRIPTION_OCR_MODEL_DIR",
    "models/prescription_ocr_trocr",
).strip()
DEFAULT_MIN_CONFIDENCE = float(os.getenv("PRESCRIPTION_OCR_MIN_CONFIDENCE", "0.45"))
DEFAULT_TROCR_MIN_EPOCHS = int(os.getenv("PRESCRIPTION_OCR_MIN_TROCR_EPOCHS", "5"))
DEFAULT_TROCR_BATCH_SIZE = max(1, int(os.getenv("PRESCRIPTION_OCR_BATCH_SIZE", "8")))
DEFAULT_TROCR_MAX_NEW_TOKENS = int(os.getenv("PRESCRIPTION_OCR_MAX_NEW_TOKENS", "48"))

_MEDICINE_LEXICON: list[str] | None = None
_MEDICINE_NORMALIZED: dict[str, str] | None = None
_MEDICINE_CANONICAL_PAIRS: list[tuple[str, str]] | None = None
_NAME_NORMALIZATION_CACHE: dict[str, str] = {}
_TROCR_PROCESSOR = None
_TROCR_MODEL = None
_TROCR_MODEL_ID = None
_TROCR_DEVICE = None


def _resolve_path(path_value: str) -> Path:
    candidate = Path(path_value)
    if candidate.is_absolute():
        return candidate
    return BASE_DIR / candidate


def get_ocr_model_status() -> dict:
    model_artifact = _resolve_path(DEFAULT_OCR_MODEL_PATH)
    model_dir = _resolve_path(DEFAULT_OCR_MODEL_DIR)
    return {
        "preferred_engine": DEFAULT_OCR_ENGINE,
        "model_artifact_path": str(model_artifact),
        "model_artifact_exists": model_artifact.exists(),
        "model_dir_path": str(model_dir),
        "model_dir_exists": model_dir.exists(),
        "tesseract_available": shutil.which("tesseract") is not None,
    }


def _normalize_token(value: str) -> str:
    return re.sub(r"[^a-z0-9]+", " ", value.lower()).strip()


def _load_medicine_lexicon() -> tuple[list[str], dict[str, str], list[tuple[str, str]]]:
    global _MEDICINE_LEXICON, _MEDICINE_NORMALIZED, _MEDICINE_CANONICAL_PAIRS
    if (
        _MEDICINE_LEXICON is not None
        and _MEDICINE_NORMALIZED is not None
        and _MEDICINE_CANONICAL_PAIRS is not None
    ):
        return _MEDICINE_LEXICON, _MEDICINE_NORMALIZED, _MEDICINE_CANONICAL_PAIRS

    names: list[str] = []
    normalized: dict[str, str] = {}

    if SEED_MEDICINES_SQL.exists():
        content = SEED_MEDICINES_SQL.read_text(encoding="utf-8", errors="ignore")
        # First 2 tuple values in each INSERT row are brand_name and generic_name.
        for brand, generic in re.findall(
            r"\(\s*'((?:''|[^'])*)'\s*,\s*'((?:''|[^'])*)'",
            content,
        ):
            brand_clean = brand.replace("''", "'").strip()
            generic_clean = generic.replace("''", "'").strip()
            for item in (brand_clean, generic_clean):
                if not item:
                    continue
                names.append(item)
                normalized.setdefault(_normalize_token(item), item)

    _MEDICINE_LEXICON = sorted(set(names))
    _MEDICINE_NORMALIZED = normalized
    _MEDICINE_CANONICAL_PAIRS = [
        (candidate, _normalize_token(candidate)) for candidate in _MEDICINE_LEXICON
    ]
    return _MEDICINE_LEXICON, _MEDICINE_NORMALIZED, _MEDICINE_CANONICAL_PAIRS


def _normalize_medicine_name(name: str) -> str:
    _, normalized, canonical_pairs = _load_medicine_lexicon()
    if not name:
        return name

    token = _normalize_token(name)
    if token in _NAME_NORMALIZATION_CACHE:
        return _NAME_NORMALIZATION_CACHE[token]
    if token in normalized:
        result = normalized[token]
        _NAME_NORMALIZATION_CACHE[token] = result
        return result

    best = ""
    best_score = 0.0
    for candidate, candidate_token in canonical_pairs:
        if not candidate_token:
            continue
        if token and candidate_token and token[0] != candidate_token[0]:
            continue
        if abs(len(candidate_token) - len(token)) > max(6, int(len(candidate_token) * 0.45)):
            continue
        score = SequenceMatcher(None, token, candidate_token).ratio()
        if score > best_score:
            best = candidate
            best_score = score
    token_count = len(token.split())
    threshold = 0.74 if token_count == 1 else 0.82
    result = best if best_score >= threshold else name.strip()
    if len(_NAME_NORMALIZATION_CACHE) >= 10_000:
        _NAME_NORMALIZATION_CACHE.clear()
    _NAME_NORMALIZATION_CACHE[token] = result
    return result


def preprocess_prescription_page(image_bytes: bytes) -> Image.Image:
    """Prepare page image for line segmentation and OCR."""
    img = Image.open(io.BytesIO(image_bytes))
    img = ImageOps.exif_transpose(img).convert("L")

    # Upscale low-resolution images for better OCR.
    width, height = img.size
    if max(width, height) < 1600:
        scale = 1600 / max(width, height)
        img = img.resize((int(width * scale), int(height * scale)))

    # Mild contrast boost preserves character edges better than aggressive denoising.
    img = ImageEnhance.Contrast(img).enhance(1.15)
    return img


def segment_prescription_lines(preprocessed: Image.Image) -> list[Image.Image]:
    """Segment a prescription page into line crops using projection profiles."""
    arr = np.array(preprocessed)
    if arr.ndim == 3:
        arr = arr[:, :, 0]

    threshold = min(220, int(float(arr.mean()) + float(arr.std()) * 0.5))
    text_mask = arr < threshold
    row_density = text_mask.mean(axis=1)
    active = row_density > 0.01

    segments: list[tuple[int, int]] = []
    start = None
    for i, is_active in enumerate(active):
        if is_active and start is None:
            start = i
        elif not is_active and start is not None:
            if i - start >= 8:
                segments.append((start, i))
            start = None
    if start is not None and len(active) - start >= 8:
        segments.append((start, len(active)))

    merged: list[tuple[int, int]] = []
    for seg in segments:
        if not merged:
            merged.append(seg)
            continue
        prev_s, prev_e = merged[-1]
        s, e = seg
        if s - prev_e <= 8:
            merged[-1] = (prev_s, e)
        else:
            merged.append(seg)

    if not merged:
        return [preprocessed]

    line_images: list[Image.Image] = []
    col_density = text_mask.mean(axis=0)
    cols = np.where(col_density > 0.002)[0]
    x0 = int(max(0, cols[0] - 10)) if len(cols) else 0
    x1 = int(min(arr.shape[1], cols[-1] + 10)) if len(cols) else arr.shape[1]

    for s, e in merged:
        y0 = max(0, s - 4)
        y1 = min(arr.shape[0], e + 4)
        line_images.append(preprocessed.crop((x0, y0, x1, y1)))

    return line_images


def _clean_line(line: str) -> str:
    line = line.replace("\u2014", "-").replace("\u2013", "-")
    line = re.sub(
        r"\b(Tab|Cap|Syp|Syr|Inj|Oint|Drop|Drops|Gel)(?=[A-Za-z])",
        r"\1 ",
        line,
        flags=re.IGNORECASE,
    )
    line = re.sub(r"\b(OD|BD|TDS|QID|SOS|HS|PRN)\s*[xX]\b", r"\1 x", line, flags=re.IGNORECASE)
    line = re.sub(r"\s+", " ", line).strip()
    return line


def _normalize_date(value: str) -> str:
    numeric = re.search(r"(\d{1,2})[/-](\d{1,3})[/-](\d{2,4})", value)
    if numeric:
        day = int(numeric.group(1))
        month_raw = numeric.group(2)
        month = int(month_raw[-2:]) if len(month_raw) > 2 else int(month_raw)
        year = int(numeric.group(3))
        if year < 100:
            year += 2000
        if 1 <= day <= 31 and 1 <= month <= 12:
            return f"{day:02d}/{month:02d}/{year:04d}"
        return numeric.group(0)

    textual = re.search(
        r"(\d{1,2}\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\w*\s+\d{2,4})",
        value,
        flags=re.IGNORECASE,
    )
    if textual:
        return textual.group(1).strip()
    return ""


def _extract_doctor_name(lines: list[str]) -> str | None:
    for line in lines:
        match = re.search(
            r"(?:Dr\.?|Doctor)\s*[:\-]?\s*([A-Za-z][A-Za-z.\s]{1,60})",
            line,
            flags=re.IGNORECASE,
        )
        if match:
            name = re.sub(r"\s+", " ", match.group(1)).strip(" .,-")
            if name:
                return name
    return None


def _extract_date(lines: list[str]) -> str | None:
    for line in lines:
        date = _normalize_date(line)
        if date:
            return date
    return None


_FREQ_MAP = {
    "OD": "once daily",
    "BD": "twice daily",
    "TDS": "three times daily",
    "QID": "four times daily",
    "SOS": "as needed",
    "HS": "at bedtime",
    "PRN": "as needed",
    "1-0-1": "twice daily (morning-evening)",
    "1-1-1": "three times daily",
    "1-0-0": "once daily (morning)",
    "0-0-1": "once daily (night)",
    "0-1-0": "once daily (afternoon)",
    "ONCE": "once daily",
    "TWICE": "twice daily",
    "THRICE": "three times daily",
}

_FREQ_PATTERN = re.compile(
    r"\b(OD|BD|TDS|QID|SOS|HS|PRN|[01]-[01]-[01]|once|twice|thrice|"
    r"\d+\s*times?\s*(?:a|per)\s*day)(?:[xX])?\b",
    flags=re.IGNORECASE,
)
_DOSAGE_PATTERN = re.compile(r"\b\d+(?:\.\d+)?\s*(?:mg|ml|g|mcg|%)\b", flags=re.IGNORECASE)
_DURATION_PATTERN = re.compile(
    r"(?:\bfor\b|\bx\b)?\s*(\d+\s*(?:days?|weeks?|months?))\b",
    flags=re.IGNORECASE,
)
_DOSAGE_FORM_PATTERN = re.compile(
    r"^(?:Tab|Cap|Syp|Syr|Inj|Ini|Oint|Cream|Drops?|Gel)\.?\s*",
    flags=re.IGNORECASE,
)
_FREQ_NOISE_TOKENS = {
    "od",
    "bd",
    "tds",
    "qid",
    "sos",
    "hs",
    "prn",
    "once",
    "twice",
    "thrice",
    "1-0-1",
    "1-1-1",
    "1-0-0",
    "0-1-0",
    "0-0-1",
}
_UNIT_NOISE_TOKENS = {"mg", "ml", "mi", "g", "mcg", "%", "day", "days", "week", "weeks", "month", "months"}
_HEADER_HINTS = ("date", "dote", "dt", "doctor", "dr")


def _normalize_frequency(freq_raw: str) -> str:
    token = re.sub(r"[^A-Za-z0-9\- ]+", "", freq_raw).strip().upper()
    token = token.replace("  ", " ")
    token = token.replace("8D", "BD")
    token = token.replace("0D", "OD")
    token = token.split(" ")[0] if "TIMES" not in token else token
    return _FREQ_MAP.get(token, freq_raw.strip().lower())


def _looks_like_frequency_token(token: str) -> bool:
    token = re.sub(r"[^a-z0-9\-]+", "", token.lower())
    if not token:
        return False
    token = token.replace("8d", "bd").replace("0d", "od")
    if token in _FREQ_NOISE_TOKENS:
        return True
    if token.endswith("x") and token[:-1] in _FREQ_NOISE_TOKENS:
        return True
    if token in {"tos", "tosx", "tdsx", "tdscx", "bdx", "odx", "qidx", "bdfor", "sofor", "sobfor"}:
        return True
    if any(freq in token for freq in ("odx", "bdx", "tdsx", "qidx", "sos")) and len(token) <= 8:
        return True
    return False


def _cleanup_medicine_candidate(name_candidate: str) -> str:
    # Expand alpha-numeric joins so cleanup can remove dose/frequency residue.
    name_candidate = re.sub(r"([A-Za-z])(\d)", r"\1 \2", name_candidate)
    name_candidate = re.sub(r"(\d)([A-Za-z])", r"\1 \2", name_candidate)
    tokens = re.split(r"\s+", name_candidate.strip())
    kept: list[str] = []
    for idx, raw in enumerate(tokens):
        token = raw.strip(" .,:;()[]{}")
        if not token:
            continue
        low = token.lower()
        if low in _UNIT_NOISE_TOKENS:
            continue
        if _looks_like_frequency_token(low):
            continue
        if re.fullmatch(r"\d+(?:\.\d+)?", low):
            continue
        if re.fullmatch(r"\d+(?:-\d+){1,2}", low):
            continue
        if re.fullmatch(r"\d+(?:mg|ml|g|mcg|%)", low):
            continue
        if low in {"x", "for"}:
            continue
        if len(low) == 1 and low.isalpha():
            prev = tokens[idx - 1].lower() if idx > 0 else ""
            if prev.startswith("vitamin") and low in {"a", "b", "c", "d", "e", "k"}:
                kept.append(low.upper())
                continue
            continue
        kept.append(token)
    return " ".join(kept).strip(" .,-")


def _extract_medicine_from_line(line: str) -> dict | None:
    line = _clean_line(line)
    if not line:
        return None

    lower = line.lower()
    if any(h in lower for h in _HEADER_HINTS) and (
        re.search(r"\d{1,2}[/-]\d{1,2}[/-]\d{2,4}", lower) or len(lower.split()) <= 5
    ):
        return None
    if lower.startswith("or ") and len(lower.split()) <= 4:
        return None

    core = _DOSAGE_FORM_PATTERN.sub("", line)

    dosage_match = _DOSAGE_PATTERN.search(core)
    freq_match = _FREQ_PATTERN.search(core)
    duration_match = _DURATION_PATTERN.search(core)

    dosage = dosage_match.group(0).strip() if dosage_match else ""
    frequency = _normalize_frequency(freq_match.group(1)) if freq_match else ""
    duration = duration_match.group(1).strip() if duration_match else ""

    if not dosage_match and not freq_match and not duration_match:
        plain_tokens = [t for t in re.split(r"\s+", core.strip()) if t]
        if len(plain_tokens) <= 3:
            return None

    name_candidate = core
    name_candidate = _DOSAGE_PATTERN.sub(" ", name_candidate)
    name_candidate = _FREQ_PATTERN.sub(" ", name_candidate)
    name_candidate = re.sub(
        r"(?:\bfor\b|\bx\b)?\s*\d+\s*(?:days?|weeks?|months?)\b",
        " ",
        name_candidate,
        flags=re.IGNORECASE,
    )
    # Strip stray numeric dosage tokens left by OCR (e.g. "650" without "mg/ml")
    name_candidate = re.sub(
        r"\b\d+(?:\.\d+)?\b(?=\s*(?:OD|BD|TDS|QID|SOS|HS|PRN|[01]-[01]-[01]|x|for|$))",
        " ",
        name_candidate,
        flags=re.IGNORECASE,
    )
    name_candidate = re.sub(r"[^A-Za-z0-9\-\s+]", " ", name_candidate)
    name_candidate = re.sub(r"\s+", " ", name_candidate).strip(" .,-")
    name_candidate = _cleanup_medicine_candidate(name_candidate)

    if len(name_candidate) < 2:
        return None

    normalized_name = _normalize_medicine_name(name_candidate)
    matched_to_lexicon = _normalize_token(normalized_name) != _normalize_token(name_candidate)
    if not matched_to_lexicon:
        # Avoid polluting outputs with OCR gibberish that does not map to medicine lexicon.
        if len(name_candidate.split()) >= 3:
            return None
        if not dosage and not frequency:
            return None

    return {
        "brand_name": normalized_name,
        "generic_name": None,
        "dosage": dosage,
        "frequency": frequency,
        "duration": duration,
    }


def _confidence_label(medicines: list[dict], doctor_name: str | None) -> str:
    if medicines and doctor_name:
        return "high"
    if medicines:
        return "medium"
    return "low"


@dataclass
class OCRRecognitionResult:
    lines: list[str]
    confidence: float
    engine: str
    warnings: list[str]


def _recognize_lines_tesseract(
    line_images: list[Image.Image],
    preprocessed_page: Image.Image | None = None,
) -> OCRRecognitionResult:
    import pytesseract

    lines: list[str] = []
    confidences: list[float] = []

    def _safe_page_ocr(page: Image.Image, config: str, timeout_s: float) -> list[str]:
        try:
            raw_text = pytesseract.image_to_string(page, config=config, timeout=timeout_s)
        except RuntimeError:
            return []
        out: list[str] = []
        for raw_line in raw_text.splitlines():
            cleaned = _clean_line(raw_line)
            if cleaned:
                out.append(cleaned)
        return out

    if preprocessed_page is not None:
        page = preprocessed_page
        page_lines = _safe_page_ocr(page, "--oem 3 --psm 6 -l eng", timeout_s=0.6)
        page_score = _recognition_quality_score(page_lines)

        if page_score < 1.0:
            sparse_lines = _safe_page_ocr(page, "--oem 3 --psm 11 -l eng", timeout_s=0.5)
            sparse_score = _recognition_quality_score(sparse_lines)
            if sparse_score > page_score:
                page_lines = sparse_lines
                page_score = sparse_score

        if page_lines:
            avg_len = sum(len(line) for line in page_lines) / len(page_lines)
            confidence = min(0.95, max(0.2, 0.25 + (0.06 * len(page_lines)) + (avg_len / 140.0)))
            return OCRRecognitionResult(
                lines=page_lines,
                confidence=confidence,
                engine="local-tesseract",
                warnings=[],
            )

    for line_img in line_images:
        try:
            text = pytesseract.image_to_string(line_img, config="--oem 3 --psm 7 -l eng", timeout=0.35).strip()
        except RuntimeError:
            continue
        text = _clean_line(text)
        if text:
            lines.append(text)

        try:
            data = pytesseract.image_to_data(
                line_img,
                config="--oem 3 --psm 7 -l eng",
                output_type=pytesseract.Output.DICT,
                timeout=0.35,
            )
        except RuntimeError:
            continue
        scores = []
        for conf in data.get("conf", []):
            try:
                score = float(conf)
            except ValueError:
                continue
            if score >= 0:
                scores.append(score / 100.0)
        if scores:
            confidences.append(sum(scores) / len(scores))

    confidence = float(sum(confidences) / len(confidences)) if confidences else 0.0
    return OCRRecognitionResult(lines=lines, confidence=confidence, engine="local-tesseract", warnings=[])


def _read_trained_epochs(model_dir: Path) -> int | None:
    training_config = model_dir / "training_config.json"
    if not training_config.exists():
        return None
    try:
        payload = json.loads(training_config.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError):
        return None
    epochs_value = payload.get("epochs")
    try:
        return int(epochs_value)
    except (TypeError, ValueError):
        return None


def _recognition_quality_score(lines: list[str]) -> float:
    if not lines:
        return 0.0
    meds = sum(1 for line in lines if _extract_medicine_from_line(line))
    unique_ratio = len({line.lower() for line in lines}) / max(1, len(lines))
    header_bonus = 0.0
    if _extract_doctor_name(lines):
        header_bonus += 0.35
    if _extract_date(lines):
        header_bonus += 0.35
    return meds + unique_ratio + header_bonus


def _try_load_trocr_runtime() -> tuple[object, object, str]:
    global _TROCR_MODEL, _TROCR_PROCESSOR, _TROCR_MODEL_ID, _TROCR_DEVICE
    model_dir = _resolve_path(DEFAULT_OCR_MODEL_DIR)
    model_id = str(model_dir)
    if not model_dir.exists():
        raise FileNotFoundError(f"TrOCR model directory not found: {model_dir}")

    trained_epochs = _read_trained_epochs(model_dir)
    if trained_epochs is not None and trained_epochs < DEFAULT_TROCR_MIN_EPOCHS:
        raise RuntimeError(
            "TrOCR model is undertrained for production use "
            f"(epochs={trained_epochs}, required>={DEFAULT_TROCR_MIN_EPOCHS})"
        )

    if _TROCR_MODEL is not None and _TROCR_PROCESSOR is not None and _TROCR_MODEL_ID == model_id and _TROCR_DEVICE:
        return _TROCR_PROCESSOR, _TROCR_MODEL, _TROCR_DEVICE

    from transformers import TrOCRProcessor, VisionEncoderDecoderModel  # type: ignore
    import torch  # type: ignore

    # Use slow processor for better compatibility across transformer versions.
    processor = TrOCRProcessor.from_pretrained(model_id, use_fast=False)
    model = VisionEncoderDecoderModel.from_pretrained(model_id)
    device = "cuda" if torch.cuda.is_available() else "cpu"
    model.to(device)
    model.eval()

    _TROCR_PROCESSOR = processor
    _TROCR_MODEL = model
    _TROCR_MODEL_ID = model_id
    _TROCR_DEVICE = device
    return processor, model, device


def _recognize_lines_trocr(line_images: list[Image.Image]) -> OCRRecognitionResult:
    processor, model, device = _try_load_trocr_runtime()

    import torch  # type: ignore

    lines: list[str] = []
    with torch.inference_mode():
        for i in range(0, len(line_images), DEFAULT_TROCR_BATCH_SIZE):
            batch = [img.convert("RGB") for img in line_images[i : i + DEFAULT_TROCR_BATCH_SIZE]]
            pixel_values = processor(images=batch, return_tensors="pt").pixel_values.to(device)
            generated_ids = model.generate(
                pixel_values=pixel_values,
                max_new_tokens=DEFAULT_TROCR_MAX_NEW_TOKENS,
                num_beams=1,
                do_sample=False,
            )
            decoded = processor.batch_decode(generated_ids, skip_special_tokens=True)
            for text in decoded:
                cleaned = _clean_line(text)
                if cleaned:
                    lines.append(cleaned)

    return OCRRecognitionResult(lines=lines, confidence=0.78, engine="local-trocr", warnings=[])


def _recognize_lines(
    line_images: list[Image.Image],
    preferred_engine: str,
    *,
    preprocessed_page: Image.Image | None = None,
) -> OCRRecognitionResult:
    preferred_engine = preferred_engine.strip().lower()
    warnings: list[str] = []

    if preferred_engine == "trocr":
        try:
            trocr_result = _recognize_lines_trocr(line_images)
            model_artifact = _resolve_path(DEFAULT_OCR_MODEL_PATH)
            if not model_artifact.exists():
                trocr_result.warnings.append(
                    f"Configured OCR artifact missing at {model_artifact}. Running TrOCR from model directory."
                )
            trocr_score = _recognition_quality_score(trocr_result.lines)
            if trocr_score < 1.0:
                tesseract_result = _recognize_lines_tesseract(
                    line_images,
                    preprocessed_page=preprocessed_page,
                )
                tess_score = _recognition_quality_score(tesseract_result.lines)
                if tess_score >= trocr_score:
                    tesseract_result.warnings.append(
                        "TrOCR output quality was low; switched to local Tesseract for this page."
                    )
                    if not model_artifact.exists():
                        tesseract_result.warnings.append(
                            f"Configured OCR artifact missing at {model_artifact}."
                        )
                    return tesseract_result

            return trocr_result
        except Exception as exc:
            warnings.append(f"TrOCR unavailable, fallback to Tesseract: {exc}")

    tesseract_result = _recognize_lines_tesseract(line_images, preprocessed_page=preprocessed_page)
    tesseract_result.warnings.extend(warnings)
    return tesseract_result


def parse_prescription_lines(
    lines: list[str],
    *,
    raw_text: str,
    ocr_engine: str,
    ocr_confidence: float,
    warnings: list[str] | None = None,
) -> dict:
    cleaned_lines: list[str] = []
    for line in lines:
        cleaned = _clean_line(line)
        if cleaned:
            cleaned_lines.append(cleaned)
    medicines: list[dict] = []
    for line in cleaned_lines:
        med = _extract_medicine_from_line(line)
        if med:
            medicines.append(med)

    if not medicines:
        dosage_forms = ("tab", "cap", "syp", "syr", "inj", "oint", "cream", "drops", "gel")
        for line in cleaned_lines:
            lower = line.lower()
            if any(form in lower for form in dosage_forms):
                medicines.append(
                    {
                        "brand_name": _normalize_medicine_name(line.strip()[:60]),
                        "generic_name": None,
                        "dosage": "",
                        "frequency": "",
                        "duration": "",
                    }
                )

    doctor_name = _extract_doctor_name(cleaned_lines)
    date = _extract_date(cleaned_lines)

    return {
        "medicines": medicines,
        "doctor_name": doctor_name,
        "date": date,
        "notes": f"Extracted via {ocr_engine}. {len(cleaned_lines)} lines parsed.",
        "confidence": _confidence_label(medicines, doctor_name),
        "raw_text": raw_text,
        "ocr_engine": ocr_engine,
        "ocr_confidence": round(float(ocr_confidence), 4),
        "warnings": warnings or [],
    }


def parse_prescription_text(raw_text: str) -> dict:
    lines = [line.strip() for line in raw_text.splitlines() if line.strip()]
    return parse_prescription_lines(
        lines,
        raw_text=raw_text.strip(),
        ocr_engine="local-tesseract",
        ocr_confidence=0.0,
        warnings=[],
    )


def extract_prescription_with_local_model(image_bytes: bytes, mime_type: str = "image/jpeg") -> dict:
    """Run full local OCR pipeline with configured recognizer and structured parser."""
    try:
        _ = mime_type  # Reserved for future mime-specific preprocessing.
        preprocessed = preprocess_prescription_page(image_bytes)
        line_images = segment_prescription_lines(preprocessed)
        if not line_images:
            return {"error": "Could not detect text lines in the prescription image."}

        recognition = _recognize_lines(
            line_images,
            DEFAULT_OCR_ENGINE,
            preprocessed_page=preprocessed,
        )
        raw_text = "\n".join(recognition.lines).strip()
        if not raw_text:
            return {
                "error": (
                    "Could not extract any text from the prescription image. "
                    "Please upload a clearer image."
                )
            }

        parsed = parse_prescription_lines(
            recognition.lines,
            raw_text=raw_text,
            ocr_engine=recognition.engine,
            ocr_confidence=recognition.confidence,
            warnings=recognition.warnings,
        )

        # Raise low-confidence warning for downstream UX.
        if parsed.get("ocr_confidence", 0.0) < DEFAULT_MIN_CONFIDENCE:
            parsed.setdefault("warnings", []).append(
                "OCR confidence is low. Verify extracted medicines manually."
            )

        return parsed
    except Exception as exc:
        return {"error": f"Local OCR failed: {exc}"}
