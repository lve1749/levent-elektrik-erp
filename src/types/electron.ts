export interface DBConfig {
  server: string;
  database: string;
  user?: string;
  password?: string;
  port?: number;
  trustServerCertificate?: boolean;
  encrypt?: boolean;
  integratedSecurity?: boolean;
}

interface ElectronAPI {
  appVersion: () => Promise<string>;
  platform: string;
  checkForUpdates: () => Promise<boolean>;
  downloadUpdate: () => Promise<void>;
  installUpdate: () => Promise<void>;
  onUpdateAvailable: (callback: (info: any) => void) => void;
  onUpdateDownloaded: (callback: (info: any) => void) => void;
  onDownloadProgress: (callback: (info: any) => void) => void;
}

declare global {
  interface Window {
    electron: ElectronAPI;
  }
}