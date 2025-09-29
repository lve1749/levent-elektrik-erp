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
} from '@/components/ui/animated-dialog'
import { Label } from '@/components/ui/label'
import { FileSpreadsheet, FileText, FileDown, Check } from 'lucide-react'
import { toast } from 'sonner'
import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'
import XLSX from 'xlsx-js-style'
import { convertTurkishChars } from '@/lib/inter-font'
import type { ListItem } from '@/types/lists'

interface ListExportDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  items: ListItem[]
  listName: string
}

type ExportFormat = 'excel' | 'csv' | 'pdf'

export default function ListExportDialog({
  open,
  onOpenChange,
  items,
  listName
}: ListExportDialogProps) {
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>('excel')
  const [exporting, setExporting] = useState(false)

  const formatNumber = (value: number): string => {
    return new Intl.NumberFormat('tr-TR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value)
  }

  const handleExport = async () => {
    setExporting(true)
    
    try {
      switch (selectedFormat) {
        case 'excel':
          await exportToExcel()
          break
        case 'csv':
          exportToCSV()
          break
        case 'pdf':
          await exportToPDF()
          break
      }
      
      toast.success(`${selectedFormat.toUpperCase()} dosyası başarıyla oluşturuldu`, {
        description: `${items.length} kayıt dışa aktarıldı`
      })
      
      onOpenChange(false)
    } catch (error) {
      console.error('Export error:', error)
      toast.error('Dışa aktarma hatası', {
        description: 'Dosya oluşturulurken bir hata oluştu'
      })
    } finally {
      setExporting(false)
    }
  }

  const exportToExcel = async () => {
    // Excel için veri hazırla
    const wsData = [
      ['Stok Kodu', 'Stok İsmi', 'Sipariş Miktarı'],
      ...items.map(item => [
        item.stokKodu,
        item.stokIsmi,
        item.quantity
      ])
    ]

    // Workbook oluştur
    const wb = XLSX.utils.book_new()
    const ws = XLSX.utils.aoa_to_sheet(wsData)
    
    // Kolon genişliklerini ayarla
    ws['!cols'] = [
      { wch: 15 }, // Stok Kodu
      { wch: 40 }, // Stok İsmi
      { wch: 15 }, // Sipariş Miktarı
    ]
    
    XLSX.utils.book_append_sheet(wb, ws, 'Liste Ürünleri')
    
    // Dosyayı indir
    const fileName = `${listName}_${new Date().toLocaleDateString('tr-TR').replace(/\./g, '-')}.xlsx`
    XLSX.writeFile(wb, fileName)
  }

  const exportToCSV = () => {
    // CSV başlıkları
    const headers = ['Stok Kodu', 'Stok İsmi', 'Sipariş Miktarı']
    
    // CSV satırları
    const rows = items.map(item => [
      item.stokKodu,
      item.stokIsmi,
      item.quantity
    ])
    
    // CSV string oluştur
    const csvContent = [
      headers.join(';'),
      ...rows.map(row => row.join(';'))
    ].join('\n')
    
    // BOM ekle (Excel'de Türkçe karakterler için)
    const BOM = '\uFEFF'
    const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' })
    
    // Download
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.setAttribute('href', url)
    link.setAttribute('download', `${listName}_${new Date().toLocaleDateString('tr-TR').replace(/\./g, '-')}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const exportToPDF = async () => {
    // PDF oluştur - 8'den fazla kolon olduğu için landscape
    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4'
    })
    
    const pageWidth = doc.internal.pageSize.width
    
    // Font ayarları (Türkçe karakter desteği için)
    doc.setFont('helvetica')
    
    // Sol üst - Başlık
    doc.setFontSize(16)
    doc.setFont('helvetica', 'bold')
    doc.text(convertTurkishChars('Sipariş Listesi'), 14, 15)
    
    // Sol - Liste adı
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.text(convertTurkishChars(`Liste: ${listName}`), 14, 22)
    
    // Sol - Toplam kayıt
    doc.text(convertTurkishChars(`Toplam Kayıt: ${items.length}`), 14, 28)
    
    // Sağ - Tarih (Sol ile aynı hizada)
    doc.text(`Tarih: ${new Date().toLocaleDateString('tr-TR')}`, pageWidth - 14, 22, { align: 'right' })
    
    // Sağ - Saat
    doc.text(`Saat: ${new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}`, pageWidth - 14, 28, { align: 'right' })
    
    // Tablo verileri - No sütunu ekle
    const headers = ['No', 'Stok Kodu', 'Stok İsmi', 'Sipariş Miktarı']
    const rows = items.map((item, index) => [
      (index + 1).toString(), // Satır numarası
      convertTurkishChars(item.stokKodu),
      convertTurkishChars(item.stokIsmi),
      formatNumber(item.quantity)
    ])
    
    // Tabloyu ekle
    autoTable(doc, {
      head: [headers.map(h => convertTurkishChars(h))],
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
        fontSize: 9,
        fontStyle: 'bold'
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245]
      },
      columnStyles: {
        0: { cellWidth: 20, halign: 'left' }, // No - sola hizalı
        1: { cellWidth: 60, halign: 'left' }, // Stok Kodu - sola hizalı
        2: { cellWidth: 150, halign: 'left' }, // Stok İsmi - sola hizalı
        3: { cellWidth: 40, halign: 'center' } // Sipariş Miktarı - merkez
      }
    })
    
    // Alt bilgi (sayfa numarası)
    const pageCount = doc.getNumberOfPages()
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i)
      doc.setFontSize(8)
      doc.setFont('helvetica', 'normal')
      doc.text(`${i}/${pageCount}`, pageWidth - 14, doc.internal.pageSize.height - 10, { align: 'right' })
    }
    
    // PDF'i kaydet
    const fileName = `${convertTurkishChars(listName)}_${new Date().toISOString().split('T')[0]}.pdf`
    doc.save(fileName)
  }

  const formatItems = [
    {
      format: 'excel' as ExportFormat,
      icon: FileSpreadsheet,
      title: 'Excel',
      description: '.xlsx formatında',
      bgColor: 'bg-emerald-50 dark:bg-emerald-950/20',
      iconColor: 'text-emerald-600 dark:text-emerald-400',
      hoverColor: 'hover:bg-emerald-100 dark:hover:bg-emerald-950/30',
      borderColor: 'border-emerald-200 dark:border-emerald-800',
    },
    {
      format: 'csv' as ExportFormat,
      icon: FileText,
      title: 'CSV',
      description: 'Virgülle ayrılmış',
      bgColor: 'bg-blue-50 dark:bg-blue-950/20',
      iconColor: 'text-blue-600 dark:text-blue-400',
      hoverColor: 'hover:bg-blue-100 dark:hover:bg-blue-950/30',
      borderColor: 'border-blue-200 dark:border-blue-800',
    },
    {
      format: 'pdf' as ExportFormat,
      icon: FileDown,
      title: 'PDF',
      description: 'Yazdırılabilir format',
      bgColor: 'bg-red-50 dark:bg-red-950/20',
      iconColor: 'text-red-600 dark:text-red-400',
      hoverColor: 'hover:bg-red-100 dark:hover:bg-red-950/30',
      borderColor: 'border-red-200 dark:border-red-800',
    },
  ]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl bg-[oklch(0.99_0.00_0)] dark:bg-[oklch(0.20_0.00_0)] border border-[oklch(0.92_0.00_0)] dark:border-[oklch(0.27_0.00_0)]">
        <DialogHeader>
          <DialogTitle>Veri Dışa Aktarma</DialogTitle>
          <DialogDescription>
            {items.length} ürün dışa aktarılacak
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Format Seçimi */}
          <div>
            <Label className="block mb-4">Dosya Formatı</Label>
            <div className="grid grid-cols-3 gap-3">
              <AnimatePresence mode="wait">
                {formatItems.map((item) => (
                  <motion.button
                    key={item.format}
                    onClick={() => setSelectedFormat(item.format)}
                    className={`
                      relative p-4 rounded-lg border-2 transition-all duration-200
                      ${selectedFormat === item.format
                        ? `${item.borderColor} ${item.bgColor}`
                        : 'border-gray-200 dark:border-[oklch(0.27_0.00_0)] hover:border-gray-300 dark:hover:border-[oklch(0.37_0.00_0)]'
                      }
                      ${item.hoverColor}
                    `}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <AnimatePresence>
                      {selectedFormat === item.format && (
                        <motion.div
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          exit={{ scale: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="absolute top-2 right-2"
                        >
                          <div className={`p-1 rounded-full ${item.bgColor}`}>
                            <Check className={`h-3 w-3 ${item.iconColor}`} />
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                    
                    <div className="flex flex-col items-center space-y-2">
                      <item.icon className={`h-8 w-8 ${item.iconColor}`} />
                      <div className="text-center">
                        <div className="font-medium text-sm text-[oklch(0.27_0.00_0)] dark:text-[oklch(0.92_0.00_0)]">
                          {item.title}
                        </div>
                        <div className="text-xs text-[oklch(0.55_0.00_0)] dark:text-[oklch(0.62_0.00_0)]">
                          {item.description}
                        </div>
                      </div>
                    </div>
                  </motion.button>
                ))}
              </AnimatePresence>
            </div>
          </div>

          {/* Format Bilgisi */}
          <div>
            {selectedFormat === 'excel' && (
              <div className="rounded-lg bg-emerald-50 dark:bg-emerald-950/20 p-4 text-sm text-emerald-800 dark:text-emerald-300">
                <p className="font-medium mb-1">Excel Formatı (.xlsx)</p>
                <ul className="space-y-1 text-xs">
                  <li>• Tüm ürün bilgileri dahil edilecek</li>
                  <li>• Excel'de doğrudan açılabilir</li>
                  <li>• Formüller ve biçimlendirme korunur</li>
                </ul>
              </div>
            )}
            {selectedFormat === 'csv' && (
              <div className="rounded-lg bg-blue-50 dark:bg-blue-950/20 p-4 text-sm text-blue-800 dark:text-blue-300">
                <p className="font-medium mb-1">CSV Formatı (.csv)</p>
                <ul className="space-y-1 text-xs">
                  <li>• Evrensel veri transfer formatı</li>
                  <li>• Noktalı virgül ile ayrılmış</li>
                  <li>• Türkçe karakterler desteklenir</li>
                </ul>
              </div>
            )}
            {selectedFormat === 'pdf' && (
              <div className="rounded-lg bg-red-50 dark:bg-red-950/20 p-4 text-sm text-red-800 dark:text-red-300">
                <p className="font-medium mb-1">PDF Formatı (.pdf)</p>
                <ul className="space-y-1 text-xs">
                  <li>• Yazdırmaya hazır format</li>
                  <li>• Tablo ve özet bilgiler</li>
                  <li>• Yatay sayfa düzeni</li>
                </ul>
              </div>
            )}
          </div>

        </div>

        <DialogFooter>
          <Button
            onClick={handleExport}
            disabled={exporting}
            className="bg-[oklch(0.55_0.22_263)] hover:bg-[oklch(0.62_0.19_260)] text-[oklch(0.97_0.00_286)] dark:bg-[oklch(0.55_0.22_263)] dark:hover:bg-[oklch(0.62_0.19_260)] dark:text-[oklch(0.97_0.00_286)]"
          >
            {exporting ? 'Dışa Aktarılıyor...' : 'Dışa Aktar'}
          </Button>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={exporting}
            className="bg-white hover:bg-gray-50 border-gray-300 text-gray-700 hover:text-gray-900 dark:bg-[oklch(0.20_0.00_0)] dark:hover:bg-[oklch(0.14_0.00_0)] dark:text-[oklch(0.92_0.00_0)] dark:hover:text-[oklch(0.92_0.00_0)] dark:border-[oklch(0.27_0.00_0)]"
          >
            İptal
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}