"""
Train TrOCR for prescription line recognition.

Default hyperparameters are locked to the implementation spec:
- base model: microsoft/trocr-small-handwritten
- epochs: 15
- batch size: 8
- learning rate: 3e-5
- warmup ratio: 0.1
- max target length: 96
- early stopping patience: 3
"""

from __future__ import annotations

import argparse
import json
from dataclasses import dataclass
from pathlib import Path

from PIL import Image

import torch
from torch.utils.data import Dataset
from transformers import (  # type: ignore
    EarlyStoppingCallback,
    Seq2SeqTrainer,
    Seq2SeqTrainingArguments,
    TrOCRProcessor,
    VisionEncoderDecoderModel,
)

BASE_DIR = Path(__file__).resolve().parent.parent
DEFAULT_DATASET_DIR = BASE_DIR / "data" / "prescription_ocr"
DEFAULT_OUTPUT_DIR = BASE_DIR / "models" / "prescription_ocr_trocr"
DEFAULT_BASE_MODEL = "microsoft/trocr-small-handwritten"


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Train prescription OCR TrOCR model")
    parser.add_argument("--dataset-dir", type=Path, default=DEFAULT_DATASET_DIR)
    parser.add_argument("--output-dir", type=Path, default=DEFAULT_OUTPUT_DIR)
    parser.add_argument("--base-model", type=str, default=DEFAULT_BASE_MODEL)
    parser.add_argument("--epochs", type=int, default=15)
    parser.add_argument("--batch-size", type=int, default=8)
    parser.add_argument("--learning-rate", type=float, default=3e-5)
    parser.add_argument("--warmup-ratio", type=float, default=0.1)
    parser.add_argument("--max-target-length", type=int, default=96)
    parser.add_argument("--early-stopping-patience", type=int, default=3)
    parser.add_argument("--num-workers", type=int, default=2)
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


def cer(pred: str, target: str) -> float:
    if not target:
        return 0.0 if not pred else 1.0
    return levenshtein(pred, target) / max(1, len(target))


@dataclass
class OCRSample:
    image_path: Path
    text: str


def load_manifest(dataset_dir: Path, split: str) -> list[OCRSample]:
    manifest_path = dataset_dir / "lines" / split / f"{split}.jsonl"
    if not manifest_path.exists():
        raise FileNotFoundError(f"Missing manifest: {manifest_path}")

    samples: list[OCRSample] = []
    for raw in manifest_path.read_text(encoding="utf-8").splitlines():
        row = json.loads(raw)
        image_path = dataset_dir / row["image_path"]
        samples.append(OCRSample(image_path=image_path, text=row["text"]))
    return samples


class OCRLineDataset(Dataset):
    def __init__(self, samples: list[OCRSample], processor: TrOCRProcessor, max_target_length: int):
        self.samples = samples
        self.processor = processor
        self.max_target_length = max_target_length

    def __len__(self) -> int:
        return len(self.samples)

    def __getitem__(self, idx: int) -> dict:
        sample = self.samples[idx]
        image = Image.open(sample.image_path).convert("RGB")
        pixel_values = self.processor(images=image, return_tensors="pt").pixel_values.squeeze(0)
        tokenized = self.processor.tokenizer(
            sample.text,
            padding="max_length",
            max_length=self.max_target_length,
            truncation=True,
            return_tensors="pt",
        )
        labels = tokenized.input_ids.squeeze(0)
        labels[labels == self.processor.tokenizer.pad_token_id] = -100
        return {
            "pixel_values": pixel_values,
            "labels": labels,
        }


def compute_metrics_factory(processor: TrOCRProcessor):
    def compute_metrics(eval_pred):
        preds, labels = eval_pred
        pred_ids = preds.argmax(-1) if preds.ndim == 3 else preds
        pred_texts = processor.batch_decode(pred_ids, skip_special_tokens=True)

        labels = labels.copy()
        labels[labels == -100] = processor.tokenizer.pad_token_id
        label_texts = processor.batch_decode(labels, skip_special_tokens=True)

        scores = [cer(p.strip(), t.strip()) for p, t in zip(pred_texts, label_texts)]
        avg_cer = float(sum(scores) / max(1, len(scores)))
        return {"cer": avg_cer}

    return compute_metrics


def main() -> None:
    args = parse_args()
    args.output_dir.mkdir(parents=True, exist_ok=True)

    print("=" * 72)
    print("Training prescription OCR model (TrOCR)")
    print("=" * 72)
    print(f"Dataset: {args.dataset_dir}")
    print(f"Output: {args.output_dir}")
    print(f"Base model: {args.base_model}")

    # Force slow processor path for TrOCR to avoid fast-tokenizer conversion issues.
    processor = TrOCRProcessor.from_pretrained(args.base_model, use_fast=False)
    model = VisionEncoderDecoderModel.from_pretrained(args.base_model)

    train_samples = load_manifest(args.dataset_dir, "train")
    val_samples = load_manifest(args.dataset_dir, "val")
    print(f"Train samples: {len(train_samples)}")
    print(f"Val samples: {len(val_samples)}")

    train_ds = OCRLineDataset(train_samples, processor, args.max_target_length)
    val_ds = OCRLineDataset(val_samples, processor, args.max_target_length)

    model.config.decoder_start_token_id = processor.tokenizer.cls_token_id
    model.config.pad_token_id = processor.tokenizer.pad_token_id
    model.config.eos_token_id = processor.tokenizer.sep_token_id

    training_args = Seq2SeqTrainingArguments(
        output_dir=str(args.output_dir),
        per_device_train_batch_size=args.batch_size,
        per_device_eval_batch_size=args.batch_size,
        learning_rate=args.learning_rate,
        warmup_ratio=args.warmup_ratio,
        num_train_epochs=args.epochs,
        logging_steps=100,
        evaluation_strategy="epoch",
        save_strategy="epoch",
        save_total_limit=2,
        load_best_model_at_end=True,
        metric_for_best_model="cer",
        greater_is_better=False,
        predict_with_generate=True,
        dataloader_num_workers=args.num_workers,
        fp16=torch.cuda.is_available(),
        remove_unused_columns=False,
        report_to=[],
        disable_tqdm=True,
    )

    trainer = Seq2SeqTrainer(
        model=model,
        args=training_args,
        train_dataset=train_ds,
        eval_dataset=val_ds,
        tokenizer=processor.feature_extractor,
        compute_metrics=compute_metrics_factory(processor),
        callbacks=[EarlyStoppingCallback(early_stopping_patience=args.early_stopping_patience)],
    )

    trainer.train()
    trainer.save_model(str(args.output_dir))
    processor.save_pretrained(str(args.output_dir))

    config_summary = {
        "base_model": args.base_model,
        "epochs": args.epochs,
        "batch_size": args.batch_size,
        "learning_rate": args.learning_rate,
        "warmup_ratio": args.warmup_ratio,
        "max_target_length": args.max_target_length,
        "early_stopping_patience": args.early_stopping_patience,
    }
    (args.output_dir / "training_config.json").write_text(
        json.dumps(config_summary, indent=2),
        encoding="utf-8",
    )

    print("\nTraining complete.")


if __name__ == "__main__":
    main()
