FROM python:3.10-slim

WORKDIR /app

# System dependancies
RUN apt-get update && apt-get install -y \
    ffmpeg \
    git \
    && rm -rf /var/lib/apt/lists/*

ENV COQUI_TOS_AGREED=1
ENV PYTHONUNBUFFERED=1
ENV TTS_HOME /app/xtts_cache

COPY requirements.txt .

RUN pip install --no-cache-dir -r requirements.txt

# Pre-download XTTS model (important for faster startup)
RUN python - <<EOF
from TTS.api import TTS
TTS(model_name="tts_models/multilingual/multi-dataset/xtts_v2")
EOF

COPY server.py .

EXPOSE 5002

CMD ["uvicorn", "server:app", "--host", "0.0.0.0", "--port", "5002"]
