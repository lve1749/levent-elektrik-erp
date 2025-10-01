'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download, ArrowUpCircle, ChevronUp } from 'lucide-react';
import { useSidebar } from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

export function SidebarUpdateCard() {
  const { state } = useSidebar();
  const [isExpanded, setIsExpanded] = useState(true);
  const [currentVersion, setCurrentVersion] = useState('');
  const [latestVersion, setLatestVersion] = useState('');
  const [isUpdateAvailable, setIsUpdateAvailable] = useState(false);
  
  useEffect(() => {
    // Version karşılaştırma fonksiyonu
    const compareVersions = (v1: string, v2: string) => {
      const parts1 = v1.split('.').map(Number);
      const parts2 = v2.split('.').map(Number);
      
      for (let i = 0; i < 3; i++) {
        if (parts1[i] > parts2[i]) return 1;
        if (parts1[i] < parts2[i]) return -1;
      }
      return 0;
    };

    // Mevcut version'u al (Electron'dan)
    const getCurrentVersion = async () => {
      if (typeof window !== 'undefined' && (window as any).electron) {
        try {
          // appVersion artık async bir fonksiyon
          const version = await (window as any).electron.appVersion();
          return version || '1.0.0';
        } catch (error) {
          console.error('Version alma hatası:', error);
          return '1.0.0';
        }
      }
      // Development ortamında package.json'dan al
      return process.env.NEXT_PUBLIC_VERSION || '1.0.0';
    };
    
    // GitHub'dan son version'u kontrol et
    const checkLatestVersion = async () => {
      try {
        const response = await fetch('https://api.github.com/repos/lve1749/levent-elektrik-releases/releases/latest');
        const data = await response.json();
        const latest = data.tag_name?.replace('v', '') || '1.0.0';
        
        const current = await getCurrentVersion();
        setCurrentVersion(current);
        setLatestVersion(latest);
        
        // Düzgün version karşılaştırması
        if (compareVersions(latest, current) > 0) {
          setIsUpdateAvailable(true);
        }
      } catch (error) {
        console.error('Version kontrol hatası:', error);
      }
    };
    
    checkLatestVersion();
    // Her 30 dakikada bir kontrol et
    const interval = setInterval(checkLatestVersion, 30 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);
  
  if (!isUpdateAvailable) return null;
  
  const handleDownload = () => {
    // GitHub releases sayfasını aç
    window.open('https://github.com/lve1749/levent-elektrik-releases/releases', '_blank');
  };
  
  // Collapsed state - sadece icon ve badge
  if (state === 'collapsed') {
    return (
      <div className="relative p-2">
        <Button
          size="icon"
          variant="ghost"
          className="relative w-full h-10"
          onClick={handleDownload}
          title={`Güncelleme mevcut: v${latestVersion}`}
        >
          <ArrowUpCircle className="h-5 w-5" />
          <span className="absolute -top-1 -right-1 h-3 w-3 bg-green-500 rounded-full animate-pulse" />
        </Button>
      </div>
    );
  }
  
  // Main card
  return (
    <div className="px-0.5 pb-2">
      <div className="relative rounded-lg border border-[oklch(0.90_0.00_0_/_0.5)] dark:border-[oklch(0.27_0.00_0_/_0.5)] bg-[oklch(0.99_0.00_0)] dark:bg-[oklch(0.14_0.00_0)] overflow-hidden">
        {/* Header - Always visible */}
        <div className="px-3 py-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ArrowUpCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
              <span className="text-xs font-medium text-[oklch(0.40_0.00_0)] dark:text-[oklch(0.72_0.00_0)]">
                Güncelleme Mevcut
              </span>
            </div>
            {/* Toggle button */}
            <Button
              size="icon"
              variant="ghost"
              className="h-5 w-5 p-0 hover:bg-transparent"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              <motion.div
                animate={{ rotate: isExpanded ? 0 : -180 }}
                transition={{ duration: 0.2, ease: "easeInOut" }}
              >
                <ChevronUp className="h-3 w-3" />
              </motion.div>
            </Button>
          </div>
        </div>
        
        {/* Expandable content */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
              style={{ overflow: "hidden" }}
            >
              <div className="border-t border-[oklch(0.90_0.00_0_/_0.3)] dark:border-[oklch(0.27_0.00_0_/_0.3)]" />
              <div className="px-3 pt-2.5 pb-3 space-y-2.5">
                <div className="text-[10px] space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="text-[oklch(0.50_0.00_0)] dark:text-[oklch(0.62_0.00_0)]">Mevcut:</span>
                    <span className="font-mono text-[oklch(0.40_0.00_0)] dark:text-[oklch(0.72_0.00_0)]">v{currentVersion}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[oklch(0.50_0.00_0)] dark:text-[oklch(0.62_0.00_0)]">Yeni:</span>
                    <span className="font-mono text-green-600 dark:text-green-400">v{latestVersion}</span>
                  </div>
                </div>
              
                <div className="relative rounded-md p-[1px] bg-gradient-to-r from-[oklch(0.71_0.14_255)] to-[oklch(0.97_0.00_0_/_0.3)] dark:from-[oklch(0.49_0.22_264)] dark:to-[oklch(0.20_0.00_0_/_0.3)]">
                  <Button
                    size="sm"
                    className="w-full h-8 text-xs bg-[oklch(0.97_0.00_0)] dark:bg-[oklch(0.20_0.00_0)] hover:bg-[oklch(0.98_0.00_0)] dark:hover:bg-[oklch(0.25_0.00_0)] text-[oklch(0.20_0.00_0)] dark:text-[oklch(0.97_0.00_0)] border-0 rounded-md"
                    onClick={handleDownload}
                  >
                    <Download className="h-3 w-3 mr-1 text-[oklch(0.20_0.00_0)] dark:text-[oklch(0.97_0.00_0)]" />
                    İndir
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}