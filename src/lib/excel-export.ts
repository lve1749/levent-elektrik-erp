import XLSX from 'xlsx-js-style'
import { saveAs } from 'file-saver'
import type { StokAnalizRaporu } from '@/types'
import type { PurchaseList, ListItem } from '@/types/lists'
import { formatNumber, formatDate } from './formatters'

// Stok Analiz Raporu Excel Export
export function exportStockAnalysisToExcel(
  data: StokAnalizRaporu[],
  filename: string = 'stok-analiz-raporu'
) {
  // Verileri Excel formatına dönüştür
  const excelData = data.map((item) => ({
    'Stok Kodu': item.stokKodu,
    'Stok İsmi': item.stokIsmi,
    'Alt Grup': item.altGrup || '-',
    'Depo': item.depo || '-',
    'Giriş Miktarı': item.girisMiktari,
    'Çıkış Miktarı': item.cikisMiktari,
    'Kalan Miktar': item.kalanMiktar,
    'Verilen Sipariş': item.verilenSiparis || 0,
    'Alınan Sipariş': item.alinanSiparis || 0,
    'Stok + Bekleyen': (item.kalanMiktar + (item.alinanSiparis || 0) - (item.verilenSiparis || 0)),
    'Toplam Eksik': item.toplamEksik || 0,
    'Aylık Ort. Satış': item.aylikOrtalamaSatis,
    'Ort. Aylık Stok': item.ortalamaAylikStok,
    'Önerilen Sipariş': item.onerilenSiparis,
    'Hareket Durumu': item.hareketDurumu,
    'Devir Hızı (Gün)': item.devirHiziGun,
    'Mevsimsellik': item.mevsimselPattern || '-',
    'Son Hareket': item.sonHareketTarihi ? formatDate(new Date(item.sonHareketTarihi)) : '-'
  }))

  // Özet bilgileri
  const summary = [
    ['STOK ANALİZ RAPORU'],
    [''],
    ['Rapor Tarihi:', formatDate(new Date())],
    ['Toplam Ürün:', data.length],
    [''],
    ['ÖZET BİLGİLER'],
    ['Toplam Giriş:', data.reduce((sum, item) => sum + item.girisMiktari, 0)],
    ['Toplam Çıkış:', data.reduce((sum, item) => sum + item.cikisMiktari, 0)],
    ['Toplam Kalan:', data.reduce((sum, item) => sum + item.kalanMiktar, 0)],
    ['Toplam Önerilen:', data.reduce((sum, item) => sum + item.onerilenSiparis, 0)],
    [''],
    ['Kritik Stok Sayısı:', data.filter(item => item.ortalamaAylikStok < 1).length],
    ['Ölü Stok Sayısı:', data.filter(item => item.hareketDurumu === 'Ölü Stok').length],
    ['Aktif Ürün Sayısı:', data.filter(item => item.hareketDurumu === 'Aktif').length],
    [''],
    ['---']
  ]

  // Workbook oluştur
  const wb = XLSX.utils.book_new()
  
  // Özet sayfası
  const summaryWs = XLSX.utils.aoa_to_sheet(summary)
  XLSX.utils.book_append_sheet(wb, summaryWs, 'Özet')
  
  // Detay sayfası
  const detailWs = XLSX.utils.json_to_sheet(excelData)
  
  // Kolon genişliklerini ayarla
  const columnWidths = [
    { wch: 15 }, // Stok Kodu
    { wch: 40 }, // Stok İsmi
    { wch: 15 }, // Ana Grup
    { wch: 15 }, // Alt Grup
    { wch: 10 }, // Depo
    { wch: 12 }, // Giriş Miktarı
    { wch: 12 }, // Çıkış Miktarı
    { wch: 12 }, // Kalan Miktar
    { wch: 14 }, // Verilen Sipariş
    { wch: 14 }, // Alınan Sipariş
    { wch: 15 }, // Stok + Bekleyen
    { wch: 12 }, // Toplam Eksik
    { wch: 15 }, // Aylık Ort. Satış
    { wch: 15 }, // Ort. Aylık Stok
    { wch: 15 }, // Önerilen Sipariş
    { wch: 15 }, // Hareket Durumu
    { wch: 12 }, // Devir Hızı
    { wch: 12 }, // Mevsimsellik
    { wch: 10 }, // Risk Skoru
    { wch: 12 }, // Son Hareket
    { wch: 30 }  // Notlar
  ]
  detailWs['!cols'] = columnWidths
  
  XLSX.utils.book_append_sheet(wb, detailWs, 'Detay')
  
  // Kritik stoklar sayfası
  const criticalStocks = data.filter(item => item.ortalamaAylikStok < 1 && item.onerilenSiparis > 0)
  if (criticalStocks.length > 0) {
    const criticalData = criticalStocks.map(item => ({
      'Stok Kodu': item.stokKodu,
      'Stok İsmi': item.stokIsmi,
      'Kalan Miktar': item.kalanMiktar,
      'Aylık Satış': item.aylikOrtalamaSatis,
      'Kalan Ay': item.ortalamaAylikStok.toFixed(1),
      'Önerilen Sipariş': item.onerilenSiparis
    }))
    
    const criticalWs = XLSX.utils.json_to_sheet(criticalData)
    criticalWs['!cols'] = [
      { wch: 15 },
      { wch: 40 },
      { wch: 12 },
      { wch: 12 },
      { wch: 10 },
      { wch: 15 },
      { wch: 10 }
    ]
    XLSX.utils.book_append_sheet(wb, criticalWs, 'Kritik Stoklar')
  }
  
  // Mevsimsel analiz sayfası
  const seasonalStocks = data.filter(item => item.mevsimselPattern?.tip === 'Mevsimsel')
  if (seasonalStocks.length > 0) {
    const seasonalData = seasonalStocks.map(item => ({
      'Stok Kodu': item.stokKodu,
      'Stok İsmi': item.stokIsmi,
      'Mevsimsellik': item.mevsimselPattern?.tip || '-',
      'Değişkenlik': item.mevsimselPattern?.stdSapma?.toFixed(2) || '-',
      'En Yüksek Ay': item.mevsimselPattern?.maxAy || '-',
      'En Düşük Ay': item.mevsimselPattern?.minAy || '-',
      'Önerilen Sipariş': item.onerilenSiparis
    }))
    
    const seasonalWs = XLSX.utils.json_to_sheet(seasonalData)
    seasonalWs['!cols'] = [
      { wch: 15 },
      { wch: 40 },
      { wch: 12 },
      { wch: 12 },
      { wch: 12 },
      { wch: 12 },
      { wch: 15 }
    ]
    XLSX.utils.book_append_sheet(wb, seasonalWs, 'Mevsimsel Ürünler')
  }
  
  // Excel dosyasını indir
  const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' })
  const blob = new Blob([wbout], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
  saveAs(blob, `${filename}_${formatDate(new Date()).replace(/\//g, '-')}.xlsx`)
}

// Satın Alma Listesi Excel Export
export function exportPurchaseListToExcel(
  list: PurchaseList,
  filename?: string
) {
  const fileName = filename || `${list.name.replace(/[^a-z0-9]/gi, '_')}`
  
  // Liste başlık bilgileri
  const header = [
    ['SATIN ALMA LİSTESİ'],
    [''],
    ['Liste Adı:', list.name],
    ['Açıklama:', list.description || '-'],
    ['Durum:', getStatusText(list.status)],
    ['Öncelik:', getPriorityText(list.priority)],
    ['Oluşturma Tarihi:', formatDate(new Date(list.createdAt))],
    ['Güncelleme Tarihi:', formatDate(new Date(list.updatedAt))],
    [''],
    ['ÜRÜN LİSTESİ']
  ]
  
  // Ürün verileri
  const items = list.items.map((item, index) => ({
    'No': index + 1,
    'Stok Kodu': item.stokKodu,
    'Stok İsmi': item.stokIsmi,
    'Mevcut Stok': item.currentStock,
    'Önerilen': item.suggestedQuantity,
    'Sipariş Miktarı': item.quantity,
    'Birim': item.unit || 'Adet',
    'Tahmini Fiyat': item.estimatedPrice || 0,
    'Toplam': (item.estimatedPrice || 0) * item.quantity,
    'Öncelik': getPriorityText(item.priority),
    'Durum': getItemStatusText(item.status),
    'Notlar': item.notes || ''
  }))
  
  // Özet bilgiler
  const totalQuantity = list.items.reduce((sum, item) => sum + item.quantity, 0)
  const totalValue = list.items.reduce((sum, item) => sum + ((item.estimatedPrice || 0) * item.quantity), 0)
  
  const footer = [
    [''],
    ['ÖZET BİLGİLER'],
    ['Toplam Ürün Sayısı:', list.items.length],
    ['Toplam Miktar:', totalQuantity],
    ['Tahmini Toplam Değer:', `₺${formatNumber(totalValue)}`]
  ]
  
  // Workbook oluştur
  const wb = XLSX.utils.book_new()
  
  // Ana sayfa
  const ws = XLSX.utils.aoa_to_sheet(header)
  XLSX.utils.sheet_add_json(ws, items, { origin: 'A11', skipHeader: false })
  
  // Footer'ı ekle
  const lastRow = 11 + items.length + 2
  XLSX.utils.sheet_add_aoa(ws, footer, { origin: `A${lastRow}` })
  
  // Kolon genişlikleri
  ws['!cols'] = [
    { wch: 5 },  // No
    { wch: 15 }, // Stok Kodu
    { wch: 40 }, // Stok İsmi
    { wch: 12 }, // Mevcut Stok
    { wch: 10 }, // Önerilen
    { wch: 15 }, // Sipariş Miktarı
    { wch: 8 },  // Birim
    { wch: 12 }, // Tahmini Fiyat
    { wch: 15 }, // Toplam
    { wch: 10 }, // Öncelik
    { wch: 12 }, // Durum
    { wch: 30 }  // Notlar
  ]
  
  XLSX.utils.book_append_sheet(wb, ws, 'Satın Alma Listesi')
  
  // Excel dosyasını indir
  const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' })
  const blob = new Blob([wbout], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
  saveAs(blob, `${fileName}_${formatDate(new Date()).replace(/\//g, '-')}.xlsx`)
}

// Çoklu Liste Export
export function exportMultipleListsToExcel(
  lists: PurchaseList[],
  filename: string = 'satin-alma-listeleri'
) {
  const wb = XLSX.utils.book_new()
  
  // Özet sayfası
  const summaryData = lists.map(list => ({
    'Liste Adı': list.name,
    'Durum': getStatusText(list.status),
    'Öncelik': getPriorityText(list.priority),
    'Ürün Sayısı': list.items.length,
    'Toplam Miktar': list.items.reduce((sum, item) => sum + item.quantity, 0),
    'Tahmini Değer': list.items.reduce((sum, item) => sum + ((item.estimatedPrice || 0) * item.quantity), 0),
    'Oluşturma Tarihi': formatDate(new Date(list.createdAt))
  }))
  
  const summaryWs = XLSX.utils.json_to_sheet(summaryData)
  summaryWs['!cols'] = [
    { wch: 30 },
    { wch: 12 },
    { wch: 10 },
    { wch: 12 },
    { wch: 12 },
    { wch: 15 },
    { wch: 15 }
  ]
  XLSX.utils.book_append_sheet(wb, summaryWs, 'Özet')
  
  // Her liste için ayrı sayfa
  lists.forEach((list, index) => {
    const sheetName = `Liste ${index + 1}`
    
    const items = list.items.map((item, idx) => ({
      'No': idx + 1,
      'Stok Kodu': item.stokKodu,
      'Stok İsmi': item.stokIsmi,
      'Miktar': item.quantity,
      'Birim': item.unit || 'Adet',
      'Tahmini Fiyat': item.estimatedPrice || 0,
      'Toplam': (item.estimatedPrice || 0) * item.quantity
    }))
    
    const ws = XLSX.utils.json_to_sheet(items)
    ws['!cols'] = [
      { wch: 5 },
      { wch: 15 },
      { wch: 40 },
      { wch: 10 },
      { wch: 8 },
      { wch: 12 },
      { wch: 15 }
    ]
    
    XLSX.utils.book_append_sheet(wb, ws, sheetName)
  })
  
  // Excel dosyasını indir
  const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' })
  const blob = new Blob([wbout], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
  saveAs(blob, `${filename}_${formatDate(new Date()).replace(/\//g, '-')}.xlsx`)
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