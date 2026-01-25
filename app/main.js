const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');
const ffmpeg = require('fluent-ffmpeg');
const ffmpegStatic = require('ffmpeg-static');

// Set the path to the ffmpeg executable
ffmpeg.setFfmpegPath(ffmpegStatic);

function createWindow () {
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: true,
      contextIsolation: false,
    }
  });

  mainWindow.loadFile('index.html');
  // Open the DevTools.
  mainWindow.webContents.openDevTools();

  ipcMain.handle('select-output-folder', async () => {
    const { canceled, filePaths } = await dialog.showOpenDialog(mainWindow, {
      properties: ['openDirectory']
    });
    if (canceled) {
      return null;
    } else {
      return filePaths[0];
    }
  });

  ipcMain.handle('select-audio-files-to-convert', async () => {
    const { canceled, filePaths } = await dialog.showOpenDialog(mainWindow, {
      properties: ['openFile', 'multiSelections'],
      filters: [
        { name: 'Audio', extensions: ['mp3', 'wav', 'ogg', 'flac', 'aac', 'm4a'] }
      ]
    });
    if (canceled) {
      return [];
    } else {
      return filePaths;
    }
  });

  ipcMain.handle('convert-audio', async (event, inputFilePath, outputFolderPath, format) => {
    return new Promise((resolve, reject) => {
      const outputFileName = `${path.parse(inputFilePath).name}.${format}`;
      const outputFilePath = path.join(outputFolderPath, outputFileName);

      ffmpeg(inputFilePath)
        .toFormat(format)
        .on('end', () => resolve(outputFilePath))
        .on('error', (err) => reject(err))
        .save(outputFilePath);
    });
  });

  ipcMain.handle('read-file-as-base64', async (event, filePath) => {
    try {
      const data = await fs.promises.readFile(filePath, { encoding: 'base64' });
      return data;
    } catch (error) {
      console.error('Error reading file as Base64:', error);
      throw error;
    }
  });

  ipcMain.handle('save-base64-as-file', async (event, base64Data, outputPath) => {
    try {
      const buffer = Buffer.from(base64Data, 'base64');
      await fs.promises.writeFile(outputPath, buffer);
      return outputPath;
    } catch (error) {
      console.error('Error saving Base64 as file:', error);
      throw error;
    }
  });
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});