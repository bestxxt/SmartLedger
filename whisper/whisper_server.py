from fastapi import FastAPI, File, UploadFile, HTTPException, Depends, Query
from fastapi.responses import StreamingResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security.api_key import APIKeyHeader
import uvicorn
import os
import uuid
import json
from faster_whisper import WhisperModel
from dotenv import load_dotenv, find_dotenv
from pydub import AudioSegment
import asyncio
import sys

env_path = find_dotenv("./.env", usecwd=True)
if not env_path or not os.path.isfile(env_path):
    print("Error: .env file not found in the current directory, program exiting.", file=sys.stderr)
    sys.exit(1)
load_dotenv(dotenv_path=env_path, override=True)

# Constants for compression
MAX_FILE_SIZE_MB = 25
MAX_FILE_SIZE = MAX_FILE_SIZE_MB * 1024 * 1024  # 25 MB in bytes

# Model settings
MODEL_SIZE = os.getenv("WHISPER_MODEL_SIZE", "small")
DEVICE = os.getenv("WHISPER_DEVICE", "cpu")
MODEL_CACHE_DIR = os.getenv("WHISPER_CACHE_DIR", "/tmp/whisper_cache")
BEAM_SIZE = int(os.getenv("WHISPER_BEAM_SIZE", 5))
API_KEY = os.getenv("API_KEY","hellowhisper")
print(f"Using Whisper model size: {MODEL_SIZE}, device: {DEVICE}, beam size: {BEAM_SIZE}")

API_KEY_NAME = "X-API-Key"
api_key_header = APIKeyHeader(name=API_KEY_NAME, auto_error=False)

async def get_api_key(api_key: str = Depends(api_key_header)):
    if not api_key:
        raise HTTPException(status_code=401, detail="Missing API Key")
    if api_key != API_KEY:
        raise HTTPException(status_code=403, detail="Invalid API Key")
    return api_key

os.makedirs(MODEL_CACHE_DIR, exist_ok=True)

app = FastAPI(
    title="Faster Whisper Transcription API",
    description="Upload an audio file and receive streaming or non-streaming transcription via faster-whisper.",
    version="1.0.0"
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

whisper_model = WhisperModel(
    model_size_or_path=MODEL_SIZE,
    device=DEVICE,
    compute_type="float32",
    download_root=MODEL_CACHE_DIR
)

def compress_audio(file_path: str) -> str:
    if os.path.getsize(file_path) <= MAX_FILE_SIZE:
        return file_path

    audio = AudioSegment.from_file(file_path)
    audio = audio.set_frame_rate(16000).set_channels(1)

    base, _ = os.path.splitext(file_path)
    compressed_path = f"{base}_compressed.wav"
    audio.export(compressed_path, format="wav")

    if os.path.getsize(compressed_path) <= MAX_FILE_SIZE:
        os.remove(file_path)
        return compressed_path

    os.remove(compressed_path)
    return file_path

# stream API
@app.post("/transcribe", dependencies=[Depends(get_api_key)])
async def transcribe_audio(
        file: UploadFile = File(...),
        stream: bool = Query(False, description="Whether to stream the transcription response")
    ):
    content_type = file.content_type
    if content_type and not content_type.startswith(("audio/", "video/")):
        raise HTTPException(status_code=400, detail="Unsupported file type")

    ext = file.filename.split('.')[-1]
    temp_id = uuid.uuid4()
    temp_path = f"/tmp/{temp_id}.{ext}"
    contents = await file.read()
    with open(temp_path, "wb") as f:
        f.write(contents)

    async def stream_response():
        try:
            proc_path = compress_audio(temp_path)

            segments, info = whisper_model.transcribe(
                proc_path,
                beam_size=BEAM_SIZE,
            )

            yield json.dumps({
                "language": info.language,
                "language_probability": info.language_probability
            }) + "\n"

            for segment in segments:
                await asyncio.sleep(0)
                msg = {
                    "start": round(segment.start, 2),
                    "end": round(segment.end, 2),
                    "text": segment.text
                }
                yield json.dumps(msg) + "\n"
        finally:
            # clear up temp files
            for path in [temp_path, f"{os.path.splitext(temp_path)[0]}_compressed.wav"]:
                if os.path.exists(path):
                    os.remove(path)

    async def normal_response():
        try:
            proc_path = compress_audio(temp_path)

            segments, info = whisper_model.transcribe(
                proc_path,
                beam_size=BEAM_SIZE,
            )

            result = {
                "language": info.language,
                "language_probability": info.language_probability,
                "segments": [
                    {
                        "start": round(seg.start, 2),
                        "end": round(seg.end, 2),
                        "text": seg.text
                    }
                    for seg in segments
                ]
            }

            return JSONResponse(content=result)
        finally:
            for p in [temp_path, f"{os.path.splitext(temp_path)[0]}_compressed.wav"]:
                if os.path.exists(p):
                    os.remove(p)
    
    if stream:
        return StreamingResponse(stream_response(), media_type="application/json")
    else:
        return await normal_response()


if __name__ == "__main__":
    uvicorn.run(
        "whisper_server:app",
        host="0.0.0.0",
        port=int(os.getenv("PORT", 8000)),
        reload=True
    )
