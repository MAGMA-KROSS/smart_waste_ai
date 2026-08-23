"""
scripts/train-waste-model.py

Fine-tunes the pretrained YOLO11s-cls classification model on the
project's custom waste dataset (see dataset/README.md for the expected
folder layout). Produces `best.pt`, which the FastAPI service can then
load by setting MODEL_PATH=models/best.pt.

This script does NOT train from scratch - it always starts from the
pretrained `yolo11s-cls.pt` weights and fine-tunes on top of them.

Usage:
    python scripts/train-waste-model.py \
        --data dataset \
        --epochs 50 \
        --imgsz 224 \
        --batch 32

Run `python scripts/train-waste-model.py --help` for all options.
"""

import argparse
import shutil
from pathlib import Path

from ultralytics import YOLO

REPO_ROOT = Path(__file__).resolve().parent.parent
DEFAULT_DATASET_DIR = REPO_ROOT / "dataset"
DEFAULT_PRETRAINED_WEIGHTS = "yolo11s-cls.pt"
DEFAULT_OUTPUT_MODEL = REPO_ROOT / "ml-service" / "models" / "best.pt"


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Fine-tune YOLO11s-cls on the SmartWaste dataset.")
    parser.add_argument(
        "--data",
        type=str,
        default=str(DEFAULT_DATASET_DIR),
        help="Path to the dataset root containing train/ val/ (and optionally test/) subfolders, "
        "each with one subfolder per class (e.g. dataset/train/aluminium_can/*.jpg).",
    )
    parser.add_argument(
        "--weights",
        type=str,
        default=DEFAULT_PRETRAINED_WEIGHTS,
        help="Pretrained weights to fine-tune from. Never train from scratch.",
    )
    parser.add_argument("--epochs", type=int, default=50, help="Number of training epochs.")
    parser.add_argument("--imgsz", type=int, default=224, help="Training image size.")
    parser.add_argument("--batch", type=int, default=32, help="Batch size.")
    parser.add_argument(
        "--device",
        type=str,
        default="",
        help="Training device, e.g. 'cpu', '0', '0,1'. Empty string lets Ultralytics auto-select.",
    )
    parser.add_argument(
        "--project",
        type=str,
        default=str(REPO_ROOT / "runs" / "waste-classify"),
        help="Directory where Ultralytics writes run artifacts/metrics.",
    )
    parser.add_argument("--name", type=str, default="finetune", help="Run name (subfolder under --project).")
    parser.add_argument(
        "--output",
        type=str,
        default=str(DEFAULT_OUTPUT_MODEL),
        help="Where to copy the resulting best.pt for the FastAPI service to load.",
    )
    return parser.parse_args()


def validate_dataset(data_dir: Path) -> None:
    train_dir = data_dir / "train"
    val_dir = data_dir / "val"

    if not train_dir.exists() or not val_dir.exists():
        raise FileNotFoundError(
            f"Expected '{train_dir}' and '{val_dir}' to exist. See dataset/README.md for the "
            "required layout (dataset/train/<class>/*.jpg, dataset/val/<class>/*.jpg)."
        )

    train_classes = {p.name for p in train_dir.iterdir() if p.is_dir()}
    if not train_classes:
        raise FileNotFoundError(
            f"No class subfolders found under '{train_dir}'. Add at least one class folder "
            "with training images, e.g. dataset/train/aluminium_can/*.jpg"
        )

    print(f"Found {len(train_classes)} classes in training set: {sorted(train_classes)}")


def main() -> None:
    args = parse_args()
    data_dir = Path(args.data).resolve()

    validate_dataset(data_dir)

    print(f"Loading pretrained weights: {args.weights} (fine-tuning, not training from scratch)")
    model = YOLO(args.weights)

    print(
        f"Starting fine-tuning: epochs={args.epochs} imgsz={args.imgsz} "
        f"batch={args.batch} device='{args.device or 'auto'}'"
    )
    results = model.train(
        data=str(data_dir),
        epochs=args.epochs,
        imgsz=args.imgsz,
        batch=args.batch,
        device=args.device or None,
        project=args.project,
        name=args.name,
        pretrained=True,
        exist_ok=True,
    )

    # Ultralytics writes the best checkpoint to <project>/<name>/weights/best.pt
    run_dir = Path(results.save_dir)
    best_weights = run_dir / "weights" / "best.pt"

    if not best_weights.exists():
        raise FileNotFoundError(f"Expected best weights at {best_weights} but they were not found.")

    output_path = Path(args.output).resolve()
    output_path.parent.mkdir(parents=True, exist_ok=True)
    shutil.copyfile(best_weights, output_path)

    metrics_src = run_dir / "results.csv"
    if metrics_src.exists():
        metrics_dst = output_path.parent / f"{output_path.stem}-metrics.csv"
        shutil.copyfile(metrics_src, metrics_dst)
        print(f"Training metrics copied to: {metrics_dst}")

    print(f"\nFine-tuning complete.")
    print(f"Best weights copied to: {output_path}")
    print("To use the fine-tuned model, set MODEL_PATH=models/best.pt in ml-service's environment.")


if __name__ == "__main__":
    main()
