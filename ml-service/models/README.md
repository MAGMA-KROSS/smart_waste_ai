# Model Weights Directory

This directory is where model weight files (`.pt`) belong. They are **not**
included in source control (large binaries) - fetch/create them as follows:

- `yolo11s-cls.pt` - pretrained base model. Get it via:
  ```bash
  python -c "from ultralytics import YOLO; YOLO('yolo11s-cls.pt')"
  ```
  Ultralytics downloads it automatically; copy/move the resulting file here.

- `best.pt` - fine-tuned production model, produced by
  `scripts/train-waste-model.py` after training on `dataset/`.

Point `MODEL_PATH` (see `.env.example`) at whichever file you want the
FastAPI service to load.
