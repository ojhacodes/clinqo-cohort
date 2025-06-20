FROM python:3.10-slim

WORKDIR /app

RUN apt-get update && apt-get install -y ffmpeg git && rm -rf /var/lib/apt/lists/*

COPY requirements.txt ./
RUN pip install --upgrade pip && pip install -r requirements.txt

COPY ./app ./app
COPY ../ai-engine ./ai-engine

ENV PYTHONPATH="/app:/app/app:/app/ai-engine:/app/ai-engine/nlp:/app/ai-engine/stt"

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
