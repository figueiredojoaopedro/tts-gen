// Renderer process main logic
console.log('Renderer process started');

const speakerWavInput = document.getElementById('speakerWav');
const textToGenerateInput = document.getElementById('textToGenerate');
const outputFolderInput = document.getElementById('outputFolder');
const selectOutputFolderButton = document.getElementById('selectOutputFolder');
const generateButton = document.getElementById('generateButton');
const messagesDiv = document.getElementById('messages');
const modelSelect = document.getElementById('modelSelect');

// Audio Conversion Elements
const audioFilesToConvertInput = document.getElementById('audioFilesToConvert');
const convertFormatSelect = document.getElementById('convertFormat');
const convertedOutputFolderInput = document.getElementById('convertedOutputFolder');
const selectConvertedOutputFolderButton = document.getElementById('selectConvertedOutputFolder');
const convertButton = document.getElementById('convertButton');

let selectedOutputFolder = '';
let selectedConvertedOutputFolder = '';
let audioFilesToConvert = [];

function displayMessage(message, type = 'info') {
    messagesDiv.textContent = message;
    messagesDiv.className = `message ${type}`; // For potential styling: message error, message success
}

// --- TTS Generation Logic ---
selectOutputFolderButton.addEventListener('click', async () => {
    try {
        const folderPath = await window.electronAPI.selectOutputFolder();
        if (folderPath) {
            selectedOutputFolder = folderPath;
            outputFolderInput.value = folderPath;
            displayMessage(`Output folder selected: ${folderPath}`, 'success');
        } else {
            displayMessage('Folder selection cancelled.', 'info');
        }
    } catch (error) {
        console.error('Error selecting output folder:', error);
        displayMessage('Error selecting output folder.', 'error');
    }
});

generateButton.addEventListener('click', async () => {
    const text = textToGenerateInput.value.trim();
    const speakerWavFile = speakerWavInput.files[0];
    const selectedModel = modelSelect.value;

    if (!text) {
        displayMessage('Please enter text to generate.', 'error');
        return;
    }

    if (!speakerWavFile) {
        displayMessage('Please select a speaker WAV file.', 'error');
        return;
    }

    if (!selectedOutputFolder) {
        displayMessage('Please select an output folder.', 'error');
        return;
    }

    displayMessage('Generating audio...', 'info');
    generateButton.disabled = true; // Disable button during generation

    try {
        // Read speaker WAV file as Base64
        const speakerWavBase64 = await window.electronAPI.readFileAsBase64(speakerWavFile.path);

        const response = await fetch('http://localhost:5002/generate-tts/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                text: text,
                speaker_wav: speakerWavBase64, // Send Base64 string
                language: 'en', // Currently hardcoded in server.py
                model_name: selectedModel // Not yet used by server, but included for future
            }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || 'Failed to generate audio');
        }

        const audioBlob = await response.blob();
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = async function() {
            const base64Audio = reader.result.split(',')[1]; // Get base64 data
            const outputFileName = `generated_audio_${Date.now()}.wav`;
            const fullOutputPath = require('path').join(selectedOutputFolder, outputFileName);
            await window.electronAPI.saveBase64AsFile(base64Audio, fullOutputPath);
            displayMessage(`Audio generated and saved to: ${fullOutputPath}`, 'success');
        }
    } catch (error) {
        console.error('Error during TTS generation:', error);
        displayMessage(`Error during TTS generation: ${error.message}`, 'error');
    } finally {
        generateButton.disabled = false; // Re-enable button
    }
});

// --- Audio Conversion Logic ---
audioFilesToConvertInput.addEventListener('change', (event) => {
    audioFilesToConvert = Array.from(event.target.files);
    if (audioFilesToConvert.length > 0) {
        displayMessage(`${audioFilesToConvert.length} file(s) selected for conversion.`, 'info');
    } else {
        displayMessage('No files selected for conversion.', 'info');
    }
});

selectConvertedOutputFolderButton.addEventListener('click', async () => {
    try {
        const folderPath = await window.electronAPI.selectOutputFolder(); // Re-use the same dialog
        if (folderPath) {
            selectedConvertedOutputFolder = folderPath;
            convertedOutputFolderInput.value = folderPath;
            displayMessage(`Converted audio output folder selected: ${folderPath}`, 'success');
        } else {
            displayMessage('Converted folder selection cancelled.', 'info');
        }
    } catch (error) {
        console.error('Error selecting converted output folder:', error);
        displayMessage('Error selecting converted output folder.', 'error');
    }
});

convertButton.addEventListener('click', async () => {
    if (audioFilesToConvert.length === 0) {
        displayMessage('Please select audio files to convert.', 'error');
        return;
    }
    if (!selectedConvertedOutputFolder) {
        displayMessage('Please select an output folder for converted audio.', 'error');
        return;
    }

    const format = convertFormatSelect.value;
    displayMessage(`Converting ${audioFilesToConvert.length} file(s) to ${format}...`, 'info');
    convertButton.disabled = true; // Disable button during conversion

    try {
        for (const file of audioFilesToConvert) {
            await window.electronAPI.convertAudio(file.path, selectedConvertedOutputFolder, format);
            console.log(`Converted ${file.name}`);
        }
        displayMessage('Audio conversion complete!', 'success');
    } catch (error) {
        console.error('Error during audio conversion:', error);
        displayMessage(`Error during audio conversion: ${error.message}`, 'error');
    } finally {
        convertButton.disabled = false; // Re-enable button
    }
});