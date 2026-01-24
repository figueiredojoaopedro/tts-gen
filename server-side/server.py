from TTS.api import TTS
import os
import requests

# # Initialize TTS model
# tts = TTS(
#     model_name="tts_models/multilingual/multi-dataset/xtts_v2",
#     gpu=False
# )

# --- Speaker WAV Selection and Download ---
speaker_wav_file = "Recording.wav"

if not os.path.exists(speaker_wav_file):
    print(f"'{speaker_wav_file}' not found.")
    speaker_wav_file = "male.wav"
    
    if not os.path.exists(speaker_wav_file):
        print(f"'{speaker_wav_file}' not found. Downloading a default voice file...")
        url = "https://www.signalogic.com/melp/EngSamples/Orig/male.wav"
        try:
            response = requests.get(url)
            response.raise_for_status()  # Raise an exception for bad status codes
            with open(speaker_wav_file, "wb") as f:
                f.write(response.content)
            print("Download complete.")
        except requests.exceptions.RequestException as e:
            print(f"Error downloading speaker wav file: {e}")
            exit()
    else:
        print(f"Using existing '{speaker_wav_file}'.")
else:
    print(f"Using custom voice file: '{speaker_wav_file}'")

# Define the output directory and file
OUTPUT_DIR = os.getcwd()
output_file = os.path.join(OUTPUT_DIR, "output.wav")

# Read text from test.txt
try:
    with open("./test.txt", "r", encoding="utf-8") as f:
        text_to_synthesize = f.read()
except FileNotFoundError:
    print("Error: test.txt not found. Please create this file and write the text you want to synthesize.")
    exit()

# Synthesize text to speech and save to a file
print("Synthesizing text to speech...")
tts.tts_to_file(
    text=text_to_synthesize,
    speaker_wav=speaker_wav_file,
    language="en",     # Change the language if needed
    file_path=output_file
)

print(f"Audio file saved to: {output_file}")
