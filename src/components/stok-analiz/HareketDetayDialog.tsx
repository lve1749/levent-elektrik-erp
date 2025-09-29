'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import LineChart6 from "@/components/ui/line-chart-6";
import { 
  TrendingUp, 
  TrendingDown,
  AlertTriangle,
  RefreshCw,
  Calculator,
  FileText,
  ArrowUpDown,
  Package,
  Copy,
  Check
} from 'lucide-react';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { useCopyToClipboard } from '@/hooks/use-copy-to-clipboard';
import { motion, AnimatePresence } from 'framer-motion';

interface HareketDetay {
  stokKodu: string;
  stokIsmi: string;
  girisMiktari: number;
  cikisMiktari: number;
  hareketTarihi: Date;
  hareketTipi: string;
  stokEtkisi: string;
  evrakNo: string;
  cariKodu: string;
  aciklama: string;
  normalKati?: number;
  renkKodu: string;
  evrakTip: number;
  tip: number;
  cins: number;
  iadeFlag: number;
  kalanMiktar?: number;
}

interface OzetBilgi {
  netGirisMiktari: number;
  netCikisMiktari: number;
  kalanMiktar: number;
  toplamHareket: number;
  normalGirisSayisi: number;
  normalCikisSayisi: number;
  satisIadesiSayisi: number;
  alisIadesiSayisi: number;
  projeHareketi: number;
  degisim: number;
  sayim: number;
  ortNormalGiris?: number;
  ortNormalSatis?: number;
  standartSapma?: number;
  ortalamaSatis?: number;
  ustSinir?: number;
}

interface HareketDetayDialogProps {
  isOpen: boolean;
  onClose: () => void;
  stokKodu: string;
  stokIsmi: string;
  baslangicTarih: string;
  bitisTarih: string;
}

// LineChart Modülü
interface HareketChartProps {
  hareketler: HareketDetay[];
  ozet: OzetBilgi | null;
}

function HareketChart({ hareketler, ozet }: HareketChartProps) {
  if (!ozet || hareketler.length === 0) return null;
  
  return (
    <div className="w-full overflow-hidden">
      <LineChart6 hareketler={hareketler} ozet={ozet} />
    </div>
  );
}

// Tablo Modülü
interface HareketTabloProps {
  hareketler: HareketDetay[];
  loading: boolean;
  error: string | null;
}

