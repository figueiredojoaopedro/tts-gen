# Guide: Running the TTS Generation Server

This guide explains how to run the Text-to-Speech (TTS) server using Docker and how to interact with it to generate audio files.

## 1. Prerequisites

- [Docker](https://docs.docker.com/get-docker/) must be installed and running on your system.
- [Docker Compose](https://docs.docker.com/compose/install/) is included with most Docker Desktop installations and is required.

## 2. Running the Server

The `docker-compose.yml` file handles all the configuration for running the server in a container.

1.  Open your terminal.
2.  Navigate to the `server-side` directory:
    ```bash
    cd path/to/your/project/tts-gen/server-side
    ```
3.  Run the following command to build and start the server:

    ```bash
    docker-compose up --build
    ```

    - The first time you run this, it will take a while to download the TTS model and build the Docker image.
    - The server will be running and listening on `http://localhost:5002`.

## 3. Generating Speech

Yes, it is now a server. You can send `POST` requests to it to synthesize text into speech.

There are two main ways to interact with the API:

### Option A: Using the Interactive API Docs (Recommended)

1.  Once the server is running, open your web browser and go to:
    **[http://localhost:5002/docs](http://localhost:5002/docs)**
2.  You will see the interactive API documentation (Swagger UI).
3.  Click on the `/generate-tts/` endpoint, then click "Try it out".
4.  You can modify the request body to change the text you want to generate.
    ```json
    {
      "text": "Hello, this is a test from the API."
    }
    ```
5.  Click "Execute". The server will generate the audio and send it back as a downloadable `output.wav` file.

### Option B: Using `curl` from the command line

You can also use a command-line tool like `curl` to send requests.

1.  Open a new terminal.
2.  Run the following command:

    ```bash
    curl -X POST "http://localhost:5002/generate-tts/" \
         -H "Content-Type: application/json" \
         -d '{"text": "Hello from the command line."}' \
         --output generated_audio.wav
    ```

3.  This command will send the text to the server and save the resulting audio as `generated_audio.wav` in your current directory.

## 4. Using a Custom Voice

The server is configured to look for a specific audio file to use as the voice for synthesis.

- To use your own voice, place a WAV file named `Recording.wav` inside the `server-side` directory.
- If `Recording.wav` is not found, the server will fall back to using the default `male.wav` file.
- If you change the voice file while the server is running, you may need to restart it for the changes to take effect: `docker-compose down && docker-compose up --build`.

## 5. Troubleshooting

### Issue: Docker creates a weirdly named directory (e.g., `server-side;C...`)

This problem often occurs on Windows when using `docker run` directly from certain terminals with commands like `-v $(pwd):/app`. The `docker-compose.yml` file is specifically designed to prevent this.

**Solution:** Always use the `docker-compose up` command from within the `server-side` directory as described in this guide. It correctly handles the file paths for you.
