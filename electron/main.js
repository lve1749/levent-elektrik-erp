const { app, BrowserWindow, Menu, dialog, ipcMain } = require('electron');
const path = require('path');
const { fork } = require('child_process');
const http = require('http');
const fs = require('fs');
const { initAutoUpdater } = require('./auto-updater');

let mainWindow;
let nextServer;

  // Production build'de NODE_ENV set edilmediği için alternatif kontrol
const isDev = process.env.NODE_ENV === 'development' || (!app.isPackaged && process.env.NODE_ENV !== 'production');
  const port = process.env.PORT || 3000;

  // Server'ın hazır olmasını bekle
  async function waitForServer(url, maxAttempts = 30) {
    try {
      console.log(`[INFO] Server bekleniyor: ${url}`);
    } catch {}
    
    for (let i = 0; i < maxAttempts; i++) {
      try {
        return new Promise((resolve, reject) => {
          const req = http.get(url, (res) => {
            // 200, 304, 307 (redirect) hepsini başarılı say
            if (res.statusCode === 200 || res.statusCode === 304 || res.statusCode === 307 || res.statusCode === 302) {
              try {
                console.log(`[SUCCESS] Server hazır! (Status: ${res.statusCode})`);
              } catch {}
              resolve(true);
            } else {
              reject(new Error(`Status: ${res.statusCode}`));
            }
            // Response'u tüket ki memory leak olmasın
            res.resume();
          });
          
          req.on('error', (err) => {
            if (i === maxAttempts - 1) {
              reject(err);
            } else {
              setTimeout(() => {
                waitForServer(url, maxAttempts - i - 1)
                  .then(resolve)
                  .catch(reject);
              }, 1000);
            }
          });
          
          req.on('socket', (socket) => {
            socket.setTimeout(5000);
            socket.on('timeout', () => {
              req.abort();
            });
          });
        });
      } catch (e) {
        try {
          console.log(`[RETRY] Deneme ${i + 1}/${maxAttempts}: Server henüz hazır değil`);
        } catch {}
        await new Promise(r => setTimeout(r, 1000));
      }
    }
    return false;
  }

  function createWindow() {
    mainWindow = new BrowserWindow({
      width: 1400,
      height: 900,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        webSecurity: false, // Development'ta cookie sorunlarını önler
        partition: 'persist:leventelektrik', // Session'ı saklar
        preload: path.join(__dirname, 'preload.js')
      },
      icon: process.platform === 'win32' 
        ? path.join(__dirname, '../public/icon.ico')
        : path.join(__dirname, '../public/icon.png'),
      show: false,
      title: 'Levent Elektrik'
    });

    mainWindow.once('ready-to-show', () => {
      mainWindow.show();
      if (isDev) {
        mainWindow.webContents.openDevTools();
      }
    });

    const url = `http://localhost:${port}`;

    // Server hazır olana kadar bekle
    waitForServer(url).then(() => {
      // Direkt login sayfasına git (redirect döngüsünü önler)
      const loginUrl = `${url}/login`;
      mainWindow.loadURL(loginUrl);
    }).catch((err) => {
      console.error('Server başlatılamadı:', err);
      app.quit();
    });

    mainWindow.on('closed', () => {
      mainWindow = null;
    });
  }

