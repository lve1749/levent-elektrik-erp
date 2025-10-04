'use client'

import { useState, useEffect } from 'react'
import Header from '@/components/layout/header'
import { ScrollArea } from '@/components/ui/scroll-area'
import { CircleFadingArrowUp, Sparkles, TrendingUp, Bug, Code2, AlertTriangle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { getAllChangelogs, formatChangelogDate } from '@/lib/changelog'
import type { ChangelogEntry } from '@/types/changelog'

export default function GuncellemelerPage() {
  const [changelogs, setChangelogs] = useState<ChangelogEntry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchChangelogs()
    markAsViewed()
  }, [])

  const fetchChangelogs = async () => {
    try {
      const data = await getAllChangelogs()
      setChangelogs(data)
    } catch (error) {
      console.error('Güncellemeler yüklenemedi:', error)
    } finally {
      setLoading(false)
    }
  }

  const markAsViewed = () => {
    const currentVersion = process.env.NEXT_PUBLIC_VERSION || '1.0.6'
    localStorage.setItem('lastViewedVersion', currentVersion)
  }

  const getCategoryColor = (type: string) => {
    switch(type) {
      case 'features': return 'text-green-500'
      case 'improvements': return 'text-blue-500'
      case 'fixes': return 'text-orange-500'
      case 'api': return 'text-purple-500'
      case 'breaking': return 'text-red-500'
      default: return 'text-gray-500'
    }
  }

  const getCategoryIcon = (type: string) => {
    const iconClass = "w-4 h-4 fill-[oklch(0.55_0.22_263)] text-[oklch(0.55_0.22_263)]"
    
    switch(type) {
      case 'features':
        return <Sparkles className={iconClass} />
      case 'improvements':
        return <TrendingUp className={iconClass} />
      case 'fixes':
        return <Bug className={iconClass} />
      case 'api':
        return <Code2 className={iconClass} />
      case 'breaking':
        return <AlertTriangle className={iconClass} />
      default:
        return null
    }
  }

  return (
    <div className="h-screen flex flex-col bg-[oklch(0.99_0.00_0)] dark:bg-[oklch(0.14_0.00_0)]">
      {/* Header ScrollArea dışında, sabit kalacak */}
      <Header currentPage="Güncellemeler" />
      
      {/* Sadece bu alan scroll olacak */}
      <ScrollArea className="flex-1">
        <main className="max-w-4xl mx-auto px-4 md:px-6 py-8 md:py-12">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-pulse text-[oklch(0.50_0.00_0)] dark:text-[oklch(0.60_0.00_0)]">
                Yükleniyor...
              </div>
            </div>
          ) : changelogs.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-[oklch(0.50_0.00_0)] dark:text-[oklch(0.60_0.00_0)]">
                Henüz güncelleme bulunmuyor.
              </p>
            </div>
          ) : (
            <div className="space-y-16 relative">
              {changelogs.map((changelog, index) => (
                <article key={changelog.id} className="relative">
                  {/* Timeline çizgisi - sadece son öğede yok */}
                  {index < changelogs.length - 1 && (
                    <div className="hidden md:block absolute left-4 top-10 w-px opacity-75" 
                      style={{ height: 'calc(100% + 64px)' }}>
                      <div className="h-full bg-gradient-to-b 
                        from-transparent
                        via-[oklch(0.81_0.10_252)] 
                        dark:via-[oklch(0.38_0.14_266)]
                        via-[20%_80%]
                        to-transparent" />
                    </div>
                  )}
                  
                  {/* Ana flex container - items-start ile üstten hizala */}
                  <div className="relative">
                    <div className="flex items-start gap-3 mb-6">
                      {/* Sol: Icon ve Versiyon - items-start ile üstten hizalı */}
                      <div className="flex items-start gap-3">
                        {/* Icon - üstten hizalı, hafif yukarı taşınmış */}
                        <div className="relative flex items-center justify-center w-8 h-8 flex-shrink-0 -mt-1">
                          <div className="absolute inset-0 bg-[oklch(0.99_0.00_0)] dark:bg-[oklch(0.14_0.00_0)] rounded-full" />
                          {/* Glow efekti */}
                          <div className="absolute inset-[-4px] bg-[oklch(0.55_0.22_263)] rounded-full opacity-20 blur-md" />
                          <div className="absolute inset-0 bg-blue-500/15 rounded-full" />
                          <CircleFadingArrowUp className="w-5 h-5 text-blue-500 relative z-10" />
                        </div>
                        
                        <div className="flex flex-col">
                          {/* Versiyon ve ayırıcı - başlık ile aynı hizada */}
                          <div className="flex items-center gap-2">
                            <span className="text-base font-bold text-[oklch(0.55_0.22_263)] dark:text-[oklch(0.55_0.22_263)]">
                              v{changelog.version}
                            </span>
                            <span className="text-base text-[oklch(0.40_0.00_0)] dark:text-[oklch(0.60_0.00_0)]">
                              -
                            </span>
                          </div>
                          {/* Mobil tarih */}
                          <span className="text-[13px] text-[oklch(0.50_0.00_0)] dark:text-[oklch(0.60_0.00_0)] md:hidden">
                            {formatChangelogDate(changelog.date)}
                          </span>
                        </div>
                      </div>
                      
                      {/* Sağ: Başlık, Açıklama ve Kategoriler */}
                      <div className="flex-1">
                        {/* Başlık */}
                        <h2 className="text-base font-bold text-[oklch(0.20_0.00_0)] dark:text-[oklch(0.95_0.00_0)]">
                          {changelog.title}
                        </h2>
                        
                        {/* Açıklama */}
                        {changelog.description && (
                          <p className="mt-2 text-sm text-[oklch(0.40_0.00_0)] dark:text-[oklch(0.70_0.00_0)] leading-relaxed">
                            {changelog.description}
                          </p>
                        )}
                        
                        {/* Kategoriler - sadeleştirilmiş tasarım */}
                        {changelog.categories && changelog.categories.length > 0 && (
                          <div className="mt-6 space-y-4">
                            {changelog.categories.map((category) => (
                              <div key={category.type}>
                                {/* Kategori başlığı */}
                                <div className="flex items-center gap-2 mb-3">
                                  {/* Kategori icon */}
                                  {getCategoryIcon(category.type)}
                                  
                                  <span className="text-sm font-semibold text-[oklch(0.25_0.00_0)] dark:text-[oklch(0.85_0.00_0)]">
                                    {category.title}
                                  </span>
                                  
                                  {/* Sayı - circle içinde */}
                                  <div className="px-2 py-0.5 rounded-full bg-[oklch(0.55_0.22_263_/_0.1)] dark:bg-[oklch(0.55_0.22_263_/_0.15)]">
                                    <span className="text-xs font-medium text-[oklch(0.55_0.22_263)]">
                                      {category.count}
                                    </span>
                                  </div>
                                </div>
                                
                                {/* Maddeler */}
                                <div className="space-y-1.5 pl-6">
                                  {category.items.map((item, itemIndex) => (
                                    <div key={itemIndex} className="flex items-start gap-3 group">
                                      {/* Küçük circle */}
                                      <div className="mt-1.5 w-1 h-1 rounded-full bg-[oklch(0.50_0.00_0)] dark:bg-[oklch(0.50_0.00_0)] group-hover:bg-[oklch(0.81_0.10_252)] dark:group-hover:bg-[oklch(0.38_0.14_266)] transition-colors flex-shrink-0" />
                                      
                                      {/* Madde metni */}
                                      <p className="text-[13px] text-[oklch(0.40_0.00_0)] dark:text-[oklch(0.65_0.00_0)] leading-relaxed">
                                        {item}
                                      </p>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                      
                      {/* Tarih - absolute */}
                      <span className="hidden md:block text-[13px] text-[oklch(0.50_0.00_0)] dark:text-[oklch(0.60_0.00_0)] 
                        absolute right-[calc(100%+12px)] whitespace-nowrap top-1">
                        {formatChangelogDate(changelog.date)}
                      </span>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </main>
      </ScrollArea>
    </div>
  )
}