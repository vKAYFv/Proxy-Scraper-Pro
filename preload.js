const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  startScrape: () => ipcRenderer.send('start-scrape'),
  onProgress: (callback) => ipcRenderer.on('scrape-progress', callback),
  onComplete: (callback) => ipcRenderer.on('scrape-complete', callback),
  minimize: () => ipcRenderer.send('minimize-window'),
  maximize: () => ipcRenderer.send('maximize-window'),
  close: () => ipcRenderer.send('close-window')
});