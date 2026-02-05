const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    selectOutputFolder: () => ipcRenderer.invoke('select-output-folder'),
    joinPaths: (...paths) => ipcRenderer.invoke('join-paths', ...paths),
    selectAudioFilesToConvert: () => ipcRenderer.invoke('select-audio-files-to-convert'),
    convertAudio: (inputFilePath, outputFolderPath, format) => ipcRenderer.invoke('convert-audio', inputFilePath, outputFolderPath, format),
    readFileAsBase64: (filePath) => ipcRenderer.invoke('read-file-as-base64', filePath),
    saveBase64AsFile: (base64Data, outputPath) => ipcRenderer.invoke('save-base64-as-file', base64Data, outputPath)
});

window.addEventListener('DOMContentLoaded', () => {
    const replaceText = (selector, text) => {
      const element = document.getElementById(selector)
      if (element) element.innerText = text
    }
  
    for (const type of ['chrome', 'node', 'electron']) {
      replaceText(`${type}-version`, process.versions[type])
    }
});