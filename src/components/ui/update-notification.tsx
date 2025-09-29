'use client';

import React, { useState, useEffect } from 'react';
import { X, Download, RefreshCw, AlertCircle, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

interface UpdateStatus {
  message: string;
  updateAvailable?: boolean;
  downloading?: boolean;
  downloaded?: boolean;
  error?: boolean;
  errorMessage?: string;
  percent?: number;
  version?: string;
  releaseNotes?: string;
  releaseName?: string;
  releaseDate?: string;
}

export function UpdateNotification() {
  const [updateStatus, setUpdateStatus] = useState<UpdateStatus | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [currentVersion, setCurrentVersion] = useState<string>('');

  useEffect(() => {
    // Only run in Electron environment
    if (typeof window !== 'undefined' && window.electron) {
      // Get current version
      window.electron.ipcRenderer.invoke('get-current-version').then((version: string) => {
        setCurrentVersion(version);
      });

      // Listen for update events
      const handleUpdateStatus = (event: any, status: UpdateStatus) => {
        console.log('Update status received:', status);
        setUpdateStatus(status);
        
        // Show notification if update is available, downloading, or downloaded
        if (status.updateAvailable || status.downloading || status.downloaded) {
          setIsVisible(true);
          setIsMinimized(false);
        }
        
        // Auto-hide error messages after 10 seconds
        if (status.error) {
          setIsVisible(true);
          setTimeout(() => {
            setIsVisible(false);
          }, 10000);
        }
      };

      window.electron.ipcRenderer.on('update-status', handleUpdateStatus);

      // Check for updates on component mount
      window.electron.ipcRenderer.invoke('check-for-updates');

      return () => {
        window.electron.ipcRenderer.removeListener('update-status', handleUpdateStatus);
      };
    }
  }, []);

  const handleDownload = () => {
    if (window.electron) {
      window.electron.ipcRenderer.invoke('download-update');
    }
  };

  const handleInstall = () => {
    if (window.electron) {
      window.electron.ipcRenderer.invoke('quit-and-install');
    }
  };

  const handleCheckForUpdates = () => {
    if (window.electron) {
      window.electron.ipcRenderer.invoke('check-for-updates');
      setUpdateStatus({ message: 'Güncellemeler kontrol ediliyor...' });
      setIsVisible(true);
    }
  };

  const handleClose = () => {
    setIsVisible(false);
    setUpdateStatus(null);
  };

  const handleMinimize = () => {
    setIsMinimized(!isMinimized);
  };

  // Don't render in non-Electron environment
  if (typeof window === 'undefined' || !window.electron) {
    return null;
  }

  if (!isVisible) {
    return (
      <Button
        onClick={handleCheckForUpdates}
        size="sm"
        variant="ghost"
        className="fixed bottom-4 right-4 z-50"
        title="Güncellemeleri kontrol et"
      >
        <RefreshCw className="h-4 w-4" />
      </Button>
    );
  }

  return (
    <div
      className={cn(
        "fixed bottom-4 right-4 z-50 w-96 bg-background border rounded-lg shadow-lg transition-all duration-300",
        isMinimized ? "h-12" : "h-auto"
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b">
        <div className="flex items-center gap-2">
          {updateStatus?.error && <AlertCircle className="h-4 w-4 text-destructive" />}
          {updateStatus?.downloaded && <CheckCircle className="h-4 w-4 text-green-500" />}
          {updateStatus?.downloading && <Download className="h-4 w-4 text-primary animate-pulse" />}
          {updateStatus?.updateAvailable && !updateStatus?.downloading && !updateStatus?.downloaded && 
            <AlertCircle className="h-4 w-4 text-yellow-500" />
          }
          <span className="font-semibold text-sm">
            {updateStatus?.error && 'Güncelleme Hatası'}
            {updateStatus?.downloaded && 'Güncelleme Hazır'}
            {updateStatus?.downloading && 'Güncelleme İndiriliyor'}
            {updateStatus?.updateAvailable && !updateStatus?.downloading && !updateStatus?.downloaded && 
              'Güncelleme Mevcut'
            }
            {!updateStatus?.updateAvailable && !updateStatus?.error && !updateStatus?.downloading && 
              !updateStatus?.downloaded && 'Güncelleme Kontrolü'
            }
          </span>
        </div>
        <div className="flex items-center gap-1">
          <Button
            onClick={handleMinimize}
            size="icon"
            variant="ghost"
            className="h-6 w-6"
          >
            <span className="text-xs">{isMinimized ? '▲' : '▼'}</span>
          </Button>
          <Button
            onClick={handleClose}
            size="icon"
            variant="ghost"
            className="h-6 w-6"
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      </div>

      {/* Content */}
      {!isMinimized && (
        <div className="p-4 space-y-3">
          {/* Version Info */}
          {updateStatus?.version && (
            <div className="text-sm space-y-1">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Mevcut Sürüm:</span>
                <span className="font-mono">{currentVersion}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Yeni Sürüm:</span>
                <span className="font-mono text-primary">{updateStatus.version}</span>
              </div>
            </div>
          )}

          {/* Error Message */}
          {updateStatus?.error && updateStatus?.errorMessage && (
            <div className="text-sm text-destructive bg-destructive/10 p-2 rounded">
              {updateStatus.errorMessage}
            </div>
          )}

          {/* Status Message */}
          {updateStatus?.message && !updateStatus?.error && (
            <div className="text-sm text-muted-foreground">
              {updateStatus.message}
            </div>
          )}

          {/* Download Progress */}
          {updateStatus?.downloading && updateStatus?.percent !== undefined && (
            <div className="space-y-2">
              <Progress value={updateStatus.percent} className="h-2" />
              <div className="text-xs text-muted-foreground text-center">
                %{Math.round(updateStatus.percent)}
              </div>
            </div>
          )}

          {/* Release Notes */}
          {updateStatus?.releaseNotes && (
            <div className="text-sm space-y-1">
              <div className="font-semibold">Yenilikler:</div>
              <div className="text-muted-foreground text-xs max-h-32 overflow-y-auto">
                {updateStatus.releaseNotes}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2">
            {updateStatus?.updateAvailable && !updateStatus?.downloading && !updateStatus?.downloaded && (
              <>
                <Button onClick={handleDownload} size="sm" className="flex-1">
                  <Download className="h-4 w-4 mr-1" />
                  İndir
                </Button>
                <Button onClick={handleClose} size="sm" variant="outline" className="flex-1">
                  Daha Sonra
                </Button>
              </>
            )}

            {updateStatus?.downloaded && (
              <>
                <Button onClick={handleInstall} size="sm" className="flex-1">
                  <RefreshCw className="h-4 w-4 mr-1" />
                  Yeniden Başlat ve Yükle
                </Button>
                <Button onClick={handleClose} size="sm" variant="outline" className="flex-1">
                  Daha Sonra
                </Button>
              </>
            )}

            {!updateStatus?.updateAvailable && !updateStatus?.downloading && !updateStatus?.downloaded && 
             !updateStatus?.error && (
              <Button onClick={handleClose} size="sm" variant="outline" className="w-full">
                Kapat
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// Type declaration for window.electron
declare global {
  interface Window {
    electron?: {
      ipcRenderer: {
        on: (channel: string, listener: (event: any, ...args: any[]) => void) => void;
        removeListener: (channel: string, listener: (event: any, ...args: any[]) => void) => void;
        invoke: (channel: string, ...args: any[]) => Promise<any>;
      };
    };
  }
}