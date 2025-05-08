let selectedFilePath = null;

document.getElementById('chooseBtn').addEventListener('click', async () => {
  const filePath = await window.api.openFile();
  if (filePath) {
    selectedFilePath = filePath;
    document.getElementById('fileName').textContent = filePath;
    console.log('[renderer] File selected:', filePath);
  }
});

document.getElementById('transcribeBtn').addEventListener('click', async () => {
  if (!selectedFilePath) {
    alert('Please choose a file first');
    return;
  }

  const filePath = selectedFilePath;
  const outDir = filePath.substring(0, filePath.lastIndexOf('\\'));

  const result = await window.api.extractAudio(filePath, outDir);

  if (typeof result === 'string') {
    document.getElementById('output').textContent = `Audio extracted:\n${result}`;
  } else {
    alert('Error:\n' + result.error);
  }
});
