"""
ml-service/app/model.py

Loads the YOLO11s-cls classification model ONCE (at FastAPI startup) and
exposes a single `predict()` function used by the /predict endpoint. The
model is never reloaded per-request.

Class names here mirror src/lib/waste/wasteCategories.js on the Next.js
side - if you add a class here (and retrain), add the matching entry
there too so the UI knows how to display it.
"""

import io
import logging
from pathlib import Path

from PIL import Image
from ultralytics import YOLO

from app.config import get_settings
from app.class_mapping import resolve_waste_class

logger = logging.getLogger("smartwaste.ml")

# Friendly display names for known classes. Falls back to a title-cased
# version of the raw class name for anything not listed here, so new
# classes trained into the model "just work" without a code change.
DISPLAY_NAMES = {
    "plastic_bottle": "Plastic Bottle",
    "aluminium_can": "Aluminium Can",
    "glass_bottle": "Glass Bottle",
    "paper": "Paper",
    "cardboard": "Cardboard",
    "tissue": "Tissue",
    "food_waste": "Food Waste",
    "plastic_bag": "Plastic Bag",
    "e_waste": "E-Waste",
    "metal": "Metal",
}


def _to_display_name(class_id: str) -> str:
    if class_id in DISPLAY_NAMES:
        return DISPLAY_NAMES[class_id]
    return class_id.replace("_", " ").replace("-", " ").title()


class WasteClassifier:
    """Thin, load-once wrapper around a YOLO11s-cls model."""

    def __init__(self):
        self._model: YOLO | None = None
        self._model_path: str | None = None

    def load(self) -> None:
        settings = get_settings()
        model_path = Path(settings.model_path)

        if not model_path.exists():
            logger.warning(
                "Model weights not found at %s. The /predict endpoint will "
                "return a 503 until valid weights are available. Falling back "
                "to the pretrained yolo11s-cls.pt file name is expected in "
                "development if you have not downloaded/trained weights yet.",
                model_path,
            )
            self._model = None
            self._model_path = str(model_path)
            return

        logger.info("Loading YOLO classification model from %s ...", model_path)
        self._model = YOLO(str(model_path))
        self._model_path = str(model_path)
        logger.info("Model loaded successfully.")

    @property
    def is_loaded(self) -> bool:
        return self._model is not None

    @property
    def model_path(self) -> str:
        return self._model_path or get_settings().model_path

    def predict(self, image_bytes: bytes, top_k: int = 3) -> dict:
        if self._model is None:
            raise RuntimeError(
                "Model is not loaded. Check MODEL_PATH and ensure the weights "
                "file exists inside ml-service/models/."
            )

        image = Image.open(io.BytesIO(image_bytes)).convert("RGB")

        results = self._model.predict(source=image, verbose=False)
        result = results[0]

        probs = result.probs
        names = result.names  # {index: class_name}

        top1_idx = int(probs.top1)
        top1_conf = float(probs.top1conf)
        top1_raw_label = names[top1_idx]

        # Bridge the pretrained model's real ImageNet vocabulary to our
        # waste taxonomy where a verified mapping exists (see
        # class_mapping.py for the full rationale + disclosed gaps).
        # If unmapped, we deliberately keep the raw label as-is rather
        # than guessing - it will correctly show as "Unknown" in the
        # knowledge base lookup, same as before.
        resolved = resolve_waste_class(top1_raw_label)
        if resolved:
            top1_class, confidence_multiplier = resolved
            top1_conf = top1_conf * confidence_multiplier
        else:
            top1_class = top1_raw_label

        alternatives = []
        top_indices = probs.top5[:top_k] if hasattr(probs, "top5") else []
        for idx in top_indices:
            idx = int(idx)
            if idx == top1_idx:
                continue
            raw_label = names[idx]
            conf = float(probs.data[idx])
            resolved_alt = resolve_waste_class(raw_label)
            if resolved_alt:
                class_name, alt_multiplier = resolved_alt
                conf = conf * alt_multiplier
            else:
                class_name = raw_label
            alternatives.append(
                {
                    "class": class_name,
                    "displayName": _to_display_name(class_name),
                    "confidence": conf,
                }
            )

        return {
            "class": top1_class,
            "displayName": _to_display_name(top1_class),
            "confidence": top1_conf,
            "alternatives": alternatives,
            # Transparency field: what the underlying pretrained model
            # literally predicted before any vocabulary bridging. Not
            # required by the frontend contract - safe to ignore.
            "rawClass": top1_raw_label,
        }


# Module-level singleton - imported and populated once at app startup
# (see main.py's lifespan handler), then reused for every request.
classifier = WasteClassifier()
