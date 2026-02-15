"""
Export trained prescription OCR model to ONNX and apply int8 dynamic quantization.

The script expects a trained TrOCR directory and attempts ONNX export via Optimum.
Output artifact target (by default):
  apps/api/models/prescription_ocr_trocr_int8.onnx
"""

from __future__ import annotations

import argparse
import shutil
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
DEFAULT_MODEL_DIR = BASE_DIR / "models" / "prescription_ocr_trocr"
DEFAULT_OUTPUT_FILE = BASE_DIR / "models" / "prescription_ocr_trocr_int8.onnx"


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Export prescription OCR model to int8 ONNX")
    parser.add_argument("--model-dir", type=Path, default=DEFAULT_MODEL_DIR)
    parser.add_argument("--output-file", type=Path, default=DEFAULT_OUTPUT_FILE)
    parser.add_argument("--tmp-export-dir", type=Path, default=BASE_DIR / "models" / ".tmp_ocr_onnx_export")
    return parser.parse_args()


def find_primary_onnx(export_dir: Path) -> Path:
    onnx_files = sorted(export_dir.rglob("*.onnx"), key=lambda p: p.stat().st_size, reverse=True)
    if not onnx_files:
        raise FileNotFoundError(f"No ONNX files found in {export_dir}")
    return onnx_files[0]


def main() -> None:
    args = parse_args()
    if not args.model_dir.exists():
        raise FileNotFoundError(f"Model directory not found: {args.model_dir}")

    if args.tmp_export_dir.exists():
        shutil.rmtree(args.tmp_export_dir)
    args.tmp_export_dir.mkdir(parents=True, exist_ok=True)
    args.output_file.parent.mkdir(parents=True, exist_ok=True)

    print("=" * 72)
    print("Exporting prescription OCR model to ONNX")
    print("=" * 72)
    print(f"Model dir: {args.model_dir}")
    print(f"Temp export dir: {args.tmp_export_dir}")
    print(f"Output file: {args.output_file}")

    try:
        from optimum.exporters.onnx import main_export  # type: ignore
    except Exception as exc:
        raise RuntimeError(
            "Optimum ONNX exporter is required. Install with: "
            "pip install optimum[onnxruntime]"
        ) from exc

    main_export(
        model_name_or_path=str(args.model_dir),
        output=str(args.tmp_export_dir),
        task="image-to-text",
    )

    source_onnx = find_primary_onnx(args.tmp_export_dir)
    print(f"Primary ONNX candidate: {source_onnx}")

    try:
        from onnxruntime.quantization import QuantType, quantize_dynamic  # type: ignore
    except Exception as exc:
        raise RuntimeError(
            "onnxruntime quantization tools are required. Install with: pip install onnxruntime"
        ) from exc

    quantize_dynamic(
        model_input=str(source_onnx),
        model_output=str(args.output_file),
        weight_type=QuantType.QInt8,
    )

    size_mb = args.output_file.stat().st_size / (1024 * 1024)
    print(f"Quantized model saved: {args.output_file} ({size_mb:.2f} MB)")


if __name__ == "__main__":
    main()
