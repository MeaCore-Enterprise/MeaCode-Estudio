const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('appBridge', {
  getInfo: () => ipcRenderer.invoke('app:getInfo'),
  runJS: (code) => ipcRenderer.invoke('app:runJS', String(code ?? ''))
});
