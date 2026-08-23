"""
ml-service/app/main.py

FastAPI entrypoint for the SmartWaste AI computer-vision microservice.

Responsibilities (and ONLY these - business rules like the confidence
threshold, knowledge base, safety rules, Gemini, and YouTube all live in
the Next.js app, not here):
  - load the YOLO11s-cls model once at startup
  - expose POST /predict for image classification
  - expose GET /health for readiness checks

Run locally:
    pip install -r requirements.txt
    uvicorn app.main:app --reload
"""

import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware

from app.config import get_settings
from app.model import classifier
from app.schemas import HealthResponse, PredictionResponse

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("smartwaste.ml")

ALLOWED_CONTENT_TYPES = {"image/jpeg", "image/png", "image/webp"}


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Load the model exactly once when the app starts, not per-request.
    classifier.load()
    yield


app = FastAPI(
    title="SmartWaste AI - Vision Service",
    description="YOLO11s-cls based waste classification microservice.",
    version="1.0.0",
    lifespan=lifespan,
)

settings = get_settings()
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health", response_model=HealthResponse)
async def health():
    return HealthResponse(
        status="ok" if classifier.is_loaded else "model_not_loaded",
        modelLoaded=classifier.is_loaded,
        modelPath=classifier.model_path,
    )


@app.post("/predict", response_model=PredictionResponse)
async def predict(image: UploadFile = File(...)):
    if image.content_type not in ALLOWED_CONTENT_TYPES:
        raise HTTPException(
            status_code=415,
            detail="Unsupported image format. Please upload a JPEG, PNG, or WebP image.",
        )

    contents = await image.read()

    if not contents:
        raise HTTPException(status_code=400, detail="Uploaded image is empty.")

    if len(contents) > settings.max_upload_bytes:
        raise HTTPException(status_code=413, detail="Image is too large.")

    if not classifier.is_loaded:
        raise HTTPException(
            status_code=503,
            detail=(
                "Model is not loaded. Ensure MODEL_PATH points to a valid "
                "YOLO11s-cls weights file (see ml-service/README.md)."
            ),
        )

    try:
        prediction = classifier.predict(contents, top_k=settings.top_k_alternatives)
    except Exception as exc:  # noqa: BLE001 - convert any inference error to a safe 500
        logger.exception("Inference failed")
        raise HTTPException(status_code=500, detail="Waste classification failed.") from exc

    return PredictionResponse(**prediction)
