'use client'

import { useEffect, useState } from 'react'
import { Minus, Square, X } from 'lucide-react'
import { useTheme } from 'next-themes'

export function TitleBar() {
  const [isMaximized, setIsMaximized] = useState(false)
  const [isElectron, setIsElectron] = useState(false)
  const { theme } = useTheme()

  useEffect(() => {
    // Electron ortamında olup olmadığını kontrol et
    const checkElectron = typeof window !== 'undefined' && window.electronAPI
    setIsElectron(checkElectron)
    
    // İlk yüklemede pencere durumunu kontrol et
    if (checkElectron && window.electronAPI) {
      window.electronAPI.isMaximized().then(setIsMaximized)
      
      // Pencere durumu değişikliklerini dinle
      window.electronAPI.onWindowMaximized(() => setIsMaximized(true))
      window.electronAPI.onWindowUnmaximized(() => setIsMaximized(false))
    }
  }, [])

  // Electron ortamında değilse title bar gösterme
  if (!isElectron) {
    return null
  }

  const handleMinimize = () => {
    if (window.electronAPI) {
      window.electronAPI.minimizeWindow()
    }
  }

  const handleMaximize = () => {
    if (window.electronAPI) {
      window.electronAPI.maximizeWindow()
    }
  }

  const handleClose = () => {
    if (window.electronAPI) {
      window.electronAPI.closeWindow()
    }
  }

  return (
    <div className="fixed top-0 left-0 right-0 z-[100] h-8 bg-[oklch(0.97_0.00_0)] dark:bg-[oklch(0.20_0.00_0)] border-b border-[oklch(0.90_0_0)] dark:border-[oklch(0.25_0_0)] flex items-center justify-between select-none app-drag">
      {/* Sol taraf - Logo ve uygulama adı */}
      <div className="flex items-center gap-2 px-3 h-full">
        <div className="w-4 h-4 bg-gradient-to-br from-[oklch(0.20_0.00_0)] to-[oklch(0.40_0.00_0)] dark:from-[oklch(0.80_0.00_0)] dark:to-[oklch(0.97_0.00_0)] rounded-sm" />
        <span className="text-xs font-medium text-[oklch(0.20_0_0)] dark:text-[oklch(0.97_0_0)]">
          Levent Elektrik - Stok Yönetimi
        </span>
      </div>

      {/* Sağ taraf - Pencere kontrolleri */}
      <div className="flex h-full app-no-drag">
        <button
          onClick={handleMinimize}
          className="px-4 h-full hover:bg-[oklch(0.92_0.00_0)] dark:hover:bg-[oklch(0.25_0.00_0)] transition-colors flex items-center justify-center"
          title="Simge Durumuna Küçült"
        >
          <Minus className="w-3.5 h-3.5 text-[oklch(0.20_0.00_0)] dark:text-[oklch(0.97_0.00_0)]" />
        </button>
        
        <button
          onClick={handleMaximize}
          className="px-4 h-full hover:bg-[oklch(0.92_0.00_0)] dark:hover:bg-[oklch(0.25_0.00_0)] transition-colors flex items-center justify-center"
          title={isMaximized ? "Küçült" : "Büyüt"}
        >
          <Square className="w-3 h-3 text-[oklch(0.20_0.00_0)] dark:text-[oklch(0.97_0.00_0)]" />
        </button>
        
        <button
          onClick={handleClose}
          className="px-4 h-full hover:bg-[oklch(0.577_0.245_27.325)] transition-colors flex items-center justify-center group"
          title="Kapat"
        >
          <X className="w-3.5 h-3.5 text-[oklch(0.20_0.00_0)] dark:text-[oklch(0.97_0.00_0)] group-hover:text-white" />
        </button>
      </div>
    </div>
  )
}