const { exec } = require('child_process');
const path = require('path');

function runTranscription(audioPath) {
  const exePath = path.join(__dirname, 'whisper', 'whisper-cli.exe');
  const modelPath = path.join(__dirname, 'whisper', 'ggml-base.bin');

  // Язык — английский (en). Хочешь русский — поменяй на 'ru'
  const command = `"${exePath}" -f "${audioPath}" -m "${modelPath}" -otxt -l en`;

  console.log('[transcribe] Running command:', command);

  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error('[transcribe] Whisper error:', stderr);
        reject(`Whisper error: ${stderr}`);
      } else {
        console.log('[transcribe] Whisper success:', stdout);
        const txtPath = audioPath.replace(/\.\w+$/, '.txt');
        resolve(txtPath);
      }
    });
  });
}

module.exports = { runTranscription };
