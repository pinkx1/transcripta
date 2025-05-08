const { contextBridge, ipcRenderer } = require('electron');

console.log('[preload] preload loaded');

contextBridge.exposeInMainWorld('api', {
  openFile: () => ipcRenderer.invoke('open-file'),
  extractAudio: (filePath, outDir, language) =>
    ipcRenderer.invoke('extract-audio', filePath, outDir, language),
    saveText: (text) => ipcRenderer.invoke('save-text', text)
});
