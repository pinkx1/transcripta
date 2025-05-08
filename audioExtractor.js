const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');

function extractAudio(inputPath, outputDir) {
  const ext = path.extname(inputPath);
  const base = path.basename(inputPath, ext);
  const outputPath = path.join(outputDir, `${base}.wav`);

  return new Promise((resolve, reject) => {
    const command = `ffmpeg -i "${inputPath}" -ar 16000 -ac 1 -c:a pcm_s16le "${outputPath}"`;

    exec(command, (error, stdout, stderr) => {
      if (error) {
        reject(`Error extracting audio: ${stderr}`);
      } else {
        resolve(outputPath);
      }
    });
  });
}

module.exports = { extractAudio };
