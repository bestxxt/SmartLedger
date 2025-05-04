FROM python:3.11-slim

ENV PYTHONUNBUFFERED=1 \
    WHISPER_CACHE_DIR=/app/whisper_cache \
    PORT=8000

RUN apt-get update && \
    apt-get install -y --no-install-recommends ffmpeg && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY audio.py .

EXPOSE 8000
CMD ["uvicorn", "audio:app", "--host", "0.0.0.0", "--port", "8000"]
