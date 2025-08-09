# Base Python image
FROM python:3.11-slim

# (Optional) Install OCR binary if ENABLE_OCR=1
RUN apt-get update && apt-get install -y --no-install-recommends tesseract-ocr && \
    rm -rf /var/lib/apt/lists/*

ENV PIP_NO_CACHE_DIR=1 PYTHONDONTWRITEBYTECODE=1 PYTHONUNBUFFERED=1

# Set workdir
WORKDIR /code

# Install dependencies
COPY requirements.txt /code/requirements.txt
COPY backend/app/requirements.txt /code/backend/app/requirements.txt
RUN pip install -r /code/requirements.txt

# Copy all project files
COPY . /code

# Hugging Face exposes PORT=7860
ENV PORT=7860

# Run FastAPI (app.py has `app` variable)
CMD ["bash","-lc","uvicorn app:app --host 0.0.0.0 --port ${PORT}"]