function HareketTablo({ hareketler, loading, error }: HareketTabloProps) {
  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('tr-TR', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  // Kümülatif kalan miktar hesaplama
  const hareketlerWithKalan = useMemo(() => {
    let kumulatifKalan = 0;
    
    // Hareketleri tarihe göre sırala (eskiden yeniye)
    const sortedHareketler = [...hareketler].sort((a, b) => 
      new Date(a.hareketTarihi).getTime() - new Date(b.hareketTarihi).getTime()
    );
    
    // Her hareket için kalan miktarı hesapla
    return sortedHareketler.map(hareket => {
      // Giriş ekle, çıkış çıkar
      kumulatifKalan += (hareket.girisMiktari - hareket.cikisMiktari);
      
      return {
        ...hareket,
        kalanMiktar: kumulatifKalan
      };
    }).reverse(); // Tekrar ters çevir (yeniden eskiye göstermek için)
  }, [hareketler]);

  const getHareketTipiStyle = (hareketTipi: string, renkKodu: string) => {
    // Hareket tipine göre renk belirle
    if (hareketTipi.includes('ANORMAL')) {
      return 'text-red-600 dark:text-red-400 font-semibold';
    }
    // SATIŞ İADESİ (lime)
    if (hareketTipi.includes('SATIŞ İADESİ') || hareketTipi.includes('Satış İadesi')) {
      return 'text-[oklch(0.65_0.18_132)] dark:text-[oklch(0.85_0.21_129)] font-medium';
    }
    
    // ALIŞ İADESİ (indigo)
    if (hareketTipi.includes('ALIŞ İADESİ') || hareketTipi.includes('Alış İadesi')) {
      return 'text-[oklch(0.59_0.20_277)] dark:text-[oklch(0.59_0.20_277)] font-medium';
    }
    if (hareketTipi.includes('STOK ALIMI') || hareketTipi.includes('SATIN ALMA')) {
      return 'text-green-600 dark:text-green-400 font-medium';
    }
    if (hareketTipi.includes('PROJE')) {
      return 'text-orange-600 dark:text-orange-400 font-medium';
    }
    if (hareketTipi.includes('DEĞİŞİM')) {
      return 'text-blue-600 dark:text-blue-400 font-medium';
    }
    if (hareketTipi.includes('SAYIM')) {
      return 'text-gray-600 dark:text-gray-400 font-medium';
    }
    // Normal satış ve diğerleri için
    return 'text-gray-700 dark:text-gray-300 font-medium';
  };

  const formatHareketTipi = (hareketTipi: string) => {
    // Özel durumlar için mapping
    const specialCases: Record<string, string> = {
      'SATIŞ İADESİ': 'Satış İadesi',
      'SATIŞ İADESİ (Müşteri→Biz)': 'Satış İadesi (Müşteri→Biz)',
      'ALIŞ İADESİ': 'Alış İadesi',
      'ALIŞ İADESİ (Biz→Tedarikçi)': 'Alış İadesi (Biz→Tedarikçi)',
      'NORMAL SATIŞ': 'Normal Satış',
      'ANORMAL SATIŞ': 'Anormal Satış',
      'ANORMAL SATIŞ (Fatura)': 'Anormal Satış (Fatura)',
      'STOK ALIMI': 'Stok Alımı',
      'SATIN ALMA': 'Satın Alma',
      'DEĞİŞİM (Alınan)': 'Değişim (Alınan)',
      'DEĞİŞİM (Verilen)': 'Değişim (Verilen)',
      'SAYIM FAZLASI': 'Sayım Fazlası',
      'SAYIM EKSİĞİ': 'Sayım Eksiği',
      'PROJE': 'Proje',
      'GİRİŞ': 'Giriş',
      'ÇIKIŞ': 'Çıkış',
      'DİĞER': 'Diğer',
      'SATIŞ (Fatura)': 'Satış (Fatura)'
    };
    
    // Özel durumda varsa onu kullan
    if (specialCases[hareketTipi]) {
      return specialCases[hareketTipi];
    }
    
    // Yoksa genel title case dönüşümü yap
    return hareketTipi
      .toLowerCase()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const getRowBackground = (index: number, renkKodu: string, hareketTipi: string) => {
    // Hareket tipine göre gradient renkler
    
    // SATIŞ İADESİ (lime yeşili)
    if (hareketTipi.includes('SATIŞ İADESİ') || hareketTipi.includes('Satış İadesi')) {
      return "bg-gradient-to-r from-[oklch(0.97_0.07_122)] via-[oklch(0.98_0.03_122)]/50 to-transparent hover:from-[oklch(0.96_0.07_122)] dark:from-[oklch(0.41_0.10_131)]/50 dark:via-[oklch(0.27_0.05_131)]/20 dark:to-[oklch(0.14_0.00_0)] dark:hover:from-[oklch(0.42_0.10_131)]/60";
    }
    
    // ALIŞ İADESİ (indigo)
    if (hareketTipi.includes('ALIŞ İADESİ') || hareketTipi.includes('Alış İadesi')) {
      return "bg-gradient-to-r from-[oklch(0.93_0.03_273)] via-[oklch(0.95_0.02_273)]/50 to-transparent hover:from-[oklch(0.92_0.03_273)] dark:from-[oklch(0.36_0.14_279)]/50 dark:via-[oklch(0.25_0.07_279)]/20 dark:to-[oklch(0.14_0.00_0)] dark:hover:from-[oklch(0.37_0.14_279)]/60";
    }
    
    if (hareketTipi.includes('STOK ALIMI') || hareketTipi.includes('SATIN ALMA')) {
      return "bg-gradient-to-r from-[oklch(0.96_0.04_156)] via-[oklch(0.98_0.02_156)]/50 to-transparent hover:from-[oklch(0.95_0.04_156)] dark:from-[oklch(0.27_0.06_153)]/50 dark:via-[oklch(0.20_0.03_153)]/20 dark:to-[oklch(0.14_0.00_0)] dark:hover:from-[oklch(0.28_0.06_153)]/60";
    }
    
    if (hareketTipi.includes('ANORMAL')) {
      return "bg-gradient-to-r from-[oklch(0.94_0.03_18)] via-[oklch(0.96_0.015_18)]/50 to-transparent hover:from-[oklch(0.93_0.03_18)] dark:from-[oklch(0.26_0.09_26)]/50 dark:via-[oklch(0.20_0.04_26)]/20 dark:to-[oklch(0.14_0.00_0)] dark:hover:from-[oklch(0.27_0.09_26)]/60";
    }
    
    // Diğer özel durumlar
    if (hareketTipi.includes('PROJE')) {
      return "bg-gradient-to-r from-orange-100 via-orange-50/50 to-transparent hover:from-orange-200 dark:from-orange-950/40 dark:via-orange-950/20 dark:to-[oklch(0.14_0.00_0)] dark:hover:from-orange-950/50";
    }
    
    if (hareketTipi.includes('DEĞİŞİM')) {
      return "bg-gradient-to-r from-blue-100 via-blue-50/50 to-transparent hover:from-blue-200 dark:from-blue-950/40 dark:via-blue-950/20 dark:to-[oklch(0.14_0.00_0)] dark:hover:from-blue-950/50";
    }
    
    // Normal satırlar için zebra pattern (gradient yok)
    if (index % 2 === 0) {
      return "bg-white hover:bg-[oklch(0.97_0.01_265)] dark:bg-[oklch(0.14_0.00_0)] dark:hover:bg-[oklch(0.16_0.00_0)]";
    }
    return "bg-[oklch(0.98_0.00_0)] hover:bg-[oklch(0.97_0.01_265)] dark:bg-[oklch(0.15_0.00_0)] dark:hover:bg-[oklch(0.16_0.00_0)]";
  };

  if (loading) {
    return (
      <div className="space-y-2">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-10 w-full" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8 text-red-600 dark:text-red-400">
        <AlertTriangle className="w-12 h-12 mx-auto mb-2" />
        <p className="text-sm">{error}</p>
      </div>
    );
  }

  if (hareketler.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
        <Package className="w-12 h-12 mx-auto mb-2 opacity-50" />
        <p className="text-sm">Bu tarih aralığında hareket bulunamadı</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="rounded-lg border border-[oklch(0.92_0.00_0)] dark:border-[oklch(0.27_0.00_0)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1000px] border-collapse">
            <thead className="sticky top-0 z-20 bg-[oklch(0.95_0.00_0)] dark:bg-[oklch(0.20_0.00_0)]">
              <tr className="shadow-[0_1px_0_0_oklch(0.92_0.00_0)] dark:shadow-[0_1px_0_0_oklch(0.27_0.00_0)]">
                <th className="py-3.5 px-3 text-xs font-medium text-gray-600 dark:text-[oklch(0.92_0.00_0)] whitespace-nowrap text-center border-b border-[oklch(0.92_0.00_0)] dark:border-[oklch(0.27_0.00_0)] border-r border-[oklch(0.94_0.00_0)] dark:border-[oklch(0.25_0.00_0)] w-[50px]">
                  No
                </th>
                <th className="py-3.5 px-3 text-xs font-medium text-gray-600 dark:text-[oklch(0.92_0.00_0)] whitespace-nowrap text-left border-b border-[oklch(0.92_0.00_0)] dark:border-[oklch(0.27_0.00_0)] border-r border-[oklch(0.94_0.00_0)] dark:border-[oklch(0.25_0.00_0)]">
                  Tarih
                </th>
                <th className="py-3.5 px-3 text-xs font-medium text-gray-600 dark:text-[oklch(0.92_0.00_0)] whitespace-nowrap text-left border-b border-[oklch(0.92_0.00_0)] dark:border-[oklch(0.27_0.00_0)] border-r border-[oklch(0.94_0.00_0)] dark:border-[oklch(0.25_0.00_0)]">
                  Evrak No
                </th>
                <th className="py-3.5 px-3 text-xs font-medium text-gray-600 dark:text-[oklch(0.92_0.00_0)] whitespace-nowrap text-left border-b border-[oklch(0.92_0.00_0)] dark:border-[oklch(0.27_0.00_0)] border-r border-[oklch(0.94_0.00_0)] dark:border-[oklch(0.25_0.00_0)]">
                  Hareket Tipi
                </th>
                <th className="py-3.5 px-3 text-xs font-medium text-gray-600 dark:text-[oklch(0.92_0.00_0)] whitespace-nowrap text-center border-b border-[oklch(0.92_0.00_0)] dark:border-[oklch(0.27_0.00_0)] border-r border-[oklch(0.94_0.00_0)] dark:border-[oklch(0.25_0.00_0)]">
                  Giriş
                </th>
                <th className="py-3.5 px-3 text-xs font-medium text-gray-600 dark:text-[oklch(0.92_0.00_0)] whitespace-nowrap text-center border-b border-[oklch(0.92_0.00_0)] dark:border-[oklch(0.27_0.00_0)] border-r border-[oklch(0.94_0.00_0)] dark:border-[oklch(0.25_0.00_0)]">
                  Çıkış
                </th>
                <th className="py-3.5 px-3 text-xs font-medium text-gray-600 dark:text-[oklch(0.92_0.00_0)] whitespace-nowrap text-center border-b border-[oklch(0.92_0.00_0)] dark:border-[oklch(0.27_0.00_0)] border-r border-[oklch(0.94_0.00_0)] dark:border-[oklch(0.25_0.00_0)]">
                  Kalan Miktar
                </th>
                <th className="py-3.5 px-3 text-xs font-medium text-gray-600 dark:text-[oklch(0.92_0.00_0)] whitespace-nowrap text-center border-b border-[oklch(0.92_0.00_0)] dark:border-[oklch(0.27_0.00_0)] border-r border-[oklch(0.94_0.00_0)] dark:border-[oklch(0.25_0.00_0)]">
                  Sapma Oranı
                </th>
                <th className="py-3.5 px-3 text-xs font-medium text-gray-600 dark:text-[oklch(0.92_0.00_0)] whitespace-nowrap text-left border-b border-[oklch(0.92_0.00_0)] dark:border-[oklch(0.27_0.00_0)] border-r border-[oklch(0.94_0.00_0)] dark:border-[oklch(0.25_0.00_0)]">
                  Cari Kodu
                </th>
                <th className="py-3.5 px-3 text-xs font-medium text-gray-600 dark:text-[oklch(0.92_0.00_0)] whitespace-nowrap text-left border-b border-[oklch(0.92_0.00_0)] dark:border-[oklch(0.27_0.00_0)]">
                  Açıklama
                </th>
              </tr>
            </thead>
            <tbody>
              {hareketlerWithKalan.map((hareket, index) => (
                <tr 
                  key={`${hareket.evrakNo}-${index}`} 
                  className={cn(
                    "group transition-colors duration-100 will-change-[background-color] border-b border-[oklch(0.94_0.00_0)] dark:border-[oklch(0.25_0.00_0)]",
                    getRowBackground(index, hareket.renkKodu, hareket.hareketTipi)
                  )}
                >
                  <td className="h-12 py-2 px-3 text-xs font-inter font-medium text-center text-gray-600 dark:text-[oklch(0.70_0.00_0)] border-r border-[oklch(0.94_0.00_0)] dark:border-[oklch(0.25_0.00_0)]">
                    {hareketlerWithKalan.length - index}
                  </td>
                  <td className="h-12 py-2 px-3 text-xs font-inter font-medium text-gray-700 dark:text-[oklch(0.87_0.00_0)] border-r border-[oklch(0.94_0.00_0)] dark:border-[oklch(0.25_0.00_0)]">
                    {format(new Date(hareket.hareketTarihi), 'dd.MM.yyyy')}
                  </td>
                  <td className="h-12 py-2 px-3 text-xs font-inter font-medium text-gray-900 dark:text-[oklch(0.87_0.00_0)] border-r border-[oklch(0.94_0.00_0)] dark:border-[oklch(0.25_0.00_0)]">
                    {hareket.evrakNo}
                  </td>
                  <td className="h-12 py-2 px-3 text-xs border-r border-[oklch(0.94_0.00_0)] dark:border-[oklch(0.25_0.00_0)]">
                    <span className={getHareketTipiStyle(hareket.hareketTipi, hareket.renkKodu)}>
                      {formatHareketTipi(hareket.hareketTipi)}
                    </span>
                  </td>
                  <td className="h-12 py-2 px-3 text-center text-xs font-inter font-semibold border-r border-[oklch(0.94_0.00_0)] dark:border-[oklch(0.25_0.00_0)]">
                    {hareket.girisMiktari > 0 ? (
                      <span className="text-green-600 dark:text-green-400">
                        {formatNumber(hareket.girisMiktari)}
                      </span>
                    ) : (
                      <span className="text-gray-400 font-normal">-</span>
                    )}
                  </td>
                  <td className="h-12 py-2 px-3 text-center text-xs font-inter font-semibold border-r border-[oklch(0.94_0.00_0)] dark:border-[oklch(0.25_0.00_0)]">
                    {hareket.cikisMiktari > 0 ? (
                      <span className="text-red-600 dark:text-red-400">
                        {formatNumber(hareket.cikisMiktari)}
                      </span>
                    ) : (
                      <span className="text-gray-400 font-normal">-</span>
                    )}
                  </td>
                  <td className="h-12 py-2 px-3 text-center text-xs font-inter font-semibold border-r border-[oklch(0.94_0.00_0)] dark:border-[oklch(0.25_0.00_0)]">
                    <span className={cn(
                      "font-bold",
                      hareket.kalanMiktar && hareket.kalanMiktar > 0 ? "text-blue-600 dark:text-blue-400" : 
                      hareket.kalanMiktar && hareket.kalanMiktar < 0 ? "text-red-600 dark:text-red-400" : 
                      "text-gray-500"
                    )}>
                      {hareket.kalanMiktar ? formatNumber(hareket.kalanMiktar) : '0'}
                    </span>
                  </td>
                  <td className="h-12 py-2 px-3 text-center border-r border-[oklch(0.94_0.00_0)] dark:border-[oklch(0.25_0.00_0)]">
                    {hareket.normalKati ? (
                      <div className="flex items-center justify-center gap-1.5">
                        {/* Renkli circle */}
                        <span 
                          className={cn(
                            "w-1.5 h-1.5 rounded-full",
                            hareket.normalKati > 3 
                              ? "bg-red-500 dark:bg-red-400" 
                              : "bg-green-500 dark:bg-green-400"
                          )}
                        />
                        {/* Değer */}
                        <span 
                          className={cn(
                            "text-xs font-medium",
                            hareket.normalKati > 3 
                              ? "text-red-600 dark:text-red-400" 
                              : "text-gray-600 dark:text-gray-400"
                          )}
                        >
                          {hareket.normalKati}x
                        </span>
                      </div>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                  <td className="h-12 py-2 px-3 text-xs font-inter font-medium text-gray-700 dark:text-[oklch(0.87_0.00_0)] border-r border-[oklch(0.94_0.00_0)] dark:border-[oklch(0.25_0.00_0)]">
                    {hareket.cariKodu || '-'}
                  </td>
                  <td className="h-12 py-2 px-3 text-xs font-inter font-medium text-gray-600 dark:text-[oklch(0.87_0.00_0)]">
                    {hareket.aciklama || '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default function HareketDetayDialog({
  isOpen,
  onClose,
  stokKodu,
  stokIsmi,
  baslangicTarih,
  bitisTarih
}: HareketDetayDialogProps) {
  const [hareketler, setHareketler] = useState<HareketDetay[]>([]);
  const [ozet, setOzet] = useState<OzetBilgi | null>(null);
  const [loading, setLoading] = useState(false);
  const { copy, copied } = useCopyToClipboard();
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (text: string, id: string) => {
    copy(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };
  const [error, setError] = useState<string | null>(null);

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('tr-TR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  };

  useEffect(() => {
    if (isOpen && stokKodu) {
      fetchHareketDetay();
    }
  }, [isOpen, stokKodu, baslangicTarih, bitisTarih]);

  const fetchHareketDetay = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const params = new URLSearchParams({
        stokKodu,
        baslangicTarih,
        bitisTarih
      });
      
      const response = await fetch(`/api/stok-hareket-detay?${params}`);
      
      if (!response.ok) {
        throw new Error('Hareket detayları yüklenemedi');
      }
      
      const data = await response.json();
      setHareketler(data.data || []);
      setOzet(data.ozet || null);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };


  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] sm:w-[90vw] md:w-[85vw] lg:w-[80vw] xl:w-[75vw] 2xl:w-[70vw] max-w-7xl h-[92vh] max-h-[92vh] p-0 font-inter bg-[oklch(0.99_0.00_0)] dark:bg-[oklch(0.20_0.00_0)] border border-[oklch(0.92_0.00_0)] dark:border-[oklch(0.27_0.00_0)] flex flex-col" style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <DialogHeader className="p-6 border-b border-[oklch(0.92_0.00_0)] dark:border-[oklch(0.27_0.00_0)] flex-shrink-0">
          <DialogTitle className="flex flex-col gap-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Stok Hareket Detayı
              </h2>
            </div>
            
            {/* Stok Bilgileri */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2 group/code">
                <span className="text-[13px] text-muted-foreground">
                  Stok Kodu:
                </span>
                <span className="text-[13px] text-muted-foreground ml-2">
                  {stokKodu}
                </span>
                <button
                  className={cn(
                    "transition-opacity p-0.5",
                    copiedId === `modal-stok-${stokKodu}` ? "opacity-100" : "opacity-0 group-hover/code:opacity-60"
                  )}
                  onClick={() => handleCopy(stokKodu, `modal-stok-${stokKodu}`)}
                >
                  <AnimatePresence mode="wait">
                    {copiedId === `modal-stok-${stokKodu}` ? (
                      <motion.div
                        key="check"
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        transition={{ duration: 0.2, ease: "easeInOut" }}
                      >
                        <Check className="h-3.5 w-3.5 text-green-600 dark:text-green-500" strokeWidth={1.5} />
                      </motion.div>
                    ) : (
                      <motion.div
                        key="copy"
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        transition={{ duration: 0.2, ease: "easeInOut" }}
                      >
                        <Copy className="h-3.5 w-3.5" strokeWidth={1.5} />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </button>
              </div>
              <div className="flex items-center gap-2 group/name">
                <span className="text-[13px] text-muted-foreground">
                  Stok İsmi:
                </span>
                <span className="text-[13px] text-muted-foreground ml-2">
                  {stokIsmi}
                </span>
                <button
                  className={cn(
                    "transition-opacity p-0.5 ml-1",
                    copiedId === `modal-isim-${stokKodu}` ? "opacity-100" : "opacity-0 group-hover/name:opacity-60"
                  )}
                  onClick={() => handleCopy(stokIsmi, `modal-isim-${stokKodu}`)}
                >
                  <AnimatePresence mode="wait">
                    {copiedId === `modal-isim-${stokKodu}` ? (
                      <motion.div
                        key="check"
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        transition={{ duration: 0.2, ease: "easeInOut" }}
                      >
                        <Check className="h-3.5 w-3.5 text-green-600 dark:text-green-500" strokeWidth={1.5} />
                      </motion.div>
                    ) : (
                      <motion.div
                        key="copy"
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        transition={{ duration: 0.2, ease: "easeInOut" }}
                      >
                        <Copy className="h-3.5 w-3.5" strokeWidth={1.5} />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </button>
              </div>
            </div>
            
            {/* İstatistik Kartları */}
            {ozet && (ozet.ortNormalSatis || ozet.standartSapma) && (
              <div className="grid grid-cols-3 gap-6">
                <div className="bg-[oklch(0.97_0.00_0)] dark:bg-[oklch(0.14_0.00_0)] rounded-lg p-3 border border-[oklch(0.94_0.00_0)] dark:border-[oklch(0.25_0.00_0)]">
                  <div className="text-[11px] font-medium text-gray-500 dark:text-gray-400 mb-1">
                    Ortalama Satış
                  </div>
                  <div className="text-base font-bold text-gray-900 dark:text-gray-100">
                    {ozet.ortNormalSatis ? formatNumber(ozet.ortNormalSatis) : '0,00'}
                  </div>
                </div>
                
                <div className="bg-[oklch(0.97_0.00_0)] dark:bg-[oklch(0.14_0.00_0)] rounded-lg p-3 border border-[oklch(0.94_0.00_0)] dark:border-[oklch(0.25_0.00_0)]">
                  <div className="text-[11px] font-medium text-gray-500 dark:text-gray-400 mb-1">
                    Standart Sapma
                  </div>
                  <div className="text-base font-bold text-gray-900 dark:text-gray-100">
                    {ozet.standartSapma ? formatNumber(ozet.standartSapma) : '0,00'}
                  </div>
                </div>
                
                <div className="bg-[oklch(0.97_0.00_0)] dark:bg-[oklch(0.14_0.00_0)] rounded-lg p-3 border border-[oklch(0.94_0.00_0)] dark:border-[oklch(0.25_0.00_0)]">
                  <div className="text-[11px] font-medium text-gray-500 dark:text-gray-400 mb-1">
                    Anormal Sınır
                  </div>
                  <div className="text-base font-bold text-red-600 dark:text-red-400">
                    {ozet.ustSinir ? `>${formatNumber(ozet.ustSinir)}` : '>0,00'}
                  </div>
                </div>
              </div>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto overflow-x-hidden">
          <div className="flex flex-col">
            {/* Line Chart Modülü */}
            <div className="px-6 py-2 overflow-x-hidden">
              <div className="w-full max-w-full" style={{ minWidth: 0 }}>
                <HareketChart hareketler={hareketler} ozet={ozet} />
              </div>
            </div>

            {/* Tablo Modülü */}
            <div className="px-6 py-4">
              <HareketTablo 
                hareketler={hareketler} 
                loading={loading} 
                error={error} 
              />
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}