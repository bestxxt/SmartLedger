from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.responses import JSONResponse
import uvicorn
import os
import uuid
import torch
from faster_whisper import WhisperModel
from pydub import AudioSegment

# Constants for compression
MAX_FILE_SIZE_MB = 25
MAX_FILE_SIZE = MAX_FILE_SIZE_MB * 1024 * 1024  # 25 MB in bytes

# Model settings (cache directory configurable via env var)
MODEL_SIZE = os.getenv("WHISPER_MODEL_SIZE", "small")  # tiny, base, small, medium, large
DEVICE = "cuda" if torch.cuda.is_available() else "cpu"
MODEL_CACHE_DIR = os.getenv("WHISPER_CACHE_DIR", "/Users/terry/Documents/projects/AI_Finance/ai-finance/test/tmp/whisper_cache")
os.makedirs(MODEL_CACHE_DIR, exist_ok=True)

# Initialize FastAPI app
app = FastAPI(
    title="Faster Whisper Transcription API",
    description="Upload an audio file and receive its transcription using faster-whisper.",
    version="1.0.0"
)

# Load the Whisper model on startup, with cache directory
whisper_model = WhisperModel(
    model_size_or_path=MODEL_SIZE,
    device=DEVICE,
    compute_type="int8",  # quantized inference
    download_root=MODEL_CACHE_DIR
)

def compress_audio(file_path: str) -> str:
    """
    Compress audio if it exceeds MAX_FILE_SIZE: downsample to 16kHz mono WAV.
    Returns the path to the (possibly new) audio file.
    """
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

@app.post("/transcribe")
async def transcribe_audio(file: UploadFile = File(...)):
    # Validate file type
    if not file.content_type.startswith(("audio/", "video/")):
        raise HTTPException(status_code=400, detail="Unsupported file type")

    # Save upload to temporary file
    ext = file.filename.split('.')[-1]
    temp_id = uuid.uuid4()
    temp_path = f"/tmp/{temp_id}.{ext}"
    contents = await file.read()
    with open(temp_path, "wb") as f:
        f.write(contents)

    try:
        # Compress audio if necessary
        proc_path = compress_audio(temp_path)

        # Perform transcription
        segments, info = whisper_model.transcribe(
            proc_path,
            beam_size=int(os.getenv("WHISPER_BEAM_SIZE", 5))  # quality vs speed
        )
        transcript = "".join([segment.text for segment in segments]).strip()
        return JSONResponse(content={
            "text": transcript,
            "language": info.language,
            "language_probability": info.language_probability
        })
    finally:
        # Clean up temp files
        files_to_remove = [temp_path, f"{os.path.splitext(temp_path)[0]}_compressed.wav"]
        for path in files_to_remove:
            if os.path.exists(path):
                os.remove(path)

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=int(os.getenv("PORT", 8000)))
