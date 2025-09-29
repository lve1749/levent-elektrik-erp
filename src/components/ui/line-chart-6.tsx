'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { ChartConfig, ChartContainer, ChartTooltip } from '@/components/ui/chart';
import { ArrowDown, ArrowUp } from 'lucide-react';
import { Area, AreaChart, XAxis, YAxis, ReferenceLine, ResponsiveContainer } from 'recharts';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';

interface HareketDetay {
  stokKodu: string;
  stokIsmi: string;
  girisMiktari: number;
  cikisMiktari: number;
  hareketTarihi: Date | string;
  hareketTipi: string;
  stokEtkisi: string;
  evrakNo: string;
  cariKodu: string;
  aciklama: string;
  normalKati?: number;
  renkKodu: string;
  evrakTip: number;
}

interface OzetBilgi {
  netGirisMiktari: number;
  netCikisMiktari: number;
  kalanMiktar: number;
  projeHareketi: number;
  degisim: number;
  sayim: number;
  normalGirisSayisi: number;
  normalCikisSayisi: number;
  satisIadesiSayisi: number;
  alisIadesiSayisi: number;
  ortNormalGiris: number;
  ortNormalSatis: number;
}

interface LineChart6Props {
  hareketler: HareketDetay[];
  ozet: OzetBilgi | null;
}

const formatNumber = (value: number) => {
  return new Intl.NumberFormat('tr-TR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value);
};

export default function LineChart6({ hareketler = [], ozet }: LineChart6Props) {
  const [selectedMetric, setSelectedMetric] = useState<string>('netGiris');
  const [chartDimensions, setChartDimensions] = useState({ width: 0, height: 0 });
  const chartContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const updateDimensions = () => {
      if (chartContainerRef.current) {
        const { width } = chartContainerRef.current.getBoundingClientRect();
        setChartDimensions({
          width: width,
          height: window.innerHeight < 640 ? 192 : window.innerHeight < 768 ? 224 : 256
        });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    
    // Modal açıldığında boyutu güncelle
    const timer = setTimeout(updateDimensions, 100);
    
    return () => {
      window.removeEventListener('resize', updateDimensions);
      clearTimeout(timer);
    };
  }, [hareketler]); // hareketler değiştiğinde yeniden hesapla

  // SQL verilerini grafik formatına dönüştür
  const platformData = useMemo(() => {
    if (!hareketler || hareketler.length === 0) return [];

    // Tarihe göre grupla
    const groupedData = hareketler.reduce((acc: any, hareket) => {
      const date = format(new Date(hareket.hareketTarihi), 'yyyy-MM-dd');
      
      if (!acc[date]) {
        acc[date] = {
          date,
          netGiris: 0,
          netCikis: 0,
          kalanMiktar: 0,
          proje: 0,
          iade: 0,
          degisim: 0,
          sayim: 0,
          diger: 0
        };
      }
      
      // Giriş miktarlarını topla
      acc[date].netGiris += hareket.girisMiktari || 0;
      
      // Çıkış miktarlarını topla  
      acc[date].netCikis += hareket.cikisMiktari || 0;
      
      // Proje hareketlerini say
      if (hareket.aciklama && hareket.aciklama.includes('PROJE')) {
        acc[date].proje += 1;
      }
      
      // İade miktarlarını topla (sayı değil miktar)
      if (hareket.hareketTipi && (hareket.hareketTipi.includes('İADE') || hareket.hareketTipi.includes('İade'))) {
        acc[date].iade += (hareket.girisMiktari || 0) + (hareket.cikisMiktari || 0);
      }
      
      // Değişim hareketlerini say
      if (hareket.hareketTipi && hareket.hareketTipi.includes('DEĞİŞİM')) {
        acc[date].degisim += 1;
        acc[date].diger += 1; // Diğer toplamına da ekle
      }
      
      // Sayım hareketlerini say
      if (hareket.hareketTipi && hareket.hareketTipi.includes('SAYIM')) {
        acc[date].sayim += 1;
        acc[date].diger += 1; // Diğer toplamına da ekle
      }
      
      return acc;
    }, {});

    // Kümülatif kalan miktar hesapla
    let kumulatif = 0;
    const dataArray = Object.values(groupedData).sort((a: any, b: any) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    
    dataArray.forEach((day: any) => {
      kumulatif += (day.netGiris - day.netCikis);
      day.kalanMiktar = kumulatif;
    });

    return dataArray;
  }, [hareketler]);

  // Dinamik metrik yapılandırması
  const metrics = useMemo(() => {
    if (!ozet) {
      return [
        {
          key: 'netGiris',
          label: 'Net Giriş',
          value: 0,
          subText: '',
          format: formatNumber,
        },
        {
          key: 'netCikis',
          label: 'Net Çıkış',
          value: 0,
          subText: '',
          format: formatNumber,
        },
        {
          key: 'kalanMiktar',
          label: 'Kalan Miktar',
          value: 0,
          subText: '',
          format: formatNumber,
        },
        {
          key: 'proje',
          label: 'Proje',
          value: 0,
          subText: '',
          format: (val: number) => val.toLocaleString('tr-TR'),
        },
        {
          key: 'iade',
          label: 'İade',
          value: 0,
          subText: '',
          format: (val: number) => val.toLocaleString('tr-TR'),
        },
        {
          key: 'diger',
          label: 'Diğer',
          value: 0,
          subText: '',
          format: (val: number) => val.toLocaleString('tr-TR'),
        },
      ];
    }

    // İade sayılarını hesapla
    const iadeSayisi = (ozet.satisIadesiSayisi || 0) + (ozet.alisIadesiSayisi || 0);
    const digerTotal = (ozet.degisim || 0) + (ozet.sayim || 0);

    // Hareketlerden iade miktarlarını hesapla
    const iadeMiktari = hareketler.reduce((total, hareket) => {
      if (hareket.hareketTipi && (hareket.hareketTipi.includes('İADE') || hareket.hareketTipi.includes('İade'))) {
        // İadeler için giriş veya çıkış miktarını topla
        return total + (hareket.girisMiktari || 0) + (hareket.cikisMiktari || 0);
      }
      return total;
    }, 0);

    return [
      {
        key: 'netGiris',
        label: 'Net Giriş',
        value: ozet.netGirisMiktari,
        subText: `${ozet.normalGirisSayisi} hareket`,
        format: formatNumber,
      },
      {
        key: 'netCikis',
        label: 'Net Çıkış',
        value: ozet.netCikisMiktari,
        subText: `${ozet.normalCikisSayisi} hareket`,
        format: formatNumber,
      },
      {
        key: 'kalanMiktar',
        label: 'Kalan Miktar',
        value: ozet.kalanMiktar,
        subText: `${formatNumber(ozet.kalanMiktar)} birim`,
        format: formatNumber,
      },
      {
        key: 'proje',
        label: 'Proje',
        value: ozet.projeHareketi || 0,
        subText: `${ozet.projeHareketi || 0} Adet`,
        format: (val: number) => val.toLocaleString('tr-TR'),
      },
      {
        key: 'iade',
        label: 'İade',
        value: iadeMiktari,
        subText: `${iadeSayisi} hareket`,
        format: formatNumber,
      },
      {
        key: 'diger',
        label: 'Diğer',
        value: digerTotal,
        subText: digerTotal > 0 ? `Değişim: ${ozet.degisim} Sayım: ${ozet.sayim}` : '',
        format: (val: number) => val.toLocaleString('tr-TR'),
      },
    ];
  }, [ozet]);

  // Chart config
  const chartConfig = {
    netGiris: {
      label: 'Net Giriş',
      color: 'rgb(34, 197, 94)', // green-500
    },
    netCikis: {
      label: 'Net Çıkış',
      color: 'rgb(239, 68, 68)', // red-500
    },
    kalanMiktar: {
      label: 'Kalan Miktar',
      color: 'rgb(59, 130, 246)', // blue-500
    },
    proje: {
      label: 'Proje',
      color: 'rgb(249, 115, 22)', // orange-500
    },
    iade: {
      label: 'İade',
      color: 'oklch(0.75 0.20 130)', // lime rengi
    },
    degisim: {
      label: 'Değişim',
      color: 'rgb(59, 130, 246)', // blue-500
    },
    sayim: {
      label: 'Sayım',
      color: 'rgb(156, 163, 175)', // gray-400
    },
    diger: {
      label: 'Diğer',
      color: 'rgb(107, 114, 128)', // gray-500
    },
  } satisfies ChartConfig;

  // Custom Tooltip
  interface TooltipProps {
    active?: boolean;
    payload?: Array<{
      dataKey: string;
      value: number;
      color: string;
    }>;
    label?: string;
  }

  const CustomTooltip = ({ active, payload, label }: TooltipProps) => {
    if (active && payload && payload.length) {
      const entry = payload[0];
      const config = chartConfig[entry.dataKey as keyof typeof chartConfig];
      
      if (config) {
        // Tarihi Türkçe formatla
        const formattedDate = label ? format(new Date(label), 'd MMMM yyyy', { locale: tr }) : '';
        
        return (
          <div className="rounded-lg border bg-popover p-2.5 shadow-sm shadow-black/5 min-w-[120px]">
            {formattedDate && (
              <div className="text-[10px] text-muted-foreground mb-1">{formattedDate}</div>
            )}
            <div className="flex items-center gap-1.5 text-xs">
              <div className="size-1.5 rounded-full" style={{ backgroundColor: entry.color }}></div>
              <span className="text-muted-foreground">{config.label}:</span>
              <span className="font-semibold text-popover-foreground">
                {entry.dataKey === 'proje' 
                  ? entry.value.toLocaleString('tr-TR') 
                  : formatNumber(entry.value)}
              </span>
            </div>
          </div>
        );
      }
    }
    return null;
  };

  // Veri yoksa boş görünüm
  if (!hareketler || hareketler.length === 0) {
    return null;
  }

  return (
    <div className="w-full min-w-0 flex-shrink-0" style={{ maxWidth: '100%' }}>
      <Card className="w-full rounded-lg py-0 overflow-hidden shadow-none bg-[oklch(0.99_0.00_0)] dark:bg-[oklch(0.14_0.00_0)] border-[oklch(0.92_0.00_0)] dark:border-[oklch(0.27_0.00_0)]">
        <CardHeader className="p-0 mb-3">
          {/* Metrics Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 grow">
            {metrics.map((metric) => {
              return (
                <button
                  key={metric.key}
                  onClick={() => setSelectedMetric(metric.key)}
                  className={cn(
                    'cursor-pointer flex-1 text-start p-2 sm:p-2.5 lg:p-3 border-b border-r relative',
                    'border-[oklch(0.92_0.00_0)] dark:border-[oklch(0.27_0.00_0)]',
                    'last:border-r-0',
                    'lg:border-b-0 lg:border-r lg:last:border-r-0',
                    'transition-all duration-300 ease-in-out',
                    'hover:bg-[oklch(0.97_0.00_0)] dark:hover:bg-[oklch(0.20_0.00_0)]',
                    selectedMetric === metric.key && 'bg-[oklch(0.94_0.00_0)] dark:bg-[oklch(0.18_0.00_0)]',
                  )}
                >
                  <div className="flex items-center justify-between mb-0.5 sm:mb-1">
                    <span className="text-[13px] text-muted-foreground">{metric.label}</span>
                  </div>
                  <div className={cn(
                    "text-[16px] font-bold",
                    metric.key === 'netGiris' && "text-green-600 dark:text-green-500",
                    metric.key === 'netCikis' && "text-red-600 dark:text-red-500",
                    metric.key === 'kalanMiktar' && "text-blue-600 dark:text-blue-500",
                    metric.key === 'proje' && "text-orange-600 dark:text-orange-500",
                    metric.key === 'iade' && "text-[oklch(0.65_0.18_132)] dark:text-[oklch(0.85_0.21_129)]",
                    metric.key === 'diger' && "text-gray-600 dark:text-gray-500"
                  )}>{metric.format(metric.value)}</div>
                  {metric.subText && (
                    <div className="text-[11px] text-muted-foreground mt-0.5">{metric.subText}</div>
                  )}
                  {/* Alt çizgi */}
                  <div className="absolute bottom-0 left-0 right-0 h-px bg-[oklch(0.92_0.00_0)] dark:bg-[oklch(0.27_0.00_0)]" />
                </button>
              );
            })}
          </div>
        </CardHeader>

        <CardContent className="px-2 sm:px-2.5 py-2 sm:py-3 overflow-hidden">
          <div ref={chartContainerRef} className="w-full">
            {chartDimensions.width > 0 && (
              <div style={{ width: '100%', height: `${chartDimensions.height}px` }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={platformData}
                    margin={{
                      top: 10,
                      right: 10,
                      left: 5,
                      bottom: 10,
                    }}
                    animationDuration={500}
                    animationEasing="ease-in-out"
                  >
              {/* Background pattern for chart area only */}
              <defs>
                <pattern id="dotGrid" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
                  <circle 
                    cx="10" 
                    cy="10" 
                    r="1" 
                    fill="oklch(0.88 0 0)" 
                    fillOpacity="0.6" 
                    className="dark:fill-[oklch(0.30_0_0)]"
                  />
                </pattern>
                
                {/* Gradient tanımları */}
                <linearGradient id="gradientNetGiris" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="rgb(34, 197, 94)" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="rgb(34, 197, 94)" stopOpacity={0.05}/>
                </linearGradient>
                <linearGradient id="gradientNetCikis" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="rgb(239, 68, 68)" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="rgb(239, 68, 68)" stopOpacity={0.05}/>
                </linearGradient>
                <linearGradient id="gradientKalanMiktar" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="rgb(59, 130, 246)" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="rgb(59, 130, 246)" stopOpacity={0.05}/>
                </linearGradient>
                <linearGradient id="gradientProje" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="rgb(249, 115, 22)" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="rgb(249, 115, 22)" stopOpacity={0.05}/>
                </linearGradient>
                <linearGradient id="gradientIade" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="oklch(0.75 0.20 130)" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="oklch(0.75 0.20 130)" stopOpacity={0.05}/>
                </linearGradient>
                <linearGradient id="gradientDegisim" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="rgb(59, 130, 246)" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="rgb(59, 130, 246)" stopOpacity={0.05}/>
                </linearGradient>
                <linearGradient id="gradientSayim" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="rgb(156, 163, 175)" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="rgb(156, 163, 175)" stopOpacity={0.05}/>
                </linearGradient>
                
                <filter id="lineShadow" x="-100%" y="-100%" width="300%" height="300%">
                  <feDropShadow
                    dx="4"
                    dy="6"
                    stdDeviation="25"
                    floodColor={`${chartConfig[selectedMetric as keyof typeof chartConfig]?.color}60`}
                  />
                </filter>
                <filter id="dotShadow" x="-50%" y="-50%" width="200%" height="200%">
                  <feDropShadow dx="2" dy="2" stdDeviation="3" floodColor="rgba(0,0,0,0.5)" />
                </filter>
              </defs>

              <XAxis
                dataKey="date"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 9, fill: 'var(--muted-foreground)' }}
                tickMargin={5}
                tickFormatter={(value) => {
                  const date = new Date(value);
                  return format(date, 'd MMM', { locale: tr });
                }}
              />

              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 9, fill: 'var(--muted-foreground)' }}
                tickMargin={5}
                domain={[0, 'auto']}
                tickCount={5}
                allowDecimals={false}
                tickFormatter={(value) => {
                  // 0 değeri için
                  if (value === 0) return '0';
                  
                  // 1000'den büyük sayılar için k formatı
                  if (Math.abs(value) >= 1000) {
                    const kValue = value / 1000;
                    // Tam sayı ise ondalık gösterme
                    if (kValue % 1 === 0) {
                      return `${kValue}k`;
                    }
                    return `${kValue.toFixed(1)}k`;
                  }
                  
                  // Küçük sayılar için tam sayı
                  return Math.round(value).toString();
                }}
                interval="preserveStartEnd"
              />

              <ChartTooltip content={<CustomTooltip />} cursor={{ strokeDasharray: '3 3', stroke: '#9ca3af' }} />

              {/* Background pattern for chart area */}
              <rect
                x="0"
                y="0"
                width="100%"
                height="100%"
                fill="url(#dotGrid)"
                fillOpacity="0.7"
                style={{ pointerEvents: 'none' }}
              />

              {/* Reference line - sadece negatif değer varsa göster */}
              {platformData.some(d => d[selectedMetric] < 0) && (
                <ReferenceLine y={0} stroke="#9ca3af" strokeDasharray="3 3" />
              )}

              <Area
                key={selectedMetric}
                type="linear"
                dataKey={selectedMetric}
                stroke={chartConfig[selectedMetric as keyof typeof chartConfig]?.color}
                fill={(() => {
                  const gradientMap = {
                    netGiris: 'url(#gradientNetGiris)',
                    netCikis: 'url(#gradientNetCikis)',
                    kalanMiktar: 'url(#gradientKalanMiktar)',
                    proje: 'url(#gradientProje)',
                    iade: 'url(#gradientIade)',
                    degisim: 'url(#gradientDegisim)',
                    sayim: 'url(#gradientSayim)',
                    diger: 'url(#gradientSayim)' // Diğer için sayım gradient'ini kullan
                  };
                  return gradientMap[selectedMetric as keyof typeof gradientMap] || 'url(#gradientNetGiris)';
                })()}
                strokeWidth={2}
                dot={false}
                animationBegin={0}
                animationDuration={500}
                animationEasing="ease-in-out"
                activeDot={{
                  r: 4,
                  fill: chartConfig[selectedMetric as keyof typeof chartConfig]?.color,
                  stroke: 'white',
                  strokeWidth: 1.5,
                }}
              />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}