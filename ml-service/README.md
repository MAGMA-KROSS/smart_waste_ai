# SmartWaste AI - Vision Microservice

A standalone FastAPI service responsible for exactly one thing: waste
image classification using a YOLO11s-cls model. It has no knowledge of
Gemini, YouTube, MongoDB, or disposal rules - that logic lives in the
Next.js app, which is the only client allowed to call this service.

## Requirements

- Python 3.11+
- The model weights file at `models/yolo11s-cls.pt` (pretrained) or
  `models/best.pt` (fine-tuned, see `scripts/train-waste-model.py`)

## Setup

```bash
cd ml-service
python -m venv .venv
source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt
```

Download the pretrained base model (one-time):

```bash
python -c "from ultralytics import YOLO; YOLO('yolo11s-cls.pt')"
# Then move/copy the downloaded weights into ml-service/models/yolo11s-cls.pt
```

## Run

```bash
uvicorn app.main:app --reload
```

The service starts on `http://localhost:8000` and loads the model exactly
once at startup (see `app/main.py`'s `lifespan` handler) - it is never
reloaded per request.

## Pretrained-model vocabulary bridge (temporary, until `best.pt` exists)

While `MODEL_PATH` still points at the generic pretrained
`yolo11s-cls.pt` (ImageNet-1k, 1000 classes), `app/class_mapping.py`
translates a verified subset of that model's real output labels (e.g.
`"water bottle"`, `"pop bottle"`, `"carton"`) into this project's waste
classIds (e.g. `plastic_bottle`, `cardboard`) so the knowledge-base
lookup in the Next.js app can resolve them. It does **not** invent or
override the model's prediction - only translates already-real output
into the project's vocabulary, and leaves anything unmapped untouched.
See that file's docstring for the full mapping, its source, and its
disclosed gaps (notably: no reliable ImageNet-1k class exists for
`aluminium_can` or `food_waste`). Once `best.pt` is trained directly on
this project's own classes (`scripts/train-waste-model.py`), this bridge
becomes unnecessary for the classes it was trained on.

## Environment variables

| Variable | Default | Description |
|---|---|---|
| `MODEL_PATH` | `models/yolo11s-cls.pt` | Path to model weights. Set to `models/best.pt` to use the fine-tuned model. |
| `WASTE_CONFIDENCE_THRESHOLD` | `0.70` | Informational only here; the accept/reject decision is enforced in the Next.js app. |
| `ML_ALLOWED_ORIGINS` | `http://localhost:3000` | CORS allow-list, comma separated. |
| `ML_MAX_UPLOAD_BYTES` | `10485760` (10MB) | Max accepted upload size. |
| `ML_TOP_K_ALTERNATIVES` | `3` | Number of alternative predictions returned. |

## Endpoints

### `GET /health`
Returns whether the model is loaded and which weights path is active.

### `POST /predict`
`multipart/form-data` with an `image` field.

```bash
curl -X POST http://localhost:8000/predict \
  -F "image=@/path/to/photo.jpg"
```

Response:

```json
{
  "class": "aluminium_can",
  "displayName": "Aluminium Can",
  "confidence": 0.96,
  "alternatives": [
    { "class": "metal", "displayName": "Metal", "confidence": 0.02 }
  ]
}
```

## Docker

```bash
docker build -t smartwaste-ml .
docker run -p 8000:8000 -v $(pwd)/models:/app/models smartwaste-ml
```
