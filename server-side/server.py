from fastapi import FastAPI, HTTPException, Request
from fastapi.responses import FileResponse
from pydantic import BaseModel
import uvicorn
from TTS.api import TTS
import os
import base64
import uuid

# Initialize FastAPI app
app = FastAPI()

# Initialize TTS model
# Make sure to have enough memory to load the model
try:
    tts = TTS(
        model_name="tts_models/multilingual/multi-dataset/xtts_v2",
        gpu=False
    )
except Exception as e:
    print(f"Error initializing TTS model: {e}")
    tts = None

# --- Speaker WAV Selection ---
# This part is largely superseded by Base64 upload, but kept for context/fallback
speaker_wav_file = "Recording.wav"

if not os.path.exists(speaker_wav_file):
    print(f"'{speaker_wav_file}' not found. Using default 'male.wav'.")
    speaker_wav_file = "male.wav"
    if not os.path.exists(speaker_wav_file):
        print(f"'{speaker_wav_file}' also not found. This will likely cause errors.")

else:
    print(f"Using custom voice file: '{speaker_wav_file}'")


class TTSRequest(BaseModel):
    text: str
    speaker_wav: str = None  # Now expects a Base64 string
    language: str = "en"
    model_name: str = "tts_models/multilingual/multi-dataset/xtts_v2" # Added for future use


@app.post("/generate-tts/")
async def generate_tts(request: TTSRequest):
    """
    Generates speech from text using the pre-loaded XTTS model.
    """
    if tts is None:
        raise HTTPException(status_code=500, detail="TTS model is not available.")

    temp_speaker_wav_path = None
    try:
        # Define the output directory and file
        OUTPUT_DIR = os.getcwd()
        output_file_name = f"output_{uuid.uuid4().hex}.wav"
        output_file_path = os.path.join(OUTPUT_DIR, output_file_name)
        
        # Handle speaker_wav from Base64
        speaker_path_for_tts = speaker_wav_file # Fallback to default
        if request.speaker_wav:
            # Decode Base64 and save to a temporary file
            audio_data = base64.b64decode(request.speaker_wav)
            temp_speaker_wav_name = f"temp_speaker_{uuid.uuid4().hex}.wav"
            temp_speaker_wav_path = os.path.join(OUTPUT_DIR, temp_speaker_wav_name)
            with open(temp_speaker_wav_path, "wb") as f:
                f.write(audio_data)
            speaker_path_for_tts = temp_speaker_wav_path

        if not os.path.exists(speaker_path_for_tts):
            raise HTTPException(status_code=400, detail=f"Speaker WAV file not found: {speaker_path_for_tts}")

        # Synthesize text to speech
        print(f"Synthesizing text: '{request.text}' with model '{request.model_name}'")
        # Note: model_name from request is not dynamically loaded here.
        # The 'tts' object was initialized with a specific model.
        # Dynamic model loading would require re-initialization of TTS object,
        # which is a heavy operation and not supported in this simple endpoint.
        tts.tts_to_file(
            text=request.text,
            speaker_wav=speaker_path_for_tts,
            language=request.language,
            file_path=output_file_path
        )

        return FileResponse(output_file_path, media_type="audio/wav", filename="output.wav")

    except Exception as e:
        print(f"Error during TTS generation: {e}")
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if temp_speaker_wav_path and os.path.exists(temp_speaker_wav_path):
            os.remove(temp_speaker_wav_path)