"""
ml-service/app/config.py

Centralized, environment-driven configuration for the FastAPI ML service.
Nothing here should be hardcoded elsewhere in the service - always import
from this module so switching pretrained <-> fine-tuned weights, or
changing the confidence threshold, is a single env-var change.
"""

import os
from functools import lru_cache


class Settings:
    # Path to the YOLO11s-cls weights file. Defaults to the pretrained
    # base model; set MODEL_PATH=models/best.pt once a fine-tuned model
    # (see scripts/train-waste-model.py) is available.
    model_path: str = os.getenv("MODEL_PATH", "models/yolo11s-cls.pt")

    # Confidence threshold below which predictions are considered
    # "uncertain" upstream (Next.js). The ML service itself always returns
    # its raw confidence - the threshold decision is centralized in
    # src/lib/waste/wasteUtils.js so it's configured in exactly one place
    # per side (Node and Python each read the same env var name).
    confidence_threshold: float = float(os.getenv("WASTE_CONFIDENCE_THRESHOLD", "0.70"))

    # Comma-separated list of origins allowed to call this service
    # directly (mainly useful for local development/testing of the ML
    # service in isolation - the browser itself never calls this service,
    # only the Next.js server does).
    allowed_origins: list[str] = [
        origin.strip()
        for origin in os.getenv("ML_ALLOWED_ORIGINS", "http://localhost:3000").split(",")
        if origin.strip()
    ]

    # Max upload size accepted by /predict, in bytes.
    max_upload_bytes: int = int(os.getenv("ML_MAX_UPLOAD_BYTES", str(10 * 1024 * 1024)))

    # Number of top alternative predictions to return alongside the best guess.
    top_k_alternatives: int = int(os.getenv("ML_TOP_K_ALTERNATIVES", "3"))


@lru_cache
def get_settings() -> Settings:
    return Settings()
