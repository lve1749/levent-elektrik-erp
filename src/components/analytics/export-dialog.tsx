'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { FileSpreadsheet, FileText, FileDown, Check } from 'lucide-react'
import { StokAnalizRaporu } from '@/types'
import { TableColumn } from '@/components/filters/column-filter'
import { formatNumber } from '@/lib/formatters'
import { toast } from 'sonner'
import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'
import XLSX from 'xlsx-js-style'
import { convertTurkishChars } from '@/lib/inter-font'

interface ExportDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  data: StokAnalizRaporu[]
  selectedData?: StokAnalizRaporu[]
  initialColumns?: TableColumn[]
  selectedGroup?: string | null
}

type ExportFormat = 'excel' | 'csv' | 'pdf'

// Tüm mevcut kolonlar
const allColumns: TableColumn[] = [
  { key: 'stokKodu', label: 'Stok Kodu', visible: true },
  { key: 'stokIsmi', label: 'Stok İsmi', visible: true },
  { key: 'altGrup', label: 'Alt Grup', visible: true },
  { key: 'depo', label: 'Depo', visible: false },
  { key: 'girisMiktari', label: 'Giriş Miktarı', visible: true },
  { key: 'cikisMiktari', label: 'Çıkış Miktarı', visible: true },
  { key: 'kalanMiktar', label: 'Kalan Miktar', visible: true },
  { key: 'verilenSiparis', label: 'Verilen Sipariş', visible: true },
  { key: 'alinanSiparis', label: 'Alınan Sipariş', visible: true },
  { key: 'stokBekleyen', label: 'Stok + Bekleyen', visible: false },
  { key: 'toplamEksik', label: 'Toplam Eksik', visible: false },
  { key: 'aylikOrtalamaSatis', label: 'Aylık Ort. Satış', visible: true },
  { key: 'ortalamaAylikStok', label: 'Ort. Aylık Stok', visible: true },
  { key: 'onerilenSiparis', label: 'Önerilen Sipariş', visible: true },
  { key: 'hareketDurumu', label: 'Hareket Durumu', visible: true },
  { key: 'devirHiziGun', label: 'Devir Hızı', visible: true },
  { key: 'mevsimselPattern', label: 'Mevsimsellik', visible: true },
]

