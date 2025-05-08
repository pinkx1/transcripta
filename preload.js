const { contextBridge, ipcRenderer } = require('electron');

console.log('[preload] preload loaded')

contextBridge.exposeInMainWorld('api', {
  extractAudio: (filePath, outDir) =>
    ipcRenderer.invoke('extract-audio', filePath, outDir),
  openFile: () => ipcRenderer.invoke('open-file')
});