function startNextServer() {
    // Development modunda Next.js'i başlatma
    if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'development ') {
      console.log('[DEV] Next.js manuel başlatılmalı (npm run dev)');
      return;
    }
    
    // Sadece production/packaged durumda başlat
    if (!app.isPackaged) {
      console.log('[INFO] Packaged değil - Next.js manuel başlatılmalı');
      return;
    }
    
    // Production'da Next.js standalone build'i başlat
    console.log('[PROD] Next.js standalone server başlatılıyor...');
    
    // Standalone server.js path'ini belirle
    const standaloneServerPath = path.join(
      process.resourcesPath,
      'app',
      '.next',
      'standalone',
      'server.js'
    );
    
    // KRITIK: Dosya varlık kontrolü
    if (!fs.existsSync(standaloneServerPath)) {
      console.error('[FATAL] server.js bulunamadı:', standaloneServerPath);
      dialog.showErrorBox(
        'Uygulama Hatası', 
        `Server dosyası bulunamadı.\nBeklenen konum: ${standaloneServerPath}\n\nLütfen uygulamayı yeniden yükleyin.`
      );
      app.exit(1); // SONSUZ DÖNGÜYÜ ÖNLE - Uygulamadan çık
      return;
    }
    
    // Debug için path'i logla
    console.log('[DEBUG] Standalone server path:', standaloneServerPath);
    console.log('[DEBUG] Resource path:', process.resourcesPath);
    console.log('[DEBUG] Node executable:', process.execPath);
    
    // Environment variables
    const serverEnv = {
      ...process.env,
      PORT: port.toString(),
      HOSTNAME: '0.0.0.0', // Localhost sorunu olmasın
      NODE_ENV: 'production'
    };
    
    console.log('[DEBUG] Server PORT:', serverEnv.PORT);
    console.log('[DEBUG] Server HOSTNAME:', serverEnv.HOSTNAME);
    
    try {
      // fork() kullan - Node.js process'leri için daha iyi
      nextServer = fork(standaloneServerPath, [], {
        env: serverEnv,
        silent: true, // stdio: 'pipe' yerine
        cwd: path.join(process.resourcesPath, 'app', '.next', 'standalone'),
        detached: false
      });

      // Stdout handler - EPIPE hatalarını önle
      if (nextServer.stdout) {
        nextServer.stdout.on('data', (data) => {
          try {
            const message = data.toString().trim();
            if (message && !nextServer.killed) {
              console.log(`[Next.js]: ${message}`);
            }
          } catch (err) {
            // EPIPE hatalarını sessizce geç
            if (err.code !== 'EPIPE') {
              console.error('[Stream Error]:', err.message);
            }
          }
        });
        
        nextServer.stdout.on('error', (err) => {
          // Stream hatalarını yakala ama gösterme
          if (err.code !== 'EPIPE') {
            console.error('[Stdout Error]:', err.message);
          }
        });
      }

      // Stderr handler - EPIPE hatalarını önle
      if (nextServer.stderr) {
        nextServer.stderr.on('data', (data) => {
          try {
            const message = data.toString().trim();
            if (message && !nextServer.killed) {
              console.error(`[Next.js Error]: ${message}`);
            }
          } catch (err) {
            // EPIPE hatalarını sessizce geç
            if (err.code !== 'EPIPE') {
              console.error('[Stream Error]:', err.message);
            }
          }
        });
        
        nextServer.stderr.on('error', (err) => {
          // Stream hatalarını yakala ama gösterme
          if (err.code !== 'EPIPE') {
            console.error('[Stderr Error]:', err.message);
          }
        });
      }

      nextServer.on('error', (error) => {
        console.error('[FATAL] Next.js server başlatılamadı:', error);
        dialog.showErrorBox(
          'Server Hatası', 
          `Uygulama sunucusu başlatılamadı.\nHata: ${error.message}\n\nUygulama kapatılacak.`
        );
        app.exit(1); // SONSUZ DÖNGÜYÜ ÖNLE
      });

      nextServer.on('close', (code) => {
        console.log(`[INFO] Next.js server kapandı. Exit code: ${code}`);
        if (code !== 0 && code !== null) {
          console.error('[ERROR] Next.js anormal kapandı. Code:', code);
          if (app.isPackaged) {
            dialog.showErrorBox(
              'Server Kapandı', 
              `Sunucu beklenmedik şekilde kapandı.\nHata kodu: ${code}\n\nUygulama kapatılacak.`
            );
            app.exit(1); // SONSUZ DÖNGÜYÜ ÖNLE
          }
        }
      });
    } catch (error) {
      console.error('[FATAL] fork hatası:', error);
      dialog.showErrorBox(
        'Kritik Hata', 
        `Uygulama başlatılamadı: ${error.message}\n\nUygulama kapatılacak.`
      );
      app.exit(1); // SONSUZ DÖNGÜYÜ ÖNLE
    }
  }

// Single Instance Lock
const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  // Başka bir instance zaten çalışıyor
  console.log('[INFO] Uygulama zaten çalışıyor. Çıkılıyor...');
  app.quit();
} else {
  app.on('second-instance', () => {
    // Birisi ikinci instance açmaya çalıştı, mevcut pencereyi öne getir
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });

  app.whenReady().then(() => {
    // Native menüyü kaldır (File, Edit, View vs.)
    Menu.setApplicationMenu(null);
    
    startNextServer();

    // Server başlamasını bekle
    setTimeout(() => {
      createWindow();
      
      // Initialize auto-updater after window is created
      if (app.isPackaged) {
        initAutoUpdater(mainWindow);
      }
    }, 3000);
  });
}

  app.on('window-all-closed', () => {
    console.log('[INFO] Tüm pencereler kapatıldı');
    if (nextServer) {
      console.log('[INFO] Next.js server kapatılıyor...');
      nextServer.kill('SIGTERM'); // Graceful shutdown
      setTimeout(() => {
        if (nextServer && !nextServer.killed) {
          console.log('[WARN] Next.js zorla kapatılıyor...');
          nextServer.kill('SIGKILL'); // Force kill
        }
      }, 5000);
    }
    if (process.platform !== 'darwin') {
      app.quit();
    }
  });

  app.on('before-quit', (event) => {
    console.log('[INFO] Uygulama kapatılıyor...');
    if (nextServer && !nextServer.killed) {
      event.preventDefault();
      nextServer.kill('SIGTERM');
      setTimeout(() => {
        app.quit();
      }, 2000);
    }
  });

  process.on('SIGTERM', () => {
    if (nextServer) {
      nextServer.kill();
    }
    app.quit();
  });