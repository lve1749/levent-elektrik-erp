import * as React from 'react'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { RotateCw, LoaderCircle, Check, CornerUpLeft, CornerUpRight, Search, Command } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { ModeToggle } from '@/components/mode-toggle'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'

interface HeaderProps {
  isRefreshing?: boolean
  onRefresh?: () => void
  currentPage?: string
  breadcrumbItems?: Array<{ label: string; href?: string }>
  actions?: React.ReactNode
}

export default function Header({ 
  isRefreshing = false, 
  onRefresh,
  currentPage = 'Stok Analiz',
  breadcrumbItems,
  actions
}: HeaderProps) {
  const [buttonState, setButtonState] = useState<'idle' | 'loading' | 'success'>('idle')
  const router = useRouter()
  
  const handleOpenCommandPalette = () => {
    window.dispatchEvent(new CustomEvent('openCommandPalette'))
  }
  
  // isRefreshing değiştiğinde button state'i güncelle
  useEffect(() => {
    if (isRefreshing) {
      setButtonState('loading')
    } else if (buttonState === 'loading') {
      // Yenileme tamamlandı, success göster
      setButtonState('success')
      // 3 saniye sonra idle'a dön
      const timer = setTimeout(() => {
        setButtonState('idle')
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [isRefreshing])
  
  const handleRefresh = () => {
    if (buttonState === 'idle' && onRefresh) {
      onRefresh()
    }
  }

  return (
    <header className="bg-[oklch(0.99_0.00_0)] dark:bg-[oklch(0.14_0.00_0)] border-b border-[oklch(0.92_0.00_0_/_0.5)] dark:border-[oklch(0.27_0.00_0_/_0.5)]">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Sol taraf - Sidebar toggle ve Breadcrumb */}
          <div className="flex items-center gap-2">
            <SidebarTrigger className="-ml-2 text-[oklch(0.20_0.00_0)] dark:text-[oklch(0.92_0.00_0)]" />
            <div className="h-4 w-px bg-[oklch(0.92_0.00_0)] dark:bg-zinc-700" />
            <Breadcrumb className="text-[oklch(0.20_0.00_0)] dark:text-[oklch(0.92_0.00_0)]">
              <BreadcrumbList>
                {breadcrumbItems ? (
                  breadcrumbItems.map((item, index) => (
                    <React.Fragment key={index}>
                      {index > 0 && <BreadcrumbSeparator />}
                      <BreadcrumbItem>
                        {item.href ? (
                          <BreadcrumbLink href={item.href} className="text-[oklch(0.20_0.00_0)] dark:text-[oklch(0.92_0.00_0)]">{item.label}</BreadcrumbLink>
                        ) : (
                          <BreadcrumbPage className="text-[oklch(0.20_0.00_0)] dark:text-[oklch(0.92_0.00_0)]">{item.label}</BreadcrumbPage>
                        )}
                      </BreadcrumbItem>
                    </React.Fragment>
                  ))
                ) : (
                  <BreadcrumbItem>
                    <BreadcrumbPage className="text-[oklch(0.20_0.00_0)] dark:text-[oklch(0.92_0.00_0)]">{currentPage}</BreadcrumbPage>
                  </BreadcrumbItem>
                )}
              </BreadcrumbList>
            </Breadcrumb>
          </div>

          {/* Orta kısım - Komut Paleti Arama Alanı */}
          <div className="flex-1 flex justify-center max-w-2xl mx-4">
            <div 
              className="relative group cursor-pointer w-full max-w-md"
              onClick={handleOpenCommandPalette}
            >
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[oklch(0.40_0.00_0)] dark:text-[oklch(0.72_0.00_0)] pointer-events-none" />
              <div className="flex items-center gap-2 h-[34px] pl-9 pr-2 w-full bg-[oklch(0.97_0.00_0)] hover:bg-[oklch(0.94_0.00_0)] dark:bg-[oklch(0.20_0.00_0)] dark:hover:bg-[oklch(0.14_0.00_0)] rounded-full border border-[oklch(0.92_0.00_0_/_0.5)] dark:border-[oklch(0.27_0.00_0_/_0.5)] transition-all duration-200">
                <span className="text-sm text-[oklch(0.40_0.00_0)] dark:text-[oklch(0.72_0.00_0)] flex-1">
                  <span className="hidden sm:inline">Komut ara...</span>
                  <span className="sm:hidden">Ara...</span>
                </span>
                <div className="flex items-center gap-0.5">
                  <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-0.5 rounded bg-[oklch(0.97_0.00_0)] dark:bg-[oklch(0.145_0_0)] border border-[oklch(0.92_0.00_0)] dark:border-[oklch(0.27_0.00_0)] px-1.5 font-mono text-[10px] font-medium text-[oklch(0.40_0.00_0)] dark:text-[oklch(0.72_0.00_0)]">
                    <span>Ctrl</span>
                  </kbd>
                  <kbd className="pointer-events-none inline-flex h-5 select-none items-center rounded bg-[oklch(0.97_0.00_0)] dark:bg-[oklch(0.145_0_0)] border border-[oklch(0.92_0.00_0)] dark:border-[oklch(0.27_0.00_0)] px-1.5 font-mono text-[10px] font-medium text-[oklch(0.40_0.00_0)] dark:text-[oklch(0.72_0.00_0)]">
                    K
                  </kbd>
                </div>
              </div>
            </div>
          </div>

          {/* Sağ taraf - Actions ve Refresh butonu */}
          <div className="flex items-center gap-3">
            {actions}
            
            {/* Navigasyon ve Yenile Butonları */}
            <div className="flex items-center rounded-full border border-[oklch(0.92_0.00_0_/_0.5)] dark:border-[oklch(0.27_0.00_0_/_0.5)] bg-[oklch(0.99_0.00_0)] dark:bg-[oklch(0.20_0.00_0)]">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => router.back()}
                      className="w-[34px] h-[34px] rounded-none rounded-l-full hover:bg-[oklch(0.95_0.00_0)] dark:hover:bg-[oklch(0.14_0.00_0)] transition-all duration-200 border-0"
                    >
                      <CornerUpLeft className="h-4 w-4 text-[oklch(0.40_0.00_0)] dark:text-[oklch(0.72_0.00_0)]" strokeWidth={2} />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent 
                    side="bottom" 
                    className="bg-[oklch(0.20_0.00_0)] text-[oklch(0.97_0.00_0)] border-[oklch(0.27_0.00_0)] dark:bg-[oklch(0.92_0.00_0)] dark:text-[oklch(0.20_0.00_0)] dark:border-[oklch(0.85_0.00_0)]"
                  >
                    <p className="text-xs font-medium">Geri</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              
              <div className="w-px h-5 bg-[oklch(0.92_0.00_0)] dark:bg-[oklch(0.27_0.00_0)]" />
              
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => router.forward()}
                      className="w-[34px] h-[34px] rounded-none hover:bg-[oklch(0.95_0.00_0)] dark:hover:bg-[oklch(0.14_0.00_0)] transition-all duration-200 border-0"
                    >
                      <CornerUpRight className="h-4 w-4 text-[oklch(0.40_0.00_0)] dark:text-[oklch(0.72_0.00_0)]" strokeWidth={2} />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent 
                    side="bottom" 
                    className="bg-[oklch(0.20_0.00_0)] text-[oklch(0.97_0.00_0)] border-[oklch(0.27_0.00_0)] dark:bg-[oklch(0.92_0.00_0)] dark:text-[oklch(0.20_0.00_0)] dark:border-[oklch(0.85_0.00_0)]"
                  >
                    <p className="text-xs font-medium">İleri</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              
              {onRefresh && (
                <>
                  <div className="w-px h-5 bg-[oklch(0.92_0.00_0)] dark:bg-[oklch(0.27_0.00_0)]" />
                  
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={handleRefresh}
                          disabled={buttonState !== 'idle'}
                          className="w-[34px] h-[34px] rounded-none rounded-r-full hover:bg-[oklch(0.95_0.00_0)] dark:hover:bg-[oklch(0.14_0.00_0)] transition-all duration-200 border-0"
                        >
                          <AnimatePresence mode="wait">
                            {buttonState === 'idle' && (
                              <motion.div
                                key="idle"
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.8 }}
                                transition={{
                                  duration: 0.25,
                                  ease: [0.4, 0, 0.2, 1]
                                }}
                                whileTap={{ 
                                  scale: 0.95 
                                }}
                              >
                                <RotateCw className="h-4 w-4 text-[oklch(0.40_0.00_0)] dark:text-[oklch(0.72_0.00_0)]" strokeWidth={2} />
                              </motion.div>
                            )}
                            
                            {buttonState === 'loading' && (
                              <motion.div
                                key="loading"
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1, rotate: 360 }}
                                exit={{ opacity: 0, scale: 0.8 }}
                                transition={{
                                  opacity: { duration: 0.25 },
                                  scale: { duration: 0.25 },
                                  rotate: {
                                    duration: 1.2,
                                    repeat: Infinity,
                                    ease: "linear"
                                  }
                                }}
                              >
                                <LoaderCircle className="h-4 w-4 text-[oklch(0.40_0.00_0)] dark:text-[oklch(0.72_0.00_0)]" strokeWidth={2} />
                              </motion.div>
                            )}
                            
                            {buttonState === 'success' && (
                              <motion.div
                                key="success"
                                initial={{ opacity: 0, scale: 0.5 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.8 }}
                                transition={{
                                  duration: 0.35,
                                  ease: [0.4, 0, 0.2, 1],
                                  scale: {
                                    type: "spring",
                                    damping: 12,
                                    stiffness: 300
                                  }
                                }}
                              >
                                <Check className="h-4 w-4 text-green-600 dark:text-green-500" strokeWidth={2} />
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent 
                        side="bottom" 
                        className="bg-[oklch(0.20_0.00_0)] text-[oklch(0.97_0.00_0)] border-[oklch(0.27_0.00_0)] dark:bg-[oklch(0.92_0.00_0)] dark:text-[oklch(0.20_0.00_0)] dark:border-[oklch(0.85_0.00_0)]"
                      >
                        <p className="text-xs font-medium">
                          {buttonState === 'idle' ? 'Yenile' : 
                           buttonState === 'loading' ? 'Güncelleniyor...' : 
                           'Güncellendi'}
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </>
              )}
            </div>
            
            {/* Refresh butonu - Eski kod kaldırıldı */}
            {false && onRefresh && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={handleRefresh}
                      disabled={buttonState !== 'idle'}
                      className="w-9 h-9 bg-[oklch(0.99_0.00_0)] hover:bg-[oklch(0.95_0.00_0)] text-[oklch(0.20_0.00_0)] border-[oklch(0.92_0.00_0)] dark:bg-[oklch(0.20_0.00_0)] dark:hover:bg-[oklch(0.14_0.00_0)] dark:text-[oklch(0.92_0.00_0)] dark:border-[oklch(0.27_0.00_0)] transition-all duration-200"
                    >
                      <AnimatePresence mode="wait">
                  {buttonState === 'idle' && (
                    <motion.div
                      key="idle"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      transition={{
                        duration: 0.25,
                        ease: [0.4, 0, 0.2, 1]
                      }}
                      whileTap={{ 
                        scale: 0.95 
                      }}
                    >
                      <RotateCw className="h-4 w-4 text-[oklch(0.40_0.00_0)] dark:text-[oklch(0.72_0.00_0)]" strokeWidth={2} />
                    </motion.div>
                  )}
                  
                  {buttonState === 'loading' && (
                    <motion.div
                      key="loading"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1, rotate: 360 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      transition={{
                        opacity: { duration: 0.25 },
                        scale: { duration: 0.25 },
                        rotate: {
                          duration: 1.2,
                          repeat: Infinity,
                          ease: "linear"
                        }
                      }}
                    >
                      <LoaderCircle className="h-4 w-4 text-[oklch(0.40_0.00_0)] dark:text-[oklch(0.72_0.00_0)]" strokeWidth={2} />
                    </motion.div>
                  )}
                  
                  {buttonState === 'success' && (
                    <motion.div
                      key="success"
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      transition={{
                        duration: 0.35,
                        ease: [0.4, 0, 0.2, 1],
                        scale: {
                          type: "spring",
                          damping: 12,
                          stiffness: 300
                        }
                      }}
                    >
                      <Check className="h-4 w-4 text-green-600 dark:text-green-500" strokeWidth={2} />
                    </motion.div>
                  )}
                      </AnimatePresence>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent 
                    side="bottom" 
                    className="bg-[oklch(0.20_0.00_0)] text-[oklch(0.97_0.00_0)] border-[oklch(0.27_0.00_0)] dark:bg-[oklch(0.92_0.00_0)] dark:text-[oklch(0.20_0.00_0)] dark:border-[oklch(0.85_0.00_0)]"
                  >
                    <p className="text-xs font-medium">
                      {buttonState === 'idle' ? 'Yenile' : 
                       buttonState === 'loading' ? 'Güncelleniyor...' : 
                       'Güncellendi'}
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
            {/* Dark Mode Toggle - En sağda */}
            <ModeToggle />
          </div>
        </div>
      </div>
    </header>
  )
}