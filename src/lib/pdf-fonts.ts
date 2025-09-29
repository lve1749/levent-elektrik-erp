import { jsPDF } from 'jspdf'

// Inter font için Base64 string'i dinamik olarak yükleyeceğiz
let interFontBase64: string | null = null

export async function loadInterFont(): Promise<string> {
  if (interFontBase64) return interFontBase64
  
  try {
    // Font dosyasını fetch et
    const response = await fetch('/fonts/Inter-Regular.woff2')
    const blob = await response.blob()
    
    // Blob'u Base64'e çevir
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onloadend = () => {
        const base64 = reader.result as string
        // Data URL'den Base64 kısmını ayır
        interFontBase64 = base64.split(',')[1]
        resolve(interFontBase64)
      }
      reader.onerror = reject
      reader.readAsDataURL(blob)
    })
  } catch (error) {
    console.error('Font yükleme hatası:', error)
    throw error
  }
}

export async function addInterFontToPDF(doc: jsPDF) {
  try {
    const fontBase64 = await loadInterFont()
    
    // Font'u PDF'e ekle
    doc.addFileToVFS('Inter-Regular.ttf', fontBase64)
    doc.addFont('Inter-Regular.ttf', 'Inter', 'normal')
    
    // Font'u varsayılan yap
    doc.setFont('Inter', 'normal')
    
    return true
  } catch (error) {
    console.error('PDF font ekleme hatası:', error)
    // Hata durumunda varsayılan font'a dön
    doc.setFont('helvetica', 'normal')
    return false
  }
}

// Türkçe karakterleri kontrol et ve gerekirse düzelt
export function sanitizeTurkishText(text: string): string {
  // Font yüklenemediyse karakterleri değiştir
  if (!interFontBase64) {
    return text
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
  }
  // Font yüklendiyse olduğu gibi döndür
  return text
}