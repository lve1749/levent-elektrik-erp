import React, { useState, useMemo } from 'react'
import { Badge } from '@/components/ui/badge'
// Removed Card import - using simple divs instead
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { StokAnalizRaporu } from '@/types'
import { formatNumber } from '@/lib/formatters'
import { CircleArrowDown, CircleArrowUp, StackPerspective, TriangleWarning } from '@/components/icons'
import { ArrowUpRight, ArrowDownRight, TrendingDown, TrendingUp, Minus } from 'lucide-react'

interface SummaryCardsProps {
  data: StokAnalizRaporu[]
  previousPeriodData?: StokAnalizRaporu[] // Önceki dönem verisi için
  onCompareChange?: (mode: 'week' | 'month') => void
}

export default function SummaryCards({ data, previousPeriodData, onCompareChange }: SummaryCardsProps) {
  const [compareMode, setCompareMode] = useState<'week' | 'month'>('week')

  // Mevcut dönem toplamları
  const totals = useMemo(() => data.reduce((acc, item) => ({
    girisMiktari: acc.girisMiktari + item.girisMiktari,
    cikisMiktari: acc.cikisMiktari + item.cikisMiktari,
    kalanMiktar: acc.kalanMiktar + item.kalanMiktar,
    toplamEksik: acc.toplamEksik + item.toplamEksik
  }), {
    girisMiktari: 0,
    cikisMiktari: 0,
    kalanMiktar: 0,
    toplamEksik: 0
  }), [data])

  // Önceki dönem toplamları (eğer veri varsa)
  const previousTotals = useMemo(() => {
    if (!previousPeriodData || previousPeriodData.length === 0) {
      return null
    }
    return previousPeriodData.reduce((acc, item) => ({
      girisMiktari: acc.girisMiktari + item.girisMiktari,
      cikisMiktari: acc.cikisMiktari + item.cikisMiktari,
      kalanMiktar: acc.kalanMiktar + item.kalanMiktar,
      toplamEksik: acc.toplamEksik + item.toplamEksik
    }), {
      girisMiktari: 0,
      cikisMiktari: 0,
      kalanMiktar: 0,
      toplamEksik: 0
    })
  }, [previousPeriodData])

  const eksikStokSayisi = data.filter(item => item.toplamEksik < 0).length
  const toplamUrunSayisi = data.length
  const kritikStokSayisi = data.filter(item => item.ortalamaAylikStok <= 1).length

  // Önceki dönem sayıları
  const previousEksikStokSayisi = previousPeriodData?.filter(item => item.toplamEksik < 0).length || 0
  const previousKritikStokSayisi = previousPeriodData?.filter(item => item.ortalamaAylikStok <= 1).length || 0

  // Değişim hesaplama fonksiyonu
  const calculateChange = (current: number, previous: number | null | undefined) => {
    if (!previous || previous === 0) {
      return { percentage: 0, difference: current, trend: 'stable' as const }
    }
    
    const percentage = ((current - previous) / previous) * 100
    const difference = current - previous
    const trend = percentage > 5 ? 'up' : percentage < -5 ? 'down' : 'stable' as const
    
    return { percentage, difference, trend }
  }

  // Tab değişimi
  const handleTabChange = (value: string) => {
    const mode = value as 'week' | 'month'
    setCompareMode(mode)
    onCompareChange?.(mode)
  }

  const cards = [
    {
      title: 'Toplam Alış',
      subtitle: 'Dönem içi giriş miktarı',
      value: formatNumber(totals.girisMiktari),
      valueColor: 'text-green-600',
      icon: CircleArrowDown,
      change: previousTotals ? calculateChange(totals.girisMiktari, previousTotals.girisMiktari) : null,
      previousValue: previousTotals?.girisMiktari
    },
    {
      title: 'Toplam Satış',
      subtitle: 'Dönem içi çıkış miktarı',
      value: formatNumber(totals.cikisMiktari),
      valueColor: 'text-blue-600',
      icon: CircleArrowUp,
      change: previousTotals ? calculateChange(totals.cikisMiktari, previousTotals.cikisMiktari) : null,
      previousValue: previousTotals?.cikisMiktari
    },
    {
      title: 'Mevcut Stok',
      subtitle: 'Dönem sonu stok miktarı',
      value: formatNumber(totals.kalanMiktar),
      valueColor: 'text-gray-900',
      icon: StackPerspective,
      change: previousTotals ? calculateChange(totals.kalanMiktar, previousTotals.kalanMiktar) : null,
      previousValue: previousTotals?.kalanMiktar
    },
    {
      title: 'Eksik Stok',
      subtitle: `${kritikStokSayisi} kritik / ${toplamUrunSayisi} toplam`,
      value: eksikStokSayisi.toString(),
      valueColor: 'text-red-500',
      icon: TriangleWarning,
      change: previousTotals ? calculateChange(eksikStokSayisi, previousEksikStokSayisi) : null,
      previousValue: previousEksikStokSayisi,
      isCount: true
    }
  ]

  return (
    <div className="@container w-full space-y-4">
      {/* Kıyaslama Tabs */}
      <div className="flex justify-end">
        <Tabs value={compareMode} onValueChange={handleTabChange}>
          <TabsList variant="default" size="sm">
            <TabsTrigger value="week">
              Geçen Hafta
            </TabsTrigger>
            <TabsTrigger value="month">
              Geçen Ay
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 @3xl:grid-cols-4 gap-4">
        {cards.map((card, i) => {
          const IconComponent = card.icon
          const change = card.change
          
          // Badge ayarları
          let badgeColor = 'bg-gray-100 text-gray-600 dark:bg-zinc-800 dark:text-zinc-400'
          let BadgeIcon = Minus
          let badgeIconColor = 'text-gray-500'
          let badgeText = 'N/A'
          
          if (change) {
            if (change.trend === 'up') {
              badgeColor = card.title === 'Eksik Stok' 
                ? 'bg-red-100 text-red-600 dark:bg-red-950 dark:text-red-400'
                : 'bg-green-100 text-green-600 dark:bg-green-950 dark:text-green-400'
              BadgeIcon = ArrowUpRight
              badgeIconColor = card.title === 'Eksik Stok' ? 'text-red-500' : 'text-green-500'
            } else if (change.trend === 'down') {
              badgeColor = card.title === 'Eksik Stok'
                ? 'bg-green-100 text-green-600 dark:bg-green-950 dark:text-green-400'
                : 'bg-red-100 text-red-600 dark:bg-red-950 dark:text-red-400'
              BadgeIcon = ArrowDownRight
              badgeIconColor = card.title === 'Eksik Stok' ? 'text-green-500' : 'text-red-500'
            }
            
            badgeText = `${change.percentage > 0 ? '+' : ''}${change.percentage.toFixed(1)}%`
          }

          // Alt metin
          let subtext = null
          if (change && previousTotals) {
            const changeText = card.isCount 
              ? `${change.difference > 0 ? '+' : ''}${change.difference} ürün`
              : `${change.difference > 0 ? '+' : ''}${formatNumber(Math.abs(change.difference))}`
            
            const periodText = compareMode === 'week' ? 'vs geçen hafta' : 'vs geçen ay'
            
            if (card.title === 'Eksik Stok') {
              subtext = (
                <span className={change.trend === 'down' ? 'text-green-600' : 'text-red-500'}>
                  <span className="font-medium">{kritikStokSayisi} ürün</span>{' '}
                  <span className="text-muted-foreground font-normal">kritik seviyede</span>
                </span>
              )
            } else {
              const color = change.trend === 'up' 
                ? 'text-green-600' 
                : change.trend === 'down' 
                  ? 'text-red-600' 
                  : 'text-gray-600'
              
              subtext = (
                <span className={`${color} font-medium`}>
                  {changeText} <span className="text-muted-foreground font-normal">{periodText}</span>
                </span>
              )
            }
          } else {
            // Kıyaslama verisi yoksa
            subtext = (
              <span className="text-muted-foreground text-xs">
                Kıyaslama verisi bekleniyor...
              </span>
            )
          }

          return (
            <div
              key={i}
              className="bg-white dark:bg-[oklch(0.20_0.00_0)] rounded-lg border dark:border-[oklch(0.27_0.00_0)] p-6"
            >
              <div className="flex flex-col h-full space-y-6 justify-between">
                {/* Title & Subtitle */}
                <div className="flex items-start justify-between">
                  <div className="space-y-0.5">
                    <div className="text-base font-semibold text-foreground">{card.title}</div>
                    <div className="text-xs text-muted-foreground">{card.subtitle}</div>
                  </div>
                  <IconComponent 
                    width={32}
                    height={32}
                    className="flex-shrink-0 opacity-80"
                  />
                </div>
                
                {/* Information */}
                <div className="flex-1 flex flex-col gap-1.5 justify-between grow">
                  {/* Value & Delta */}
                  <div className="flex items-center gap-2">
                    <span className={`text-2xl font-bold tracking-tight ${card.valueColor}`}>
                      {card.value}
                    </span>
                    <Badge
                      className={`${badgeColor} px-1.5 py-0.5 rounded-full text-xs font-medium flex items-center gap-1 shadow-none`}
                    >
                      <BadgeIcon className={`w-2.5 h-2.5 ${badgeIconColor}`} />
                      {badgeText}
                    </Badge>
                  </div>
                  {/* Subtext */}
                  <div className="text-xs">{subtext}</div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}