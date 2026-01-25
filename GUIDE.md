# TTS Generator Project Guide

This guide will walk you through setting up and running the TTS Generator project.

## Prerequisites

Before you begin, ensure you have the following installed:

*   **Node.js:** [Download and install Node.js](https://nodejs.org/en/)
*   **Docker:** [Download and install Docker Desktop](https://www.docker.com/products/docker-desktop)

## Setup

1.  **Install Electron App Dependencies:**
    Navigate to the `app` directory and install the required Node.js packages:
    ```bash
    cd app
    npm install
    ```
    Return to the root directory after installation:
    ```bash
    cd ..
    ```

## Running the Application

To run the TTS Generator, you need to start both the server-side component (using Docker) and the desktop application (using Electron).

### 1. Start the Server

From the root directory of the project, run the following command to build and start the Docker container for the TTS server:

```bash
docker-compose up --build -d
```

This will download the necessary TTS models and start the server. The first time you run this, it may take some time to download the models.

### 2. Start the Electron App

Once the server is running, you can start the Electron application. From the root directory, run:

```bash
npm start --prefix app
```

This will open the TTS Generator desktop application window.

## Using the Application

### Text-to-Speech (TTS) Generation

1.  **Select a Speaker WAV:** Click "Choose File" and select a `.wav` audio file of the voice you want to clone.
2.  **Select Model:** Choose a TTS model from the dropdown. Currently, only XTTS v2 is available.
3.  **Enter Text:** Type the text you want to convert to speech.
4.  **Select Output Folder:** Choose the folder where the generated audio will be saved.
5.  **Generate:** Click "Generate Audio". The generated `.wav` file will be saved in your selected output folder.

### Audio Conversion

1.  **Select Audio Files:** Click "Choose Files" and select one or more audio files you want to convert.
2.  **Select Format:** Choose the target format (`.wav`, `.mp3`, or `.mp4`) from the dropdown.
3.  **Select Output Folder:** Choose the folder where the converted files will be saved.
4.  **Convert:** Click "Convert Audio". The converted files will be saved in your selected output folder.

## Stopping the Application

To stop the server and release the resources used by the Docker container, run the following command from the root directory:

```bash
docker-compose down
```
