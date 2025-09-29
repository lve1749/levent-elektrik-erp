const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electron', {
  ipcRenderer: {
    // Send messages
    send: (channel, data) => {
      const validChannels = [
        'update-status',
        'check-for-updates',
        'download-update',
        'quit-and-install'
      ];
      if (validChannels.includes(channel)) {
        ipcRenderer.send(channel, data);
      }
    },
    
    // Receive messages
    on: (channel, func) => {
      const validChannels = [
        'update-status',
        'update-available',
        'update-not-available',
        'update-downloaded',
        'download-progress',
        'update-error'
      ];
      if (validChannels.includes(channel)) {
        // Strip event as it includes `sender`
        ipcRenderer.on(channel, (event, ...args) => func(event, ...args));
      }
    },
    
    // Remove listener
    removeListener: (channel, func) => {
      const validChannels = [
        'update-status',
        'update-available',
        'update-not-available',
        'update-downloaded',
        'download-progress',
        'update-error'
      ];
      if (validChannels.includes(channel)) {
        ipcRenderer.removeListener(channel, func);
      }
    },
    
    // Remove all listeners
    removeAllListeners: (channel) => {
      const validChannels = [
        'update-status',
        'update-available',
        'update-not-available',
        'update-downloaded',
        'download-progress',
        'update-error'
      ];
      if (validChannels.includes(channel)) {
        ipcRenderer.removeAllListeners(channel);
      }
    },
    
    // Invoke with response
    invoke: async (channel, ...args) => {
      const validChannels = [
        'check-for-updates',
        'download-update',
        'quit-and-install',
        'get-current-version',
        'get-update-info'
      ];
      if (validChannels.includes(channel)) {
        return await ipcRenderer.invoke(channel, ...args);
      }
    }
  },
  
  // App info
  app: {
    getVersion: () => ipcRenderer.invoke('get-current-version'),
  },
  
  // Platform info
  platform: process.platform,
  arch: process.arch,
  isPackaged: () => ipcRenderer.invoke('is-packaged')
});