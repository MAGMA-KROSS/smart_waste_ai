"""
ml-service/app/schemas.py

Pydantic models for the FastAPI ML service's request/response bodies.
"""

from pydantic import BaseModel, Field


class AlternativePrediction(BaseModel):
    class_: str = Field(alias="class")
    displayName: str
    confidence: float

    class Config:
        populate_by_name = True


class PredictionResponse(BaseModel):
    class_: str = Field(alias="class")
    displayName: str
    confidence: float
    alternatives: list[AlternativePrediction] = []
    # What the pretrained model literally predicted before the
    # ImageNet-to-waste-class vocabulary bridge was applied (see
    # class_mapping.py). Optional/informational - existing frontend
    # code that doesn't read this field is unaffected.
    rawClass: str | None = None

    class Config:
        populate_by_name = True


class HealthResponse(BaseModel):
    status: str
    modelLoaded: bool
    modelPath: str
