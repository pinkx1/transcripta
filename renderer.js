let selectedFilePath = null;

const progressEl = document.getElementById('progress');
const transcribeBtn = document.getElementById('transcribeBtn');
const outputEl = document.getElementById('output');

document.getElementById('chooseBtn').addEventListener('click', async () => {
  const filePath = await window.api.openFile();
  if (filePath) {
    selectedFilePath = filePath;
    document.getElementById('fileName').textContent = filePath;
    console.log('[renderer] File selected:', filePath);
  }
});

transcribeBtn.addEventListener('click', async () => {
  if (!selectedFilePath) {
    alert('Please choose a file first');
    return;
  }

  progressEl.style.display = 'block';
  transcribeBtn.disabled = true;
  outputEl.textContent = '';

  try {
    const filePath = selectedFilePath;
    const outDir = filePath.substring(0, filePath.lastIndexOf('\\'));

    console.log('[renderer] Starting transcription...');
    const language = document.getElementById('language').value;
    const result = await window.api.extractAudio(filePath, outDir, language);
    
    if (typeof result === 'string') {
      outputEl.textContent = result;
      saveBtn.style.display = 'inline-block';
          } else {
      alert('Error:\n' + result.error);
    }
  } catch (err) {
    alert('Unexpected error:\n' + err.message);
  } finally {
    progressEl.style.display = 'none';
    transcribeBtn.disabled = false;
  }
});

const saveBtn = document.getElementById('saveBtn');

saveBtn.addEventListener('click', async () => {
  const text = document.getElementById('output').textContent;
  const result = await window.api.saveText(text);

  if (result.success) {
    alert('File saved successfully!');
  }
});
