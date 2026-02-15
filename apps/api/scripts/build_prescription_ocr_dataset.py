"""
Build synthetic prescription OCR dataset.

Creates:
- line-level OCR dataset (train/val/test)
- page-level integration set for parser/evaluator

Default sizes follow the product spec:
- train lines: 25,000
- val lines: 2,500
- test lines: 2,500
- page samples: 3,000
"""

from __future__ import annotations

import argparse
import json
import random
import re
from datetime import datetime, timedelta
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageFont

BASE_DIR = Path(__file__).resolve().parent.parent
ROOT_DIR = BASE_DIR.parent.parent
SEED_MEDICINES_SQL = ROOT_DIR / "supabase" / "seed-medicines.sql"
DEFAULT_OUT_DIR = BASE_DIR / "data" / "prescription_ocr"

DOSAGE_FORMS = ["Tab", "Cap", "Syp", "Inj"]
FREQUENCIES = ["OD", "BD", "TDS", "QID", "SOS", "HS", "1-0-1", "1-1-1"]
DURATIONS = ["3 days", "5 days", "7 days", "10 days", "2 weeks"]
STRENGTH_UNITS = ["mg", "ml", "g"]


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Generate synthetic prescription OCR dataset")
    parser.add_argument("--output-dir", type=Path, default=DEFAULT_OUT_DIR)
    parser.add_argument("--train-lines", type=int, default=25_000)
    parser.add_argument("--val-lines", type=int, default=2_500)
    parser.add_argument("--test-lines", type=int, default=2_500)
    parser.add_argument("--page-samples", type=int, default=3_000)
    parser.add_argument("--seed", type=int, default=42)
    return parser.parse_args()


def load_medicine_names() -> list[str]:
    if not SEED_MEDICINES_SQL.exists():
        raise FileNotFoundError(f"Seed medicines SQL not found: {SEED_MEDICINES_SQL}")

    content = SEED_MEDICINES_SQL.read_text(encoding="utf-8", errors="ignore")
    names: set[str] = set()
    for brand, generic in re.findall(
        r"\(\s*'((?:''|[^'])*)'\s*,\s*'((?:''|[^'])*)'",
        content,
    ):
        for raw in (brand, generic):
            clean = raw.replace("''", "'").strip()
            if clean:
                names.add(clean)
    if not names:
        raise RuntimeError("No medicine names parsed from seed SQL.")
    return sorted(names)


def pick_font(size: int) -> ImageFont.ImageFont:
    candidates = [
        "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
        "/usr/share/fonts/truetype/dejavu/DejaVuSerif.ttf",
        "/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf",
        "/usr/share/fonts/truetype/noto/NotoSans-Regular.ttf",
    ]
    for path in candidates:
        font_path = Path(path)
        if font_path.exists():
            try:
                return ImageFont.truetype(str(font_path), size=size)
            except OSError:
                continue
    return ImageFont.load_default()


def make_strength() -> str:
    number = random.choice([125, 250, 500, 650, 5, 10, 15, 20, 100])
    unit = random.choice(STRENGTH_UNITS)
    return f"{number} {unit}"


def make_duration() -> str:
    return random.choice(DURATIONS)


def make_frequency() -> str:
    freq = random.choice(FREQUENCIES)
    if freq in {"OD", "BD", "TDS", "QID"} and random.random() < 0.25:
        return f"{freq}x"
    return freq


def line_variants(medicine: str) -> str:
    form = random.choice(DOSAGE_FORMS)
    strength = make_strength()
    freq = make_frequency()
    duration = make_duration()

    templates = [
        f"{form} {medicine} {strength} {freq} x {duration}",
        f"{form}{medicine} {strength} {freq} x {duration}",
        f"{form}. {medicine} {strength} {freq} for {duration}",
        f"{form} {medicine} {strength} {freq} {duration}",
        f"{medicine} {strength} {freq} x {duration}",
    ]
    return random.choice(templates)


def apply_line_augmentation(img: Image.Image) -> Image.Image:
    if random.random() < 0.6:
        img = img.rotate(random.uniform(-2.5, 2.5), expand=True, fillcolor="white")
    if random.random() < 0.35:
        img = img.filter(ImageFilter.GaussianBlur(radius=random.uniform(0.2, 0.8)))

    arr = np.array(img).astype(np.float32)
    if random.random() < 0.45:
        noise = np.random.normal(0, random.uniform(2, 9), arr.shape)
        arr = np.clip(arr + noise, 0, 255)
    return Image.fromarray(arr.astype(np.uint8))


def render_line_image(text: str) -> Image.Image:
    canvas = Image.new("L", (1600, 180), color=255)
    draw = ImageDraw.Draw(canvas)
    font = pick_font(random.randint(30, 46))
    x = random.randint(30, 90)
    y = random.randint(30, 70)
    draw.text((x, y), text, fill=0, font=font)
    canvas = apply_line_augmentation(canvas)
    return canvas


