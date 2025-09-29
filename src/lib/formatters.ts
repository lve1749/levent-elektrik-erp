export const formatNumber = (value: number): string => {
  return new Intl.NumberFormat('tr-TR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value)
}

export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value)
}

export const formatDate = (date: Date): string => {
  return new Intl.DateTimeFormat('tr-TR').format(date)
}

export const formatDateForSQL = (date: Date): string => {
  return date.toISOString().split('T')[0]
}

export const getMonthsBetweenDates = (start: Date, end: Date): number => {
  // Tarihlerin geçerliliğini kontrol et
  if (!start || !end || end < start) {
    return 1
  }
  
  // Ay farkını hesapla
  const yearDiff = end.getFullYear() - start.getFullYear()
  const monthDiff = end.getMonth() - start.getMonth()
  const dayDiff = end.getDate() - start.getDate()
  
  // Toplam ay sayısı
  let totalMonths = yearDiff * 12 + monthDiff
  
  // Eğer bitiş günü başlangıç gününden küçükse, bir ay eksilt
  if (dayDiff < 0) {
    totalMonths -= 1
  }
  
  // En az 1 ay döndür
  return Math.max(1, totalMonths + 1) // +1 çünkü başlangıç ayı da dahil
}

// YENİ: Mevcut tarih için hassas ay sayısı hesaplama
export const getCurrentMonthDecimal = (): number => {
  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth() + 1 // 0-indexed olduğu için +1
  const day = now.getDate()
  
  // Ayın toplam gün sayısını al
  const daysInMonth = new Date(year, month, 0).getDate()
  
  // Günü ondalık olarak hesapla
  const dayDecimal = day / daysInMonth
  
  // Ay + gün ondalığı
  return month + dayDecimal
}

// YENİ: Yılın başından bugüne kadar geçen ay sayısını hesapla
export const getMonthsFromYearStart = (): number => {
  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth() + 1 // 1-indexed (1=Ocak, 8=Ağustos)
  const day = now.getDate()
  
  // Bulunduğumuz ayın toplam gün sayısını al
  const daysInMonth = new Date(year, now.getMonth() + 1, 0).getDate()
  
  // Bulunduğumuz ay + günün ondalık kısmı
  // Örnek: 21 Ağustos = 8 + (21/31) = 8.677 ≈ 8.7
  const monthDecimal = month + (day / daysInMonth)
  
  // 1 ondalık basamağa yuvarla
  return Math.round(monthDecimal * 10) / 10
}

// YENİ: Önerilen sipariş için akıllı yuvarlama
export const roundOrderQuantity = (value: number): number => {
  // Negatif veya 0 değerler için
  if (value <= 0) return 0
  
  // 100'den küçük değerler için en yakın 10'a yuvarla
  if (value < 100) {
    return Math.ceil(value / 10) * 10
  }
  
  // 100-1000 arası değerler için en yakın 50'ye yuvarla
  if (value < 1000) {
    return Math.ceil(value / 50) * 50
  }
  
  // 1000-10000 arası değerler için en yakın 100'e yuvarla
  if (value < 10000) {
    return Math.ceil(value / 100) * 100
  }
  
  // 10000-100000 arası değerler için en yakın 500'e yuvarla
  if (value < 100000) {
    return Math.ceil(value / 500) * 500
  }
  
  // 100000'den büyük değerler için en yakın 1000'e yuvarla
  return Math.ceil(value / 1000) * 1000
}

// YENİ: Türkçe binlik ayırıcı formatlama (nokta ile)
export const formatOrderNumber = (value: number): string => {
  // Sayıyı string'e çevir ve tersine çevir
  const reversed = value.toString().split('').reverse()
  
  // Her 3 karakterde bir nokta ekle
  const withDots = reversed.reduce((acc, char, index) => {
    if (index > 0 && index % 3 === 0) {
      return char + '.' + acc
    }
    return char + acc
  }, '')
  
  return withDots
}

// YENİ: Önerilen sipariş hesaplama yardımcıları
export const calculateTargetMonths = (turnoverDays: number, movementStatus: string): number => {
  // Hareket durumuna göre kontrol
  if (movementStatus === 'Ölü Stok' || movementStatus === 'Durgun') {
    return 0
  }
  
  // Devir hızına göre hedef ay belirleme
  if (turnoverDays < 15) {
    return 1.5 // Hızlı dönen ürünler
  } else if (turnoverDays < 30) {
    return 2.5 // Normal dönen ürünler
  } else if (turnoverDays < 60) {
    return 1.5 // Yavaş dönen ürünler
  } else {
    return 1 // Çok yavaş dönen ürünler
  }
}

export const getOrderRecommendationReason = (
  monthlyAvgStock: number, 
  movementStatus: string,
  seasonalRisk?: number
): string => {
  if (movementStatus === 'Ölü Stok') {
    return 'Ölü stok - Sipariş önerilmez'
  }
  if (movementStatus === 'Durgun') {
    return 'Durgun stok - Sipariş önerilmez'
  }
  if (monthlyAvgStock < 0.5) {
    return 'Kritik stok seviyesi'
  }
  if (monthlyAvgStock < 1) {
    return 'Düşük stok seviyesi'
  }
  if (seasonalRisk && seasonalRisk > 70) {
    return 'Mevsimsel risk - Stok artırılmalı'
  }
  return 'Normal stok yenileme'
}