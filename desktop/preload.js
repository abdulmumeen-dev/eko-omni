// desktop/preload.js
const { contextBridge } = require('electron');

// Expose safe APIs to the renderer
contextBridge.exposeInMainWorld('electronAPI', {
    platform: process.platform,
    version: process.version,
    restart: () => {
        require('electron').ipcRenderer.send('restart');
    }
});
