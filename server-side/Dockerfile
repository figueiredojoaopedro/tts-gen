FROM python:3.10-slim-bullseye

WORKDIR /app

# System dependancies
ENV DEBIAN_FRONTEND=noninteractive
RUN echo "Acquire::http::Pipeline-Depth \"0\";" > /etc/apt/apt.conf.d/99-no-pipelining && \
    echo "Acquire::http::No-Cache \"true\";" >> /etc/apt/apt.conf.d/99-no-pipelining && \
    echo "Acquire::Get::Assume-Yes \"true\";" >> /etc/apt/apt.conf.d/99-no-pipelining && \
    apt-get update && apt-get install -y --no-install-recommends \
    ffmpeg \
    git \
    build-essential \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install Rust
ENV RUSTUP_HOME=/usr/local/rustup \
    CARGO_HOME=/usr/local/cargo \
    PATH=/usr/local/cargo/bin:$PATH
RUN curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y

ENV COQUI_TOS_AGREED=1
ENV PYTHONUNBUFFERED=1
ENV TTS_HOME /app/xtts_cache

COPY requirements.txt .

RUN pip install --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Pre-download XTTS model (important for faster startup)
RUN python - <<EOF
from TTS.api import TTS
TTS(model_name="tts_models/multilingual/multi-dataset/xtts_v2")
EOF

COPY server.py .

EXPOSE 5002

CMD ["uvicorn", "server:app", "--host", "0.0.0.0", "--port", "5002"]