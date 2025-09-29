"use client"

import { useEffect, useState } from 'react'
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { X } from "lucide-react"

interface ShortcutGroup {
  title: string
  shortcuts: {
    key: string
    description: string
    badge?: string
  }[]
}

export function ShortcutsDialog() {
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    const handleShowShortcuts = () => setIsOpen(true)
    window.addEventListener('showKeyboardShortcuts', handleShowShortcuts)
    return () => window.removeEventListener('showKeyboardShortcuts', handleShowShortcuts)
  }, [])

  useEffect(() => {
    if (isOpen) {
      const handleEsc = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          e.preventDefault()
          setIsOpen(false)
        }
      }
      window.addEventListener('keydown', handleEsc)
      return () => window.removeEventListener('keydown', handleEsc)
    }
  }, [isOpen])

  const shortcutGroups: ShortcutGroup[] = [
    {
      title: "Navigasyon",
      shortcuts: [
        { key: "Alt + D", description: "Stok Analiz sayfasına git" },
        { key: "Alt + L", description: "Listelere git" },
        { key: "Alt + A", description: "Arşive git" },
        { key: "Alt + S", description: "Siparişlere git" },
      ]
    },
    {
      title: "İşlemler",
      shortcuts: [
        { key: "Ctrl + N", description: "Yeni öğe ekle" },
        { key: "Ctrl + E", description: "Düzenle" },
        { key: "Ctrl + D", description: "Sil" },
        { key: "Ctrl + R", description: "Yenile" },
        { key: "Ctrl + F", description: "Ara" },
      ]
    },
    {
      title: "Görünüm",
      shortcuts: [
        { key: "Alt + Shift + T", description: "Tema değiştir (Koyu/Açık)" },
        { key: "Alt + Shift + S", description: "Sidebar aç/kapat" },
      ]
    },
    {
      title: "Genel",
      shortcuts: [
        { key: "Ctrl + K", description: "Komut paleti", badge: "Yeni" },
        { key: "Esc", description: "İptal/Kapat" },
      ]
    },
  ]

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
        onClick={() => setIsOpen(false)}
      />
      
      {/* Dialog Content */}
      <div className="fixed left-[50%] top-[50%] z-50 flex flex-col w-full max-w-2xl max-h-[85vh] translate-x-[-50%] translate-y-[-50%] bg-[oklch(0.99_0.00_0)] dark:bg-[oklch(0.20_0.00_0)] border border-[oklch(0.922_0_0)] dark:border-[oklch(0.238_0_0)] shadow-lg rounded-lg">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[oklch(0.922_0_0)] dark:border-[oklch(0.238_0_0)]">
          <h2 className="text-lg font-semibold text-[oklch(0.145_0_0)] dark:text-[oklch(0.985_0_0)]">Klavye Kısayolları</h2>
          <button
            onClick={() => setIsOpen(false)}
            className="rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Kapat</span>
          </button>
        </div>
        
        {/* Content with scrollbar */}
        <div className="overflow-y-auto flex-1 px-6 py-4 custom-scrollbar">
          <div className="space-y-6 pb-2">
            {shortcutGroups.map((group, index) => (
              <div key={group.title}>
                {index > 0 && <Separator className="mb-4" />}
                <div className="space-y-3">
                  <h3 className="text-sm font-medium text-[oklch(0.556_0_0)] dark:text-[oklch(0.703_0_0)]">{group.title}</h3>
                  <div className="space-y-2">
                    {group.shortcuts.map((shortcut) => (
                      <div key={shortcut.key} className="flex items-center justify-between py-1.5">
                        <span className="text-sm text-[oklch(0.145_0_0)] dark:text-[oklch(0.985_0_0)]">{shortcut.description}</span>
                        <div className="flex items-center gap-2">
                          <kbd className="pointer-events-none inline-flex h-6 select-none items-center gap-1 rounded bg-[oklch(0.97_0.00_0)] dark:bg-[oklch(0.238_0_0)] px-2 font-mono text-[11px] font-medium text-[oklch(0.556_0_0)] dark:text-[oklch(0.703_0_0)] border border-[oklch(0.922_0_0)] dark:border-[oklch(0.27_0.00_0)]">
                            {shortcut.key.split(' + ').map((part, i) => (
                              <span key={i}>
                                {i > 0 && <span className="text-[10px]">+</span>}
                                {part}
                              </span>
                            ))}
                          </kbd>
                          {shortcut.badge && (
                            <Badge variant="secondary" className="h-5 px-1.5 text-[10px]">
                              {shortcut.badge}
                            </Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Footer */}
        <div className="flex items-center justify-between border-t border-[oklch(0.922_0_0)] dark:border-[oklch(0.238_0_0)] px-6 py-3 mt-auto">
          <p className="text-xs text-[oklch(0.556_0_0)] dark:text-[oklch(0.703_0_0)]">
            İpucu: Komut paletini açmak için <kbd className="ml-1 inline-flex h-5 items-center rounded bg-[oklch(0.97_0.00_0)] dark:bg-[oklch(0.238_0_0)] px-1.5 font-mono text-[10px]">Ctrl+K</kbd> kullanın
          </p>
          <button
            onClick={() => setIsOpen(false)}
            className="text-xs text-[oklch(0.556_0_0)] dark:text-[oklch(0.703_0_0)] hover:text-[oklch(0.145_0_0)] dark:hover:text-[oklch(0.985_0_0)] transition-colors"
          >
            Kapat (Esc)
          </button>
        </div>
      </div>
    </>
  )
}