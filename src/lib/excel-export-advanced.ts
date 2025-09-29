import ExcelJS from 'exceljs'
import { formatNumber, formatDate } from './formatters'
import type { StokAnalizRaporu } from '@/types'
import type { PurchaseList, ListItem } from '@/types/lists'

interface ExportOptions {
  sheetName?: string
  headerStyle?: boolean
  autoFilter?: boolean
  columnWidths?: number[]
  includeFooter?: boolean
}

// Gelişmiş Stok Analiz Raporu Excel Export
export async function advancedExportStockAnalysis(
  data: StokAnalizRaporu[],
  filename: string = 'stok-analiz-raporu',
  options: ExportOptions = {}
) {
  const {
    sheetName = 'Stok Analiz',
    headerStyle = true,
    autoFilter = true,
    columnWidths = [],
    includeFooter = true
  } = options

  const workbook = new ExcelJS.Workbook()
  workbook.creator = 'Levent Elektrik'
  workbook.lastModifiedBy = 'Levent Elektrik'
  workbook.created = new Date()
  workbook.modified = new Date()

  // Ana sayfa
  const worksheet = workbook.addWorksheet(sheetName, {
    views: [{ state: 'frozen', xSplit: 2, ySplit: 1 }]
  })

  // Kolonları tanımla
  worksheet.columns = [
    { header: 'Stok Kodu', key: 'stokKodu', width: columnWidths[0] || 15 },
    { header: 'Stok İsmi', key: 'stokIsmi', width: columnWidths[1] || 40 },
    { header: 'Alt Grup', key: 'altGrup', width: columnWidths[2] || 15 },
    { header: 'Depo', key: 'depo', width: columnWidths[3] || 10 },
    { header: 'Giriş Miktarı', key: 'girisMiktari', width: columnWidths[4] || 12 },
    { header: 'Çıkış Miktarı', key: 'cikisMiktari', width: columnWidths[5] || 12 },
    { header: 'Kalan Miktar', key: 'kalanMiktar', width: columnWidths[6] || 12 },
    { header: 'Verilen Sipariş', key: 'verilenSiparis', width: columnWidths[7] || 14 },
    { header: 'Alınan Sipariş', key: 'alinanSiparis', width: columnWidths[8] || 14 },
    { header: 'Stok + Bekleyen', key: 'stokBekleyen', width: columnWidths[9] || 15 },
    { header: 'Toplam Eksik', key: 'toplamEksik', width: columnWidths[10] || 12 },
    { header: 'Aylık Ort. Satış', key: 'aylikOrtalamaSatis', width: columnWidths[11] || 15 },
    { header: 'Ort. Aylık Stok', key: 'ortalamaAylikStok', width: columnWidths[12] || 15 },
    { header: 'Önerilen Sipariş', key: 'onerilenSiparis', width: columnWidths[13] || 15 },
    { header: 'Hareket Durumu', key: 'hareketDurumu', width: columnWidths[14] || 15 },
    { header: 'Devir Hızı (Gün)', key: 'devirHiziGun', width: columnWidths[15] || 12 },
    { header: 'Mevsimsellik', key: 'mevsimsellik', width: columnWidths[16] || 12 },
    { header: 'Son Hareket', key: 'sonHareket', width: columnWidths[17] || 12 }
  ]

  // Veri ekle
  data.forEach((item) => {
    worksheet.addRow({
      stokKodu: item.stokKodu,
      stokIsmi: item.stokIsmi,
      altGrup: item.altGrup || '-',
      depo: item.depo || '-',
      girisMiktari: item.girisMiktari,
      cikisMiktari: item.cikisMiktari,
      kalanMiktar: item.kalanMiktar,
      verilenSiparis: item.verilenSiparis || 0,
      alinanSiparis: item.alinanSiparis || 0,
      stokBekleyen: item.kalanMiktar + (item.alinanSiparis || 0) - (item.verilenSiparis || 0),
      toplamEksik: item.toplamEksik || 0,
      aylikOrtalamaSatis: item.aylikOrtalamaSatis,
      ortalamaAylikStok: item.ortalamaAylikStok,
      onerilenSiparis: item.onerilenSiparis,
      hareketDurumu: item.hareketDurumu,
      devirHiziGun: item.devirHiziGun,
      mevsimsellik: item.mevsimselPattern || '-',
      sonHareket: item.sonHareketTarihi ? formatDate(new Date(item.sonHareketTarihi)) : '-'
    })
  })

  // Header stil
  if (headerStyle) {
    const headerRow = worksheet.getRow(1)
    headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 11 }
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF0070C0' }
    }
    headerRow.alignment = { vertical: 'middle', horizontal: 'center' }
    headerRow.height = 30
  }

  // Zebra stripe pattern
  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber > 1 && rowNumber % 2 === 0) {
      row.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFF2F2F2' }
      }
    }
  })

  // Border ekle
  worksheet.eachRow((row, rowNumber) => {
    row.eachCell((cell) => {
      cell.border = {
        top: { style: 'thin', color: { argb: 'FFD3D3D3' } },
        left: { style: 'thin', color: { argb: 'FFD3D3D3' } },
        bottom: { style: 'thin', color: { argb: 'FFD3D3D3' } },
        right: { style: 'thin', color: { argb: 'FFD3D3D3' } }
      }
    })
  })

  // Number formatting
  worksheet.getColumn('girisMiktari').numFmt = '#,##0.00'
  worksheet.getColumn('cikisMiktari').numFmt = '#,##0.00'
  worksheet.getColumn('kalanMiktar').numFmt = '#,##0.00'
  worksheet.getColumn('verilenSiparis').numFmt = '#,##0.00'
  worksheet.getColumn('alinanSiparis').numFmt = '#,##0.00'
  worksheet.getColumn('stokBekleyen').numFmt = '#,##0.00'
  worksheet.getColumn('toplamEksik').numFmt = '#,##0.00'
  worksheet.getColumn('aylikOrtalamaSatis').numFmt = '#,##0.00'
  worksheet.getColumn('ortalamaAylikStok').numFmt = '#,##0.00'
  worksheet.getColumn('onerilenSiparis').numFmt = '#,##0.00'
  worksheet.getColumn('devirHiziGun').numFmt = '#,##0'

  // Conditional formatting - Kritik stoklar
  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber > 1) {
      const ortalamaAylikStok = row.getCell('ortalamaAylikStok').value as number
      if (ortalamaAylikStok < 1) {
        row.getCell('ortalamaAylikStok').fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFFFCCCC' }
        }
        row.getCell('ortalamaAylikStok').font = { bold: true, color: { argb: 'FFCC0000' } }
      }

      const hareketDurumu = row.getCell('hareketDurumu').value as string
      if (hareketDurumu === 'Ölü Stok') {
        row.getCell('hareketDurumu').fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFE0E0E0' }
        }
        row.getCell('hareketDurumu').font = { italic: true, color: { argb: 'FF666666' } }
      }
    }
  })

  // Auto filter
  if (autoFilter) {
    worksheet.autoFilter = {
      from: 'A1',
      to: `${String.fromCharCode(65 + worksheet.columns.length - 1)}${worksheet.rowCount}`
    }
  }

  // Footer - özet bilgiler
  if (includeFooter) {
    const lastRow = worksheet.rowCount + 2
    worksheet.addRow([])
    worksheet.addRow(['ÖZET BİLGİLER'])
    
    const summaryRow = worksheet.getRow(lastRow + 1)
    summaryRow.font = { bold: true, size: 12 }
    summaryRow.getCell(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE0E0E0' }
    }

    worksheet.addRow(['Toplam Ürün:', data.length])
    worksheet.addRow(['Toplam Giriş:', data.reduce((sum, item) => sum + item.girisMiktari, 0)])
    worksheet.addRow(['Toplam Çıkış:', data.reduce((sum, item) => sum + item.cikisMiktari, 0)])
    worksheet.addRow(['Toplam Kalan:', data.reduce((sum, item) => sum + item.kalanMiktar, 0)])
    worksheet.addRow(['Kritik Stok Sayısı:', data.filter(item => item.ortalamaAylikStok < 1).length])
    worksheet.addRow(['Ölü Stok Sayısı:', data.filter(item => item.hareketDurumu === 'Ölü Stok').length])
  }

  // Özet sayfası
  const summarySheet = workbook.addWorksheet('Özet')
  summarySheet.columns = [
    { header: 'Metrik', key: 'metric', width: 30 },
    { header: 'Değer', key: 'value', width: 20 }
  ]

  const summaryData = [
    { metric: 'Rapor Tarihi', value: formatDate(new Date()) },
    { metric: 'Toplam Ürün Sayısı', value: data.length },
    { metric: 'Toplam Giriş Miktarı', value: formatNumber(data.reduce((sum, item) => sum + item.girisMiktari, 0)) },
    { metric: 'Toplam Çıkış Miktarı', value: formatNumber(data.reduce((sum, item) => sum + item.cikisMiktari, 0)) },
    { metric: 'Toplam Kalan Miktar', value: formatNumber(data.reduce((sum, item) => sum + item.kalanMiktar, 0)) },
    { metric: 'Toplam Önerilen Sipariş', value: formatNumber(data.reduce((sum, item) => sum + item.onerilenSiparis, 0)) },
    { metric: 'Kritik Stok Sayısı', value: data.filter(item => item.ortalamaAylikStok < 1).length },
    { metric: 'Ölü Stok Sayısı', value: data.filter(item => item.hareketDurumu === 'Ölü Stok').length },
    { metric: 'Aktif Ürün Sayısı', value: data.filter(item => item.hareketDurumu === 'Aktif').length },
    { metric: 'Mevsimsel Ürün Sayısı', value: data.filter(item => item.mevsimselPattern?.tip === 'Mevsimsel').length }
  ]

  summaryData.forEach(item => {
    summarySheet.addRow(item)
  })

  // Özet sayfası stil
  const summaryHeaderRow = summarySheet.getRow(1)
  summaryHeaderRow.font = { bold: true, color: { argb: 'FFFFFFFF' } }
  summaryHeaderRow.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF0070C0' }
  }
  summaryHeaderRow.alignment = { vertical: 'middle', horizontal: 'center' }
  summaryHeaderRow.height = 25

  // Kritik stoklar sayfası
  const criticalStocks = data.filter(item => item.ortalamaAylikStok < 1 && item.onerilenSiparis > 0)
  if (criticalStocks.length > 0) {
    const criticalSheet = workbook.addWorksheet('Kritik Stoklar')
    criticalSheet.columns = [
      { header: 'Stok Kodu', key: 'stokKodu', width: 15 },
      { header: 'Stok İsmi', key: 'stokIsmi', width: 40 },
      { header: 'Kalan Miktar', key: 'kalanMiktar', width: 12 },
      { header: 'Aylık Satış', key: 'aylikSatis', width: 12 },
      { header: 'Kalan Ay', key: 'kalanAy', width: 10 },
      { header: 'Önerilen Sipariş', key: 'onerilenSiparis', width: 15 },
      { header: 'Aciliyet', key: 'aciliyet', width: 10 }
    ]

    criticalStocks.forEach(item => {
      const urgency = item.ortalamaAylikStok < 0.5 ? 'ÇOK ACİL' : 'ACİL'
      criticalSheet.addRow({
        stokKodu: item.stokKodu,
        stokIsmi: item.stokIsmi,
        kalanMiktar: item.kalanMiktar,
        aylikSatis: item.aylikOrtalamaSatis,
        kalanAy: Number(item.ortalamaAylikStok.toFixed(1)),
        onerilenSiparis: item.onerilenSiparis,
        aciliyet: urgency
      })
    })

    // Kritik stoklar header stil
    const criticalHeaderRow = criticalSheet.getRow(1)
    criticalHeaderRow.font = { bold: true, color: { argb: 'FFFFFFFF' } }
    criticalHeaderRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFCC0000' }
    }
    criticalHeaderRow.alignment = { vertical: 'middle', horizontal: 'center' }
    criticalHeaderRow.height = 25

    // Aciliyet durumuna göre renklendirme
    criticalSheet.eachRow((row, rowNumber) => {
      if (rowNumber > 1) {
        const aciliyet = row.getCell('aciliyet').value as string
        if (aciliyet === 'ÇOK ACİL') {
          row.getCell('aciliyet').fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFFF0000' }
          }
          row.getCell('aciliyet').font = { bold: true, color: { argb: 'FFFFFFFF' } }
        }
      }
    })
  }

  // Browser'da indir
  const buffer = await workbook.xlsx.writeBuffer()
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  })
  
  const url = window.URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = `${filename}_${formatDate(new Date()).replace(/\//g, '-')}.xlsx`
  anchor.click()
  window.URL.revokeObjectURL(url)
}

// Gelişmiş Satın Alma Listesi Export
export async function advancedExportPurchaseList(
  list: PurchaseList,
  filename?: string,
  options: ExportOptions = {}
) {
  const {
    headerStyle = true,
    autoFilter = true,
    columnWidths = [],
    includeFooter = true
  } = options

  const fileName = filename || `${list.name.replace(/[^a-z0-9]/gi, '_')}`
  
  const workbook = new ExcelJS.Workbook()
  workbook.creator = 'Levent Elektrik'
  workbook.created = new Date()

  // Ana sayfa
  const worksheet = workbook.addWorksheet(list.name, {
    views: [{ state: 'frozen', xSplit: 0, ySplit: 1 }]
  })

  // Liste başlık bilgileri
  worksheet.mergeCells('A1:L1')
  worksheet.getCell('A1').value = 'SATIN ALMA LİSTESİ'
  worksheet.getCell('A1').font = { bold: true, size: 16 }
  worksheet.getCell('A1').alignment = { horizontal: 'center', vertical: 'middle' }
  worksheet.getRow(1).height = 30

  // Meta bilgiler
  const metaInfo = [
    ['Liste Adı:', list.name],
    ['Açıklama:', list.description || '-'],
    ['Durum:', getStatusText(list.status)],
    ['Öncelik:', getPriorityText(list.priority)],
    ['Oluşturma Tarihi:', formatDate(new Date(list.createdAt))],
    ['Güncelleme Tarihi:', formatDate(new Date(list.updatedAt))]
  ]

  let currentRow = 3
  metaInfo.forEach(([label, value]) => {
    worksheet.getCell(`A${currentRow}`).value = label
    worksheet.getCell(`A${currentRow}`).font = { bold: true }
    worksheet.getCell(`B${currentRow}`).value = value
    currentRow++
  })

  // Boş satır
  currentRow++

  // Ürün tablosu başlıkları
  const tableStartRow = currentRow
  worksheet.getRow(tableStartRow).values = [
    'No',
    'Stok Kodu',
    'Stok İsmi',
    'Mevcut Stok',
    'Önerilen',
    'Sipariş Miktarı',
    'Birim',
    'Tahmini Fiyat',
    'Toplam',
    'Öncelik',
    'Durum',
    'Notlar'
  ]

  // Header stil
  const headerRow = worksheet.getRow(tableStartRow)
  headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } }
  headerRow.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF4472C4' }
  }
  headerRow.alignment = { horizontal: 'center', vertical: 'middle' }
  headerRow.height = 25

  // Kolon genişlikleri
  const colWidths = [
    5,  // No
    15, // Stok Kodu
    40, // Stok İsmi
    12, // Mevcut Stok
    10, // Önerilen
    15, // Sipariş Miktarı
    8,  // Birim
    12, // Tahmini Fiyat
    15, // Toplam
    10, // Öncelik
    12, // Durum
    30  // Notlar
  ]

  worksheet.columns = colWidths.map((width, index) => ({
    width: columnWidths[index] || width
  }))

  // Ürün verileri
  list.items.forEach((item, index) => {
    const rowData = [
      index + 1,
      item.stokKodu,
      item.stokIsmi,
      item.currentStock,
      item.suggestedQuantity,
      item.quantity,
      item.unit || 'Adet',
      item.estimatedPrice || 0,
      (item.estimatedPrice || 0) * item.quantity,
      getPriorityText(item.priority),
      getItemStatusText(item.status),
      item.notes || ''
    ]
    
    const row = worksheet.getRow(tableStartRow + index + 1)
    row.values = rowData

    // Öncelik renklendirme
    if (item.priority === 'urgent') {
      row.getCell(10).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFFFCCCC' }
      }
      row.getCell(10).font = { bold: true, color: { argb: 'FFCC0000' } }
    } else if (item.priority === 'high') {
      row.getCell(10).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFFFE0B2' }
      }
    }

    // Durum renklendirme
    const statusColors: Record<string, string> = {
      pending: 'FFF3E0',
      approved: 'FFE8F5E9',
      ordered: 'FFE3F2FD',
      received: 'FFC8E6C9',
      cancelled: 'FFFFEBEE'
    }
    
    if (statusColors[item.status]) {
      row.getCell(11).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: statusColors[item.status] }
      }
    }
  })

  // Number formatting
  const dataRowCount = list.items.length
  for (let i = 1; i <= dataRowCount; i++) {
    const row = worksheet.getRow(tableStartRow + i)
    row.getCell(4).numFmt = '#,##0.00' // Mevcut Stok
    row.getCell(5).numFmt = '#,##0.00' // Önerilen
    row.getCell(6).numFmt = '#,##0.00' // Sipariş Miktarı
    row.getCell(8).numFmt = '₺#,##0.00' // Tahmini Fiyat
    row.getCell(9).numFmt = '₺#,##0.00' // Toplam
  }

  // Borders
  for (let row = tableStartRow; row <= tableStartRow + dataRowCount; row++) {
    for (let col = 1; col <= 12; col++) {
      const cell = worksheet.getRow(row).getCell(col)
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      }
    }
  }

  // Özet bilgiler
  if (includeFooter) {
    const footerStartRow = tableStartRow + dataRowCount + 2
    const totalQuantity = list.items.reduce((sum, item) => sum + item.quantity, 0)
    const totalValue = list.items.reduce((sum, item) => sum + ((item.estimatedPrice || 0) * item.quantity), 0)

    worksheet.getCell(`A${footerStartRow}`).value = 'ÖZET BİLGİLER'
    worksheet.getCell(`A${footerStartRow}`).font = { bold: true, size: 12 }
    
    const summaryData = [
      ['Toplam Ürün Sayısı:', list.items.length],
      ['Toplam Miktar:', formatNumber(totalQuantity)],
      ['Tahmini Toplam Değer:', `₺${formatNumber(totalValue)}`]
    ]

    summaryData.forEach(([label, value], index) => {
      const row = footerStartRow + index + 1
      worksheet.getCell(`A${row}`).value = label
      worksheet.getCell(`A${row}`).font = { bold: true }
      worksheet.getCell(`B${row}`).value = value
    })
  }

  // Auto filter
  if (autoFilter) {
    worksheet.autoFilter = {
      from: `A${tableStartRow}`,
      to: `L${tableStartRow + dataRowCount}`
    }
  }

  // Browser'da indir
  const buffer = await workbook.xlsx.writeBuffer()
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  })
  
  const url = window.URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = `${fileName}_${formatDate(new Date()).replace(/\//g, '-')}.xlsx`
  anchor.click()
  window.URL.revokeObjectURL(url)
}

// Helper functions
function getStatusText(status: PurchaseList['status']): string {
  const statusMap = {
    draft: 'Taslak',
    pending: 'Bekleyen',
    approved: 'Onaylanan',
    ordered: 'Sipariş Verildi',
    completed: 'Tamamlandı',
    cancelled: 'İptal'
  }
  return statusMap[status] || status
}

function getPriorityText(priority: PurchaseList['priority'] | ListItem['priority']): string {
  const priorityMap = {
    low: 'Düşük',
    normal: 'Normal',
    high: 'Yüksek',
    urgent: 'Acil'
  }
  return priorityMap[priority] || priority
}

function getItemStatusText(status: ListItem['status']): string {
  const statusMap = {
    pending: 'Bekliyor',
    approved: 'Onaylandı',
    ordered: 'Sipariş Verildi',
    received: 'Teslim Alındı',
    cancelled: 'İptal'
  }
  return statusMap[status] || status
}