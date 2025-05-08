const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const { exec } = require('child_process');
const { runTranscription } = require('./transcribeRunner');
const fs = require('fs');


function createWindow() {
  const win = new BrowserWindow({
    width: 800,
    height: 700,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false
    }
  });

  win.loadFile('index.html');
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

ipcMain.handle('extract-audio', async (event, filePath, outDir, language = 'en') => {
  console.log('[extract-audio] Received:', filePath);

  const ext = path.extname(filePath);
  const base = path.basename(filePath, ext);
  const outputDir = path.join(__dirname, 'temp');
  const outputPath = path.join(outputDir, `transcript_${base}.wav`);

  const command = `ffmpeg -i "${filePath}" -ar 16000 -ac 1 -c:a pcm_s16le "${outputPath}"`;
  console.log('[extract-audio] Running command:', command);

  try {
    await new Promise((resolve, reject) => {
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir);
      }
      exec(command, (error, stdout, stderr) => {
        console.log('[extract-audio] ffmpeg stdout:', stdout);
        console.log('[extract-audio] ffmpeg stderr:', stderr);

        if (error) {
          console.error('[extract-audio] ffmpeg error:', error);
          reject(`Error extracting audio: ${stderr}`);
        } else {
          console.log('[extract-audio] Success! Output:', outputPath);
          resolve();
        }
      });
    });

    const transcriptionText = await runTranscription(outputPath, language);
    return transcriptionText;

  } catch (err) {
    console.error('[extract-audio] Error:', err);
    return { error: err };
  }
});


ipcMain.handle('open-file', async () => {
  const result = await dialog.showOpenDialog({
    properties: ['openFile'],
    filters: [
      { name: 'Audio/Video Files', extensions: ['mp3', 'wav', 'mp4', 'm4a', 'ogg', 'webm'] }
    ]
  });

  if (result.canceled || result.filePaths.length === 0) {
    return null;
  }

  return result.filePaths[0];
});

ipcMain.handle('save-text', async (event, text) => {
  const { canceled, filePath } = await dialog.showSaveDialog({
    title: 'Save Transcription As',
    defaultPath: `transcript_${new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-')}.txt`,
    filters: [{ name: 'Text Files', extensions: ['txt'] }]
  });

  if (!canceled && filePath) {
    await fs.promises.writeFile(filePath, text, 'utf-8');
    return { success: true };
  }

  return { canceled: true };
});