export default function ExportDialog({
  open,
  onOpenChange,
  data,
  selectedData,
  initialColumns,
  selectedGroup
}: ExportDialogProps) {
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>('excel')
  const [selectedColumns, setSelectedColumns] = useState<TableColumn[]>(
    initialColumns ? initialColumns.filter(col => col.key !== 'checkbox') : allColumns
  )
  const [exportSelection, setExportSelection] = useState<'all' | 'selected'>(
    selectedData && selectedData.length > 0 ? 'selected' : 'all'
  )
  
  // Aktual veri seçimi
  const exportData = exportSelection === 'selected' && selectedData ? selectedData : data

  // Kolon mapping'i
  const columnMapping: Record<string, { header: string; getValue: (row: StokAnalizRaporu) => string }> = {
    stokKodu: { header: 'Stok Kodu', getValue: (row) => row.stokKodu },
    stokIsmi: { header: 'Stok İsmi', getValue: (row) => row.stokIsmi },
    altGrup: { header: 'Alt Grup', getValue: (row) => row.altGrup || '' },
    depo: { header: 'Depo', getValue: (row) => row.depo },
    girisMiktari: { header: 'Giriş Miktarı', getValue: (row) => formatNumber(row.girisMiktari) },
    cikisMiktari: { header: 'Çıkış Miktarı', getValue: (row) => formatNumber(row.cikisMiktari) },
    kalanMiktar: { header: 'Kalan Miktar', getValue: (row) => formatNumber(row.kalanMiktar) },
    verilenSiparis: { header: 'Verilen Sipariş', getValue: (row) => formatNumber(row.verilenSiparis) },
    alinanSiparis: { header: 'Alınan Sipariş', getValue: (row) => formatNumber(row.alinanSiparis) },
    stokBekleyen: { header: 'Stok + Bekleyen', getValue: (row) => formatNumber(row.stokBekleyen) },
    toplamEksik: { header: 'Toplam Eksik', getValue: (row) => formatNumber(row.toplamEksik) },
    aylikOrtalamaSatis: { header: 'Aylık Ortalama Satış', getValue: (row) => formatNumber(row.aylikOrtalamaSatis) },
    ortalamaAylikStok: { header: 'Ortalama Aylık Stok', getValue: (row) => formatNumber(row.ortalamaAylikStok) },
    onerilenSiparis: { 
      header: 'Önerilen Sipariş', 
      getValue: (row) => row.onerilenSiparis ? Math.round(row.onerilenSiparis).toString() : '0'
    },
    hareketDurumu: { 
      header: 'Hareket Durumu', 
      getValue: (row) => row.hareketDurumu || '' 
    },
    devirHiziGun: { 
      header: 'Devir Hızı (Gün)', 
      getValue: (row) => {
        if (!row.devirHiziGun) return ''
        if (row.devirHiziGun >= 999999) return 'Satış yok'
        return Math.round(row.devirHiziGun).toString()
      }
    },
    mevsimselPattern: { 
      header: 'Mevsimsellik', 
      getValue: (row) => row.mevsimselPattern?.tip || '' 
    },
  }

  const handleColumnToggle = (columnKey: string, checked: boolean) => {
    setSelectedColumns(prev => 
      prev.map(col => 
        col.key === columnKey ? { ...col, visible: checked } : col
      )
    )
  }

  const handleSelectAll = (checked: boolean) => {
    setSelectedColumns(prev => 
      prev.map(col => ({ ...col, visible: checked }))
    )
  }

  const exportToExcel = () => {
    // CSV mantığında Excel export - sadece seçili kolonlar
    const visibleColumns = selectedColumns.filter(col => col.visible && columnMapping[col.key])
    
    // Excel için veri hazırla
    const excelData = exportData.map(row => {
      const rowData: any = {}
      visibleColumns.forEach(col => {
        const header = columnMapping[col.key]?.header || col.key
        const value = columnMapping[col.key]?.getValue(row) || ''
        rowData[header] = value
      })
      return rowData
    })
    
    // XLSX kullanarak Excel oluştur
    const ws = XLSX.utils.json_to_sheet(excelData)
    
    // Kolon genişliklerini ayarla
    const columnWidths = visibleColumns.map(col => {
      const header = columnMapping[col.key]?.header || col.key
      if (header.includes('İsmi')) return { wch: 40 }
      if (header.includes('Grup')) return { wch: 15 }
      if (header.includes('Kod')) return { wch: 15 }
      return { wch: 12 }
    })
    ws['!cols'] = columnWidths
    
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Stok Analiz')
    
    // Excel dosyasını indir
    const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' })
    const blob = new Blob([wbout], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
    
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `stok_analiz_raporu_${new Date().toISOString().split('T')[0]}.xlsx`
    
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    toast.success('Excel dosyası indirildi', {
      description: `${exportData.length} kayıt, ${visibleColumns.length} kolon aktarıldı`,
      duration: 3000
    })
    
    onOpenChange(false)
  }

  const exportToCSV = () => {
    const visibleColumns = selectedColumns.filter(col => col.visible && columnMapping[col.key])
    
    // CSV başlıkları
    const headers = visibleColumns
      .map(col => columnMapping[col.key]?.header || col.key)
      .join(',')

    // CSV satırları
    const rows = exportData.map(row => 
      visibleColumns
        .map(col => {
          const value = columnMapping[col.key]?.getValue(row) || ''
          // Virgül içeren değerleri tırnak içine al
          return value.includes(',') ? `"${value}"` : value
        })
        .join(',')
    )

    // CSV içeriği oluştur
    const csvContent = [headers, ...rows].join('\n')
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    
    // İndirme linkini oluştur
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `stok_analiz_raporu_${new Date().toISOString().split('T')[0]}.csv`
    
    // İndirmeyi başlat
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    toast.success('CSV dosyası indirildi', {
      description: `${exportData.length} kayıt başarıyla aktarıldı`
    })
    
    onOpenChange(false)
  }

  const exportToPDF = () => {
    try {
      const visibleColumns = selectedColumns.filter(col => col.visible && columnMapping[col.key])
      
      // PDF oluştur
      const doc = new jsPDF({
        orientation: visibleColumns.length > 6 ? 'landscape' : 'portrait',
        unit: 'mm',
        format: 'a4'
      })
      
      const pageWidth = doc.internal.pageSize.width
      
      // Font ayarları (Türkçe karakter desteği için)
      doc.setFont('helvetica')
      
      // Sol üst - Başlık
      doc.setFontSize(16)
      doc.setFont('helvetica', 'bold')
      doc.text('Stok Analiz Raporu', 14, 15)
      
      // Sol - Ana Grup bilgisi (varsa)
      doc.setFontSize(10)
      doc.setFont('helvetica', 'normal')
      const anaGrupText = selectedGroup 
        ? convertTurkishChars(`Ana Grup: ${selectedGroup}`)
        : 'Ana Grup: Tumu'
      doc.text(anaGrupText, 14, 22)
      
      // Sol - Toplam kayıt
      doc.text(convertTurkishChars(`Toplam Kayıt: ${exportData.length}`), 14, 28)
      
      // Sağ - Tarih (Sol ile aynı hizada)
      doc.text(`Tarih: ${new Date().toLocaleDateString('tr-TR')}`, pageWidth - 14, 22, { align: 'right' })
      
      // Sağ - Saat
      doc.text(`Saat: ${new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}`, pageWidth - 14, 28, { align: 'right' })
      
      // Tablo verileri - No sütunu ekle
      const headers = ['No', ...visibleColumns.map(col => columnMapping[col.key]?.header || col.key)]
      const rows = exportData.map((row, index) => [
        (index + 1).toString(), // Satır numarası
        ...
visibleColumns.map(col => {
          const value = columnMapping[col.key]?.getValue(row) || ''
          // Türkçe karakterleri düzelt
          return value
            .replace(/ı/g, 'i')
            .replace(/İ/g, 'I')
            .replace(/ğ/g, 'g')
            .replace(/Ğ/g, 'G')
            .replace(/ü/g, 'u')
            .replace(/Ü/g, 'U')
            .replace(/ş/g, 's')
            .replace(/Ş/g, 'S')
            .replace(/ö/g, 'o')
            .replace(/Ö/g, 'O')
            .replace(/ç/g, 'c')
            .replace(/Ç/g, 'C')
        })
      ])
      
      // Tabloyu ekle
      autoTable(doc, {
        head: [headers.map(h => 
          h.replace(/ı/g, 'i')
           .replace(/İ/g, 'I')
           .replace(/ğ/g, 'g')
           .replace(/Ğ/g, 'G')
           .replace(/ü/g, 'u')
           .replace(/Ü/g, 'U')
           .replace(/ş/g, 's')
           .replace(/Ş/g, 'S')
           .replace(/ö/g, 'o')
           .replace(/Ö/g, 'O')
           .replace(/ç/g, 'c')
           .replace(/Ç/g, 'C')
        )],
        body: rows,
        startY: 35,
        styles: {
          fontSize: 8,
          cellPadding: 2,
          font: 'helvetica'
        },
        headStyles: {
          fillColor: [51, 51, 51], // oklch(0.20 0.00 0) = rgb(51, 51, 51)
          textColor: 255,
          fontStyle: 'bold'
        },
        alternateRowStyles: {
          fillColor: [245, 245, 245]
        },
        margin: { left: 14, right: 14 },
        didDrawPage: function(data) {
          // Sayfa numarası ekle - sağ tarafa
          doc.setFontSize(8)
          doc.setFont('helvetica', 'normal')
          // Not: didDrawPage son sayfada çalışmadığı için pageCount'u data.pageNumber'dan tahmin ediyoruz
          // Gerçek sayfa sayısı PDF oluşturulduktan sonra belli olur
          doc.text(
            `${data.pageNumber}/${data.pageNumber}`,
            doc.internal.pageSize.width - 14,
            doc.internal.pageSize.height - 10,
            { align: 'right' }
          )
        },
        didDrawCell: function(data) {
          // No sütununu dar tut
          if (data.column.index === 0 && data.section === 'head') {
            data.cell.styles.cellWidth = 15
          }
        }
      })
      
      // PDF oluşturulduktan sonra gerçek sayfa sayısını güncelle
      const totalPages = doc.getNumberOfPages()
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i)
        // Eski sayfa numarasının üzerine beyaz dikdörtgen çiz (sağ taraf için)
        doc.setFillColor(255, 255, 255)
        doc.rect(doc.internal.pageSize.width - 44, doc.internal.pageSize.height - 12, 30, 5, 'F')
        // Yeni sayfa numarasını yaz (sağ tarafa)
        doc.setFontSize(8)
        doc.setFont('helvetica', 'normal')
        doc.text(
          `${i}/${totalPages}`,
          doc.internal.pageSize.width - 14,
          doc.internal.pageSize.height - 10,
          { align: 'right' }
        )
      }
      
      // PDF'i indir
      doc.save(`stok_analiz_raporu_${new Date().toISOString().split('T')[0]}.pdf`)
      
      toast.success('PDF dosyası indirildi', {
        description: `${exportData.length} kayıt başarıyla aktarıldı`
      })
      
      onOpenChange(false)
    } catch (error) {
      console.error('PDF export error:', error)
      toast.error('PDF oluşturulurken hata', {
        description: 'Lütfen tekrar deneyin'
      })
    }
  }

  const handleExport = () => {
    switch (selectedFormat) {
      case 'excel':
        exportToExcel()
        break
      case 'csv':
        exportToCSV()
        break
      case 'pdf':
        exportToPDF()
        break
    }
  }

  const getExportButtonText = () => {
    switch (selectedFormat) {
      case 'excel':
        return 'Excel\'e Aktar'
      case 'csv':
        return 'CSV\'ye Aktar'
      case 'pdf':
        return 'PDF\'e Aktar'
    }
  }

  const visibleColumnCount = selectedColumns.filter(col => col.visible).length

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-[550px] bg-[oklch(0.99_0.00_0)] dark:bg-[oklch(0.20_0.00_0)] rounded-lg">
        <DialogHeader className="px-4 sm:px-6 py-4">
          <DialogTitle className="text-sm sm:text-base">Veri Dışa Aktarma</DialogTitle>
          <DialogDescription className="text-[13px]">
            Dışa aktarma formatını, veri kapsamını ve kolonları seçin
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 px-4 sm:px-6">
          {/* Veri Seçimi - Sadece seçili veri varsa göster */}
          {selectedData && selectedData.length > 0 && (
            <div className="flex w-full p-1 gap-1 bg-[oklch(0.97_0.00_0)] dark:bg-[oklch(0.15_0.00_0)] rounded-lg border border-[oklch(0.92_0.00_0)] dark:border-[oklch(0.27_0.00_0)]">
              <button
                onClick={() => setExportSelection('selected')}
                className={`relative flex-1 px-4 py-2 text-[13px] font-medium rounded-md transition-all duration-200 ${
                  exportSelection === 'selected'
                    ? 'text-[oklch(0.20_0.00_0)] dark:text-[oklch(0.87_0.00_0)]'
                    : 'text-[oklch(0.50_0.00_0)] dark:text-[oklch(0.60_0.00_0)] hover:text-[oklch(0.35_0.00_0)] dark:hover:text-[oklch(0.75_0.00_0)]'
                }`}
              >
                {exportSelection === 'selected' && (
                  <motion.div
                    layoutId="dataSelection"
                    className="absolute inset-0 bg-[oklch(0.99_0.00_0)] dark:bg-[oklch(0.20_0.00_0)] rounded-md shadow-sm border border-[oklch(0.92_0.00_0)] dark:border-[oklch(0.27_0.00_0)]"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
                <span className="relative z-10 flex items-center justify-center gap-1 sm:gap-2">
                  <span className="hidden sm:inline">Seçili Ürünler</span>
                  <span className="sm:hidden">Seçili</span>
                  <span className={exportSelection === 'selected' ? 'opacity-70' : 'opacity-60'}>({selectedData.length})</span>
                </span>
              </button>
              <button
                onClick={() => setExportSelection('all')}
                className={`relative flex-1 px-4 py-2 text-[13px] font-medium rounded-md transition-all duration-200 ${
                  exportSelection === 'all'
                    ? 'text-[oklch(0.20_0.00_0)] dark:text-[oklch(0.87_0.00_0)]'
                    : 'text-[oklch(0.50_0.00_0)] dark:text-[oklch(0.60_0.00_0)] hover:text-[oklch(0.35_0.00_0)] dark:hover:text-[oklch(0.75_0.00_0)]'
                }`}
              >
                {exportSelection === 'all' && (
                  <motion.div
                    layoutId="dataSelection"
                    className="absolute inset-0 bg-[oklch(0.99_0.00_0)] dark:bg-[oklch(0.20_0.00_0)] rounded-md shadow-sm border border-[oklch(0.92_0.00_0)] dark:border-[oklch(0.27_0.00_0)]"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
                <span className="relative z-10 flex items-center justify-center gap-1 sm:gap-2">
                  <span className="hidden sm:inline">Tüm Ürünler</span>
                  <span className="sm:hidden">Tümü</span>
                  <span className={exportSelection === 'all' ? 'opacity-70' : 'opacity-60'}>({data.length})</span>
                </span>
              </button>
            </div>
          )}
          
          {/* Format Seçimi */}
          <Tabs value={selectedFormat} onValueChange={(value) => setSelectedFormat(value as ExportFormat)} className="w-full">
            <TabsList className="grid w-full grid-cols-3 bg-[oklch(0.97_0.00_0)] dark:bg-[oklch(0.15_0.00_0)] border border-[oklch(0.92_0.00_0)] dark:border-[oklch(0.27_0.00_0)] rounded-lg overflow-hidden">
              <TabsTrigger 
                value="excel" 
                className="relative rounded-md text-[13px] data-[state=active]:text-[oklch(0.97_0.00_0)] data-[state=active]:bg-transparent data-[state=inactive]:bg-transparent hover:bg-transparent focus:bg-transparent focus-visible:bg-transparent transition-colors duration-200 [&[data-state=active]_svg]:text-[oklch(0.97_0.00_0)]"
              >
                {selectedFormat === 'excel' && (
                  <motion.div
                    className="absolute inset-0 bg-[oklch(0.55_0.22_263)] rounded-md shadow-sm border border-[oklch(0.55_0.22_263)] dark:border-[oklch(0.27_0.00_0)]"
                    layoutId="exportActiveTab"
                    transition={{
                      type: "spring",
                      stiffness: 380,
                      damping: 30,
                      mass: 0.4
                    }}
                  />
                )}
                <span className="relative z-10 flex items-center">
                  <FileSpreadsheet className="h-4 w-4 mr-2" />
                  Excel
                </span>
              </TabsTrigger>
              <TabsTrigger 
                value="csv" 
                className="relative rounded-md text-[13px] data-[state=active]:text-[oklch(0.97_0.00_0)] data-[state=active]:bg-transparent data-[state=inactive]:bg-transparent hover:bg-transparent focus:bg-transparent focus-visible:bg-transparent transition-colors duration-200 [&[data-state=active]_svg]:text-[oklch(0.97_0.00_0)]"
              >
                {selectedFormat === 'csv' && (
                  <motion.div
                    className="absolute inset-0 bg-[oklch(0.55_0.22_263)] rounded-md shadow-sm border border-[oklch(0.55_0.22_263)] dark:border-[oklch(0.27_0.00_0)]"
                    layoutId="exportActiveTab"
                    transition={{
                      type: "spring",
                      stiffness: 380,
                      damping: 30,
                      mass: 0.4
                    }}
                  />
                )}
                <span className="relative z-10 flex items-center">
                  <FileText className="h-4 w-4 mr-2" />
                  CSV
                </span>
              </TabsTrigger>
              <TabsTrigger 
                value="pdf" 
                className="relative rounded-md text-[13px] data-[state=active]:text-[oklch(0.97_0.00_0)] data-[state=active]:bg-transparent data-[state=inactive]:bg-transparent hover:bg-transparent focus:bg-transparent focus-visible:bg-transparent transition-colors duration-200 [&[data-state=active]_svg]:text-[oklch(0.97_0.00_0)]"
              >
                {selectedFormat === 'pdf' && (
                  <motion.div
                    className="absolute inset-0 bg-[oklch(0.55_0.22_263)] rounded-md shadow-sm border border-[oklch(0.55_0.22_263)] dark:border-[oklch(0.27_0.00_0)]"
                    layoutId="exportActiveTab"
                    transition={{
                      type: "spring",
                      stiffness: 380,
                      damping: 30,
                      mass: 0.4
                    }}
                  />
                )}
                <span className="relative z-10 flex items-center">
                  <FileDown className="h-4 w-4 mr-2" />
                  PDF
                </span>
              </TabsTrigger>
            </TabsList>
          </Tabs>
          
          {/* Kolon Seçimi */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label className="text-[13px]">
                Görünecek Kolonlar ({visibleColumnCount}/{selectedColumns.length})
              </Label>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => handleSelectAll(false)}
                  className="text-[13px] text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-500 dark:hover:text-red-400 dark:hover:bg-red-900/40"
                >
                  Tümünü Kaldır
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => handleSelectAll(true)}
                  className="text-[13px] text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:text-blue-500 dark:hover:text-blue-400 dark:hover:bg-blue-900/40"
                >
                  Tümünü Seç
                </Button>
              </div>
            </div>
            
            <ScrollArea className="h-[250px] sm:h-[300px] w-full rounded-lg border p-3 sm:p-4 bg-[oklch(0.97_0.00_0)] dark:bg-[oklch(0.15_0.00_0)]">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1">
                {selectedColumns.map((column) => (
                  <div 
                    key={column.key} 
                    className="flex items-center space-x-2 cursor-pointer hover:bg-[oklch(0.93_0.03_256)] dark:hover:bg-[oklch(0.27_0.00_0)] rounded-lg px-2 py-1 transition-colors"
                    onClick={() => handleColumnToggle(column.key, !column.visible)}
                  >
                    <div className="w-5 h-5 flex items-center justify-center">
                      {column.visible && (
                        <Check className="h-4 w-4 text-blue-600" strokeWidth={3} />
                      )}
                    </div>
                    <span className="text-[13px] font-normal select-none">
                      {column.label}
                    </span>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        </div>
        
        <DialogFooter className="px-4 sm:px-6 pb-4 flex-col sm:flex-row gap-0">
          <Button
            type="button"
            onClick={handleExport}
            disabled={visibleColumnCount === 0}
            className="bg-blue-600 hover:bg-blue-700 text-white text-[13px] w-full sm:w-auto sm:min-w-[140px] rounded-lg relative overflow-hidden order-2 sm:order-1"
          >
            <AnimatePresence mode="wait">
              <motion.span
                key={selectedFormat}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{
                  duration: 0.3,
                  ease: [0.4, 0, 0.2, 1]
                }}
                className="font-medium block text-[13px]"
              >
                {getExportButtonText()}
              </motion.span>
            </AnimatePresence>
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="bg-white hover:bg-gray-50 border-gray-300 text-gray-700 hover:text-gray-900 text-[13px] dark:bg-[oklch(0.20_0.00_0)] dark:hover:bg-[oklch(0.14_0.00_0)] dark:text-[oklch(0.92_0.00_0)] dark:hover:text-[oklch(0.92_0.00_0)] dark:border-[oklch(0.27_0.00_0)] rounded-lg w-full sm:w-auto order-1 sm:order-2"
          >
            İptal
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}