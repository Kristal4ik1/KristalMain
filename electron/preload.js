
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('kristalDesktop', {
  platform: process.platform,
  getVersion: () => ipcRenderer.invoke('app:getVersion'),
  window: {
      minimize: () => ipcRenderer.invoke('app:minimize'),
      maximize: () => ipcRenderer.invoke('app:maximize'),
      close: () => ipcRenderer.invoke('app:close'),
  }
});
