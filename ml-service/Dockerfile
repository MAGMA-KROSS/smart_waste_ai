# ml-service/Dockerfile
FROM python:3.11-slim

WORKDIR /app

# System deps required by Pillow/OpenCV (used transitively by ultralytics)
RUN apt-get update && apt-get install -y --no-install-recommends \
    libgl1 \
    libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY app ./app
COPY models ./models

ENV MODEL_PATH=models/yolo11s-cls.pt
ENV WASTE_CONFIDENCE_THRESHOLD=0.70
ENV ML_ALLOWED_ORIGINS=http://localhost:3000

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
