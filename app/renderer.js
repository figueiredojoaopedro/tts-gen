// Renderer process main logic
console.log("Renderer process started");

const speakerWavInput = document.getElementById("speakerWav");
const textToGenerateInput = document.getElementById("textToGenerate");
const outputFolderInput = document.getElementById("outputFolder");
const selectOutputFolderButton = document.getElementById("selectOutputFolder");
const generateButton = document.getElementById("generateButton");
const messagesDiv = document.getElementById("messages");
const modelSelect = document.getElementById("modelSelect");
const languageSelect = document.getElementById("languageSelect"); // New element reference

// Define supported languages for XTTS v2
const supportedLanguages = [
  { code: "en", name: "English" },
  { code: "es", name: "Spanish" },
  { code: "fr", name: "French" },
  { code: "de", name: "German" },
  { code: "it", name: "Italian" },
  { code: "pt", name: "Portuguese (Brazil)" }, // Using pt-br to match backend default
  { code: "pl", name: "Polish" },
  { code: "tr", name: "Turkish" },
  { code: "ru", name: "Russian" },
  { code: "nl", name: "Dutch" },
  { code: "cs", name: "Czech" },
  { code: "ar", name: "Arabic" },
  { code: "zh-cn", name: "Chinese (Simplified)" },
  { code: "ja", name: "Japanese" },
  { code: "hu", name: "Hungarian" },
  { code: "ko", name: "Korean" },
  { code: "hi", name: "Hindi" },
];

// Populate language dropdown
supportedLanguages.forEach((lang) => {
  const option = document.createElement("option");
  option.value = lang.code;
  option.textContent = lang.name;
  languageSelect.appendChild(option);
});

// Set default language to 'pt-br'
languageSelect.value = "pt-br";

// Audio Conversion Elements
const audioFilesToConvertInput = document.getElementById("audioFilesToConvert");
const convertFormatSelect = document.getElementById("convertFormat");
const convertedOutputFolderInput = document.getElementById(
  "convertedOutputFolder",
);
const selectConvertedOutputFolderButton = document.getElementById(
  "selectConvertedOutputFolder",
);
const convertButton = document.getElementById("convertButton");

let selectedOutputFolder = "";
let selectedConvertedOutputFolder = "";
let audioFilesToConvert = [];

function displayMessage(message, type = "info") {
  messagesDiv.textContent = message;
  messagesDiv.className = `message ${type}`; // For potential styling: message error, message success
}

// --- TTS Generation Logic ---
selectOutputFolderButton.addEventListener("click", async () => {
  try {
    const folderPath = await window.electronAPI.selectOutputFolder();
    if (folderPath) {
      selectedOutputFolder = folderPath;
      outputFolderInput.value = folderPath;
      displayMessage(`Output folder selected: ${folderPath}`, "success");
    } else {
      displayMessage("Folder selection cancelled.", "info");
    }
  } catch (error) {
    console.error("Error selecting output folder:", error);
    displayMessage(`Error selecting output folder: ${error.message}`, "error");
  }
});

