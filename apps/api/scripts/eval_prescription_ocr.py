"""
Evaluate local prescription OCR quality on page-level integration set.

Metrics:
- OCR endpoint success rate
- Character Error Rate (CER)
- Word Error Rate (WER)
- Medicine-name extraction precision/recall/F1
- p95 latency (seconds)

Acceptance gates (spec):
- success rate >= 95%
- medicine F1 >= 0.80
- p95 latency <= 2.5s
"""

from __future__ import annotations

import argparse
import json
import statistics
import sys
import time
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
if str(BASE_DIR) not in sys.path:
    sys.path.insert(0, str(BASE_DIR))

from services.prescription_ocr_service import extract_prescription_with_local_model, parse_prescription_lines

DEFAULT_DATASET_DIR = BASE_DIR / "data" / "prescription_ocr"


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Evaluate local prescription OCR pipeline")
    parser.add_argument("--dataset-dir", type=Path, default=DEFAULT_DATASET_DIR)
    parser.add_argument("--limit", type=int, default=0, help="0 means evaluate all samples")
    parser.add_argument("--strict", action="store_true", help="Exit non-zero when acceptance gates fail")
    return parser.parse_args()


def levenshtein(a: str, b: str) -> int:
    if a == b:
        return 0
    if not a:
        return len(b)
    if not b:
        return len(a)
    prev = list(range(len(b) + 1))
    for i, ca in enumerate(a, start=1):
        curr = [i]
        for j, cb in enumerate(b, start=1):
            cost = 0 if ca == cb else 1
            curr.append(min(curr[-1] + 1, prev[j] + 1, prev[j - 1] + cost))
        prev = curr
    return prev[-1]


def cer(pred: str, gold: str) -> float:
    if not gold:
        return 0.0 if not pred else 1.0
    return levenshtein(pred, gold) / max(1, len(gold))


def wer(pred: str, gold: str) -> float:
    pred_words = pred.split()
    gold_words = gold.split()
    if not gold_words:
        return 0.0 if not pred_words else 1.0
    return levenshtein(" ".join(pred_words), " ".join(gold_words)) / max(1, len(" ".join(gold_words)))


def normalize_name(name: str) -> str:
    import re

    return re.sub(r"[^a-z0-9]+", " ", name.lower()).strip()


def percentile(values: list[float], q: float) -> float:
    if not values:
        return 0.0
    if len(values) == 1:
        return values[0]
    s = sorted(values)
    idx = int(round((len(s) - 1) * q))
    return s[max(0, min(len(s) - 1, idx))]


def extract_gold_medicine_names(medicine_lines: list[str]) -> set[str]:
    parsed = parse_prescription_lines(
        medicine_lines,
        raw_text="\n".join(medicine_lines),
        ocr_engine="ground-truth",
        ocr_confidence=1.0,
        warnings=[],
    )
    return {
        normalize_name(med.get("brand_name", ""))
        for med in parsed.get("medicines", [])
        if med.get("brand_name")
    }


def main() -> None:
    args = parse_args()
    manifest_path = args.dataset_dir / "pages" / "pages.jsonl"
    if not manifest_path.exists():
        raise FileNotFoundError(f"Missing pages manifest: {manifest_path}")

    rows = [json.loads(line) for line in manifest_path.read_text(encoding="utf-8").splitlines() if line.strip()]
    if args.limit > 0:
        rows = rows[: args.limit]

    if not rows:
        raise RuntimeError("No samples to evaluate.")

    n_total = len(rows)
    n_success = 0
    cer_scores: list[float] = []
    wer_scores: list[float] = []
    latencies: list[float] = []

    tp = fp = fn = 0
    failures: list[dict] = []

    for i, row in enumerate(rows, start=1):
        image_path = args.dataset_dir / row["image_path"]
        image_bytes = image_path.read_bytes()

        t0 = time.perf_counter()
        result = extract_prescription_with_local_model(image_bytes, "image/png")
        latencies.append(time.perf_counter() - t0)

        if "error" in result:
            failures.append({"id": row.get("id"), "error": result["error"]})
            continue

        n_success += 1
        pred_text = (result.get("raw_text") or "").strip()
        gold_text = (row.get("raw_text") or "").strip()
        cer_scores.append(cer(pred_text, gold_text))
        wer_scores.append(wer(pred_text, gold_text))

        pred_names = {
            normalize_name(m.get("brand_name", ""))
            for m in result.get("medicines", [])
            if m.get("brand_name")
        }
        gold_names = extract_gold_medicine_names(row.get("medicine_lines", []))
        tp += len(pred_names.intersection(gold_names))
        fp += len(pred_names - gold_names)
        fn += len(gold_names - pred_names)

        if i % 100 == 0 or i == n_total:
            print(f"Processed {i}/{n_total}", flush=True)

    success_rate = n_success / max(1, n_total)
    precision = tp / max(1, tp + fp)
    recall = tp / max(1, tp + fn)
    f1 = 2 * precision * recall / max(1e-9, precision + recall)
    p95_latency = percentile(latencies, 0.95)

    summary = {
        "samples_total": n_total,
        "samples_success": n_success,
        "success_rate": success_rate,
        "cer_mean": statistics.mean(cer_scores) if cer_scores else 1.0,
        "wer_mean": statistics.mean(wer_scores) if wer_scores else 1.0,
        "medicine_precision": precision,
        "medicine_recall": recall,
        "medicine_f1": f1,
        "latency_p95_seconds": p95_latency,
        "acceptance_gates": {
            "success_rate_gte_0_95": success_rate >= 0.95,
            "medicine_f1_gte_0_80": f1 >= 0.80,
            "latency_p95_lte_2_5s": p95_latency <= 2.5,
        },
        "failure_examples": failures[:10],
    }

    out_path = args.dataset_dir / "pages" / "evaluation_summary.json"
    out_path.write_text(json.dumps(summary, indent=2), encoding="utf-8")

    print("\n" + "=" * 72, flush=True)
    print("OCR Evaluation Summary", flush=True)
    print("=" * 72, flush=True)
    print(json.dumps(summary, indent=2), flush=True)
    print(f"\nSaved summary to {out_path}", flush=True)

    gates_ok = all(summary["acceptance_gates"].values())
    if args.strict and not gates_ok:
        raise SystemExit(1)


if __name__ == "__main__":
    main()
