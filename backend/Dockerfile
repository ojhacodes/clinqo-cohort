FROM python:3.10-slim

# Set work directory
WORKDIR /app

# Install system dependencies (for whisper, ffmpeg, etc.)
RUN apt-get update && apt-get install -y ffmpeg git && rm -rf /var/lib/apt/lists/*

# Copy backend requirements and install
COPY requirements.txt ./
RUN pip install --upgrade pip && pip install -r requirements.txt

# Copy the backend code
COPY . .  # This copies everything in the backend/ folder

# Copy ai-engine from project root (IMPORTANT)
COPY ../ai-engine ./ai-engine

# Set Python path so that `from .prescription_generator` etc. work inside main.py
ENV PYTHONPATH="${PYTHONPATH}:/app:/app/ai-engine:/app/ai-engine/nlp:/app/ai-engine/stt"

# Expose backend port
EXPOSE 8000

# Start the FastAPI app
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
