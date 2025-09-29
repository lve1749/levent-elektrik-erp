import { AylikHareket } from '@/types'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

interface MiniTrendChartProps {
  data?: AylikHareket[]
  width?: number
  height?: number
  showTooltip?: boolean
}

export default function MiniTrendChart({ 
  data, 
  width = 120, 
  height = 30,
  showTooltip = true 
}: MiniTrendChartProps) {
  if (!data || data.length === 0) return null

  // Maksimum değeri bul
  const maxValue = Math.max(...data.map(d => d.cikisMiktari))
  const minValue = Math.min(...data.map(d => d.cikisMiktari))
  const range = maxValue - minValue || 1

  // SVG path oluştur
  const points = data.map((item, index) => {
    const x = (index / (data.length - 1)) * (width - 4)
    const y = height - 4 - ((item.cikisMiktari - minValue) / range) * (height - 8)
    return `${x + 2},${y + 2}`
  }).join(' ')

  const aylar = ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara']

  const content = (
    <svg width={width} height={height} className="overflow-visible">
      {/* Arka plan çizgisi */}
      <line 
        x1={2} 
        y1={height / 2} 
        x2={width - 2} 
        y2={height / 2} 
        stroke="#e5e7eb" 
        strokeWidth="1"
      />
      
      {/* Trend çizgisi */}
      <polyline
        points={points}
        fill="none"
        stroke="#3b82f6"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      
      {/* Veri noktaları */}
      {data.map((item, index) => {
        const x = (index / (data.length - 1)) * (width - 4) + 2
        const y = height - 4 - ((item.cikisMiktari - minValue) / range) * (height - 8) + 2
        const isMax = item.cikisMiktari === maxValue
        const isMin = item.cikisMiktari === minValue
        
        return (
          <circle
            key={index}
            cx={x}
            cy={y}
            r={isMax || isMin ? 3 : 2}
            fill={isMax ? '#ef4444' : isMin ? '#10b981' : '#3b82f6'}
            className="cursor-pointer"
          />
        )
      })}
    </svg>
  )

  if (!showTooltip) return content

  return (
    <TooltipProvider delayDuration={0}>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="inline-block cursor-pointer hover:opacity-80 transition-opacity">
            {content}
          </div>
        </TooltipTrigger>
        <TooltipContent className="p-3">
          <div className="space-y-1">
            <p className="font-medium text-sm mb-2">Aylık Satış Trendi</p>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
              {data.map((item, index) => (
                <div key={index} className="flex justify-between gap-2">
                  <span className="text-muted-foreground">{aylar[item.ay - 1]}:</span>
                  <span className="font-medium">{item.cikisMiktari.toLocaleString('tr-TR')}</span>
                </div>
              ))}
            </div>
            <div className="pt-2 mt-2 border-t text-xs">
              <p>Max: <span className="font-medium text-red-600">{maxValue.toLocaleString('tr-TR')}</span></p>
              <p>Min: <span className="font-medium text-green-600">{minValue.toLocaleString('tr-TR')}</span></p>
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}