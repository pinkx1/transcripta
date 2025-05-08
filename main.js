const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const { exec } = require('child_process');
const { runTranscription } = require('./transcribeRunner');


function createWindow() {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
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

// FFmpeg + Whisper transcription
ipcMain.handle('extract-audio', async (event, filePath, outDir) => {
  console.log('[extract-audio] Received:', filePath, outDir);

  const ext = path.extname(filePath);
  const base = path.basename(filePath, ext);
  const outputPath = path.join(outDir, `${base}.wav`);

  const command = `ffmpeg -i "${filePath}" -ar 16000 -ac 1 -c:a pcm_s16le "${outputPath}"`;
  console.log('[extract-audio] Running command:', command);

  try {
    // Step 1: Extract audio
    await new Promise((resolve, reject) => {
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

    // Step 2: Run Whisper
    const txtPath = await runTranscription(outputPath);
    console.log('[extract-audio] Transcription complete:', txtPath);
    return txtPath;

  } catch (err) {
    console.error('[extract-audio] Error:', err);
    return { error: err };
  }
});

// Open file dialog
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
