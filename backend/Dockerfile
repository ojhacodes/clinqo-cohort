FROM python:3.10-slim

# Set work directory
WORKDIR /app

# Install system dependencies (needed for Whisper, ffmpeg, etc.)
RUN apt-get update && apt-get install -y ffmpeg git && rm -rf /var/lib/apt/lists/*

# Copy requirements and install dependencies
COPY requirements.txt ./
RUN pip install --upgrade pip && pip install -r requirements.txt

# Copy backend code (your app)
COPY ./app ./app

# 🔥 Also copy ai-engine into the container so those .py files are available
COPY ../ai-engine ./ai-engine

# Make sure app directory is in PYTHONPATH
ENV PYTHONPATH="${PYTHONPATH}:/app:/app/app:/app/ai-engine/nlp:/app/ai-engine/stt"

# Expose the FastAPI port
EXPOSE 8000

# Start FastAPI with uvicorn
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
