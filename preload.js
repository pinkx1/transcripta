const { contextBridge, ipcRenderer } = require('electron');

console.log('[preload] preload loaded');

contextBridge.exposeInMainWorld('api', {
  openFile: () => ipcRenderer.invoke('open-file'),
  extractAudio: (filePath, outDir) => ipcRenderer.invoke('extract-audio', filePath, outDir),
  saveText: (text) => ipcRenderer.invoke('save-text', text)
});
