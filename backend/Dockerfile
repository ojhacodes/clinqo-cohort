FROM python:3.10-slim

# Set working directory
WORKDIR /app

# Install system dependencies (for Whisper, ffmpeg, etc.)
RUN apt-get update && apt-get install -y ffmpeg git && rm -rf /var/lib/apt/lists/*

# Copy backend requirements and install
COPY requirements.txt ./
RUN pip install --upgrade pip && pip install -r requirements.txt

# Copy backend application code from ./app
COPY ./app ./app

# Copy ai-engine from project root (Make sure Docker build context is repo root ".")
COPY ../ai-engine ./ai-engine

# Set Python path so internal imports work
ENV PYTHONPATH="${PYTHONPATH}:/app:/app/app:/app/ai-engine:/app/ai-engine/nlp:/app/ai-engine/stt"

# Expose backend port
EXPOSE 8000

# Start FastAPI app using uvicorn
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
