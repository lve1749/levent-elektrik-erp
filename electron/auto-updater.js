const { autoUpdater } = require('electron-updater');
const { app, dialog, BrowserWindow, ipcMain } = require('electron');
const log = require('electron-log');
const path = require('path');

// Configure logging
log.transports.file.level = 'info';
autoUpdater.logger = log;
autoUpdater.logger.transports.file.level = 'info';

// Disable auto download - user must confirm
autoUpdater.autoDownload = false;
autoUpdater.autoInstallOnAppQuit = true;

let mainWindow = null;
let updateInfo = null;

// Set feed URL for GitHub releases
if (!app.isPackaged) {
  // Development mode - disable auto-updater
  autoUpdater.updateConfigPath = path.join(__dirname, 'dev-app-update.yml');
}

function setMainWindow(window) {
  mainWindow = window;
}

// Send status to renderer
function sendStatusToWindow(text, data = {}) {
  log.info(text);
  if (mainWindow) {
    mainWindow.webContents.send('update-status', { message: text, ...data });
  }
}

// Auto-updater event handlers
autoUpdater.on('checking-for-update', () => {
  sendStatusToWindow('Güncellemeler kontrol ediliyor...');
});

autoUpdater.on('update-available', (info) => {
  updateInfo = info;
  sendStatusToWindow('Güncelleme mevcut', {
    updateAvailable: true,
    version: info.version,
    releaseNotes: info.releaseNotes,
    releaseName: info.releaseName,
    releaseDate: info.releaseDate
  });
  
  // Show dialog to user
  const dialogOpts = {
    type: 'info',
    buttons: ['İndir', 'Daha Sonra'],
    title: 'Güncelleme Mevcut',
    message: `Yeni Sürüm: ${info.version}`,
    detail: `Mevcut sürüm: ${app.getVersion()}\nYeni sürüm: ${info.version}\n\nGüncellemeyi indirmek ister misiniz?`,
    defaultId: 0,
    cancelId: 1
  };

  dialog.showMessageBox(mainWindow, dialogOpts).then((result) => {
    if (result.response === 0) {
      autoUpdater.downloadUpdate();
      sendStatusToWindow('Güncelleme indiriliyor...', { downloading: true });
    }
  });
});

autoUpdater.on('update-not-available', () => {
  sendStatusToWindow('Güncelleme yok', {
    updateAvailable: false,
    message: 'Uygulama güncel'
  });
});

autoUpdater.on('error', (err) => {
  sendStatusToWindow('Güncelleme hatası: ' + err, {
    error: true,
    errorMessage: err.toString()
  });
});

autoUpdater.on('download-progress', (progressObj) => {
  let log_message = `İndirme hızı: ${Math.round(progressObj.bytesPerSecond / 1024)} KB/s`;
  log_message = log_message + ' - İndirilen: ' + Math.round(progressObj.percent) + '%';
  log_message = log_message + ` (${Math.round(progressObj.transferred / (1024 * 1024))}MB / ${Math.round(progressObj.total / (1024 * 1024))}MB)`;
  
  sendStatusToWindow(log_message, {
    downloading: true,
    percent: progressObj.percent,
    bytesPerSecond: progressObj.bytesPerSecond,
    transferred: progressObj.transferred,
    total: progressObj.total
  });
});

autoUpdater.on('update-downloaded', (info) => {
  sendStatusToWindow('Güncelleme indirildi', {
    downloaded: true,
    version: info.version
  });
  
  const dialogOpts = {
    type: 'info',
    buttons: ['Şimdi Yeniden Başlat', 'Daha Sonra'],
    title: 'Güncelleme İndirildi',
    message: 'Güncelleme hazır',
    detail: 'Güncelleme indirildi. Uygulamayı yeniden başlatmak ve güncellemeyi yüklemek ister misiniz?',
    defaultId: 0,
    cancelId: 1
  };

  dialog.showMessageBox(mainWindow, dialogOpts).then((result) => {
    if (result.response === 0) {
      autoUpdater.quitAndInstall(false, true);
    }
  });
});

// IPC handlers for renderer process
ipcMain.handle('check-for-updates', async () => {
  try {
    const result = await autoUpdater.checkForUpdatesAndNotify();
    return { success: true, result };
  } catch (error) {
    log.error('Update check error:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('download-update', async () => {
  try {
    await autoUpdater.downloadUpdate();
    return { success: true };
  } catch (error) {
    log.error('Download error:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('quit-and-install', () => {
  autoUpdater.quitAndInstall(false, true);
});

ipcMain.handle('get-current-version', () => {
  return app.getVersion();
});

ipcMain.handle('get-update-info', () => {
  return updateInfo;
});

// Initialize auto-updater
function initAutoUpdater(window) {
  setMainWindow(window);
  
  // Token gerekmez, public repo kullanıyoruz
  // GitHub public releases otomatik olarak electron-updater tarafından bulunur
  
  // Check for updates immediately on app start
  setTimeout(() => {
    if (app.isPackaged) {
      autoUpdater.checkForUpdatesAndNotify().catch(err => {
        log.error('Initial update check failed:', err);
      });
    }
  }, 3000);
  
  // Check for updates every hour
  setInterval(() => {
    if (app.isPackaged) {
      autoUpdater.checkForUpdatesAndNotify().catch(err => {
        log.error('Periodic update check failed:', err);
      });
    }
  }, 60 * 60 * 1000);
}

module.exports = {
  initAutoUpdater,
  autoUpdater
};