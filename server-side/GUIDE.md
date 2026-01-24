# Text-to-Speech (TTS) Generator Guide

This guide explains how to use this project to generate speech from a text file using the Coqui TTS model within a Docker container.

## 1. Project Overview

This project uses the `coqui/xtts_v2` text-to-speech model to convert text into an audio file. The process is managed within a Docker container to ensure all dependencies and configurations are handled correctly.

## 2. File Structure

- `Dockerfile`: Configuration to build the Docker image.
- `server.py`: The main Python script that generates audio.
- `requirements.txt`: Required Python packages.
- `test.txt`: Your input text file.
- `Recording.wav`: Your primary custom voice file. The script will use this file if it exists.
- `male.wav`: A fallback voice file. If `Recording.wav` is not found, the script will use this.
- `output.wav`: The generated audio output.

...

## 5. Customization

### Using a Custom Voice

The script is designed to prioritize your own high-quality voice recordings.

1.  **Primary Voice (`Recording.wav`)**: To use your own voice, place a `.wav` file named `Recording.wav` in the `server-side` directory. The script will automatically use this file if it finds it.

2.  **Fallback Voice (`male.wav`)**: If `Recording.wav` is not found, the script will look for `male.wav` and use it as a fallback.

3.  **Automatic Download**: If neither `Recording.wav` nor `male.wav` is found, the script will automatically download a default male voice file and save it as `male.wav`.

### Changing the Language

You can change the output language by editing the `language` parameter in `server-side/server.py`. For example, to use Portuguese:

To run the generator, navigate to the server-side directory and use this command:

1 docker run --rm -v "$(pwd):/app" tts-generator

For Windows PowerShell users:

1 docker run --rm -v ${PWD}:/app tts-generator

```python
# From
language="en",

# To
language="pt",
```

After making changes to `server.py`, you will need to rebuild the Docker image using the `docker build` command from Step 3.