def write_jsonl(path: Path, rows: list[dict]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", encoding="utf-8") as fh:
        for row in rows:
            fh.write(json.dumps(row, ensure_ascii=True) + "\n")


def generate_line_split(out_dir: Path, split: str, n_rows: int, medicines: list[str]) -> None:
    split_dir = out_dir / "lines" / split
    image_dir = split_dir / "images"
    image_dir.mkdir(parents=True, exist_ok=True)

    records: list[dict] = []
    for i in range(n_rows):
        med = random.choice(medicines)
        text = line_variants(med)
        image = render_line_image(text)

        file_name = f"{split}_{i:06d}.png"
        image_path = image_dir / file_name
        image.save(image_path)

        records.append(
            {
                "id": f"{split}_{i:06d}",
                "image_path": str(image_path.relative_to(out_dir)),
                "text": text,
                "medicine_hint": med,
            }
        )

    write_jsonl(split_dir / f"{split}.jsonl", records)
    print(f"[lines] {split}: {n_rows} samples -> {split_dir}")


def make_random_date() -> str:
    d = datetime(2024, 1, 1) + timedelta(days=random.randint(0, 730))
    if random.random() < 0.2:
        # Inject a mild OCR-noise-like date format.
        return d.strftime("%d/0%m/%Y")
    return d.strftime("%d/%m/%Y")


def make_doctor_name() -> str:
    first = random.choice(["A", "R", "S", "K", "M", "P"])
    last = random.choice(["Sharma", "Gupta", "Iyer", "Rao", "Singh", "Nair", "Khan"])
    prefix = random.choice(["Dr.", "Dr", "Doctor"])
    if random.random() < 0.25:
        return f"{prefix}{first} {last}"
    return f"{prefix} {first} {last}"


def render_page(lines: list[str]) -> Image.Image:
    page = Image.new("L", (1800, 2400), color=255)
    draw = ImageDraw.Draw(page)
    font = pick_font(random.randint(28, 44))

    y = random.randint(120, 180)
    x_base = random.randint(90, 150)
    for line in lines:
        x = x_base + random.randint(-20, 20)
        draw.text((x, y), line, fill=0, font=font)
        y += random.randint(95, 150)

    if random.random() < 0.55:
        page = page.rotate(random.uniform(-2.0, 2.0), expand=False, fillcolor=255)
    if random.random() < 0.30:
        page = page.filter(ImageFilter.GaussianBlur(radius=random.uniform(0.2, 0.9)))

    arr = np.array(page).astype(np.float32)
    if random.random() < 0.40:
        arr += np.random.normal(0, random.uniform(2, 8), arr.shape)
    arr = np.clip(arr, 0, 255).astype(np.uint8)
    return Image.fromarray(arr)


def generate_page_split(out_dir: Path, n_rows: int, medicines: list[str]) -> None:
    page_dir = out_dir / "pages" / "images"
    page_dir.mkdir(parents=True, exist_ok=True)

    records: list[dict] = []
    for i in range(n_rows):
        medicine_count = random.randint(1, 6)
        med_lines = [line_variants(random.choice(medicines)) for _ in range(medicine_count)]
        page_lines = [make_doctor_name(), f"Date: {make_random_date()}"] + med_lines
        page_image = render_page(page_lines)

        file_name = f"page_{i:05d}.png"
        image_path = page_dir / file_name
        page_image.save(image_path)

        records.append(
            {
                "id": f"page_{i:05d}",
                "image_path": str(image_path.relative_to(out_dir)),
                "doctor_line": page_lines[0],
                "date_line": page_lines[1],
                "medicine_lines": med_lines,
                "raw_text": "\n".join(page_lines),
            }
        )

    write_jsonl(out_dir / "pages" / "pages.jsonl", records)
    print(f"[pages] integration set: {n_rows} samples -> {out_dir / 'pages'}")


def main() -> None:
    args = parse_args()
    random.seed(args.seed)
    np.random.seed(args.seed)

    medicines = load_medicine_names()
    out_dir = args.output_dir
    out_dir.mkdir(parents=True, exist_ok=True)

    print("=" * 72)
    print("Building synthetic prescription OCR dataset")
    print("=" * 72)
    print(f"Output: {out_dir}")
    print(f"Medicine lexicon size: {len(medicines)}")

    generate_line_split(out_dir, "train", args.train_lines, medicines)
    generate_line_split(out_dir, "val", args.val_lines, medicines)
    generate_line_split(out_dir, "test", args.test_lines, medicines)
    generate_page_split(out_dir, args.page_samples, medicines)

    manifest = {
        "created_at": datetime.utcnow().isoformat() + "Z",
        "seed": args.seed,
        "train_lines": args.train_lines,
        "val_lines": args.val_lines,
        "test_lines": args.test_lines,
        "page_samples": args.page_samples,
        "medicine_lexicon_size": len(medicines),
    }
    (out_dir / "dataset_manifest.json").write_text(json.dumps(manifest, indent=2), encoding="utf-8")

    print("\nDone.")


if __name__ == "__main__":
    main()