generateButton.addEventListener("click", async () => {
  const text = textToGenerateInput.value.trim();
  const speakerWavFile = speakerWavInput.files[0];
  const selectedModel = modelSelect.value;
  const selectedLanguage = languageSelect.value; // Get selected language

  if (!text) {
    displayMessage("Please enter text to generate.", "error");
    return;
  }

  if (!speakerWavFile) {
    displayMessage("Please select a speaker WAV file.", "error");
    return;
  }

  if (!selectedOutputFolder) {
    displayMessage("Please select an output folder.", "error");
    return;
  }

  displayMessage("Generating audio...", "info");
  generateButton.disabled = true; // Disable button during generation

  try {
    // Read speaker WAV file as Base64 directly in the renderer process
    // because file.path can be unreliable in sandboxed environments.
    const speakerWavBase64 = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result.split(",")[1]);
      reader.onerror = reject;
      reader.readAsDataURL(speakerWavFile);
    });

    const response = await fetch("http://localhost:5002/generate-tts/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text: text,
        speaker_wav: speakerWavBase64, // Send Base64 string
        language: selectedLanguage, // Use the dynamically selected language
        model_name: selectedModel, // Not yet used by server, but included for future
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || "Failed to generate audio");
    }

    const audioBlob = await response.blob();
    const reader = new FileReader();
    reader.readAsDataURL(audioBlob);
    reader.onloadend = async function () {
      const base64Audio = reader.result.split(",")[1]; // Get base64 data
      const outputFileName = `generated_audio_${Date.now()}.wav`;
      const fullOutputPath = await window.electronAPI.joinPaths(
        selectedOutputFolder,
        outputFileName,
      );
      await window.electronAPI.saveBase64AsFile(base64Audio, fullOutputPath);
      displayMessage(
        `Audio generated and saved to: ${fullOutputPath}`,
        "success",
      );
    };
  } catch (error) {
    console.error("Error during TTS generation:", error);
    displayMessage(`Error during TTS generation: ${error.message}`, "error");
  } finally {
    generateButton.disabled = false; // Re-enable button
  }
});

// --- Audio Conversion Logic ---
const selectAudioFilesButton = document.getElementById(
  "selectAudioFilesButton",
);
const selectedAudioFilesCount = document.getElementById(
  "selectedAudioFilesCount",
);

selectAudioFilesButton.addEventListener("click", async () => {
  try {
    const filePaths = await window.electronAPI.selectAudioFilesToConvert();
    if (filePaths && filePaths.length > 0) {
      audioFilesToConvert = filePaths;
      selectedAudioFilesCount.textContent = `${filePaths.length} file(s) selected`;
      displayMessage(
        `${filePaths.length} file(s) selected for conversion.`,
        "info",
      );
    } else {
      selectedAudioFilesCount.textContent = "0 files selected";
      displayMessage("No files selected for conversion.", "info");
    }
  } catch (error) {
    console.error("Error selecting audio files:", error);
    displayMessage(`Error selecting audio files: ${error.message}`, "error");
  }
});

selectConvertedOutputFolderButton.addEventListener("click", async () => {
  try {
    const folderPath = await window.electronAPI.selectOutputFolder(); // Re-use the same dialog
    if (folderPath) {
      selectedConvertedOutputFolder = folderPath;
      convertedOutputFolderInput.value = folderPath;
      displayMessage(
        `Converted audio output folder selected: ${folderPath}`,
        "success",
      );
    } else {
      displayMessage("Converted folder selection cancelled.", "info");
    }
  } catch (error) {
    console.error("Error selecting converted output folder:", error);
    displayMessage(
      `Error selecting converted output folder: ${error.message}`,
      "error",
    );
  }
});

convertButton.addEventListener("click", async () => {
  if (audioFilesToConvert.length === 0) {
    displayMessage("Please select audio files to convert.", "error");
    return;
  }
  if (!selectedConvertedOutputFolder) {
    displayMessage(
      "Please select an output folder for converted audio.",
      "error",
    );
    return;
  }

  const format = convertFormatSelect.value;
  displayMessage(
    `Converting ${audioFilesToConvert.length} file(s) to ${format}...`,
    "info",
  );
  convertButton.disabled = true; // Disable button during conversion

  try {
    for (const filePath of audioFilesToConvert) {
      await window.electronAPI.convertAudio(
        filePath,
        selectedConvertedOutputFolder,
        format,
      );
      console.log(`Converted ${filePath}`);
    }
    displayMessage("Audio conversion complete!", "success");
  } catch (error) {
    console.error("Error during audio conversion:", error);
    displayMessage(`Error during audio conversion: ${error.message}`, "error");
  } finally {
    convertButton.disabled = false; // Re-enable button
  }
});
