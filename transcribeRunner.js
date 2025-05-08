const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

function runTranscription(audioPath) {
  const exePath = path.join(__dirname, 'whisper', 'whisper-cli.exe');
  const modelPath = path.join(__dirname, 'whisper', 'ggml-base.bin');

  const command = `"${exePath}" -f "${audioPath}" -m "${modelPath}" -otxt -l en`;
  console.log('[transcribe] Running command:', command);

  return new Promise((resolve, reject) => {
    exec(command, async (error, stdout, stderr) => {
      console.log('[transcribe] stdout:\n', stdout);
      console.log('[transcribe] stderr:\n', stderr);

      if (error) {
        reject(`Whisper error: ${stderr}`);
        return;
      }

      const txtPath = `${audioPath}.txt`;

      try {
        const text = await fs.promises.readFile(txtPath, 'utf-8');
        await fs.promises.unlink(audioPath);
        await fs.promises.unlink(txtPath);
        resolve(text);
      } catch (err) {
        reject('Error reading or cleaning up transcription files:\n' + err.message);
      }
    });
  });
}

module.exports = { runTranscription };
