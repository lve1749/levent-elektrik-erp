// Stok Analiz Raporu Types
export interface StokAnalizRaporu {
  stokKodu: string
  stokIsmi: string
  anaGrup: string | null
  altGrup: string | null
  depo: string
  girisMiktari: number
  cikisMiktari: number
  kalanMiktar: number
  verilenSiparis: number
  alinanSiparis: number
  stokBekleyen: number // [47] STOK + BEKLEYEN
  toplamEksik: number  // [48] TOPLAM EKSİK
  aylikOrtalamaSatis: number // [49]
  ortalamaAylikStok: number  // [50]
  
  // YENİ: Önerilen Sipariş
  onerilenSiparis: number // Hesaplanan sipariş önerisi
  hedefAy: number // Kullanılan hedef ay sayısı
  siparisNedeni?: string // Sipariş önerisi açıklaması
  
  // YENİ: Hareket tarihleri
  sonHareketTarihi: Date | null
  sonGirisTarihi: Date | null
  sonCikisTarihi: Date | null
  
  // YENİ: Hareket gün sayıları
  sonHareketGun: number | null
  sonGirisGun: number | null
  sonCikisGun: number | null
  
  // YENİ: Devir hızı ve hareket sıklığı
  devirHiziGun: number // Stok kaç günde bitiyor
  hareketGunSayisi: number // Toplam hareket yapılan gün sayısı
  donemGirisSayisi: number // Dönem içi giriş sayısı
  donemCikisSayisi: number // Dönem içi çıkış sayısı
  
  // YENİ: Dönem bazlı çıkış sayıları
  son30GunCikisSayisi?: number // Son 30 gün içindeki çıkış hareket sayısı
  son60GunCikisSayisi?: number // Son 60 gün içindeki çıkış hareket sayısı
  son180GunCikisSayisi?: number // Son 180 gün içindeki çıkış hareket sayısı
  son365GunCikisSayisi?: number // Son 365 gün içindeki çıkış hareket sayısı
  
  // YENİ: Hareket durumu kategorisi
  hareketDurumu: 'Aktif' | 'Yavaş' | 'Durgun' | 'Ölü Stok'
  
  // YENİ: Mevsimsellik analizi
  aylikHareketler?: AylikHareket[]
  mevsimselPattern?: MevsimselPattern
  mevsimselRisk?: number // 0-100 arası risk skoru
  pikDonemi?: string // Örn: "Temmuz-Ağustos"
  mevsimselOneri?: string
}

export interface AylikHareket {
  ay: number // 1-12
  girisMiktari: number
  cikisMiktari: number
  ortalamaStok: number
  hareketSayisi: number
}

export interface MevsimselPattern {
  tip: 'Stabil' | 'Mevsimsel' | 'Trend' | 'Düzensiz'
  mevsimselIndeks: number[] // 12 aylık indeks (1.0 = normal)
  stdSapma: number
  maxAy: number // En yüksek hareketin olduğu ay
  minAy: number // En düşük hareketin olduğu ay
}

export interface AnalizFiltre {
  baslangicTarihi: Date
  bitisTarihi: Date
  anaGrupKodu?: string | null
  aySayisi: number
}

export interface GrupBilgisi {
  grupKodu: string
  grupIsmi: string
}

export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  count?: number
}

// YENİ: Stok Uyarı Tipleri
export interface StockAlert {
  id: string // alert-{stokKodu}-{timestamp}
  stokKodu: string
  stokIsmi: string
  anaGrupKodu?: string
  alertDate: Date
  severity: 'critical' | 'high' | 'medium'
  status: 'active' | 'read' | 'dismissed'
  data: {
    kalanMiktar: number
    aylikOrtalamaSatis: number
    onerilenSiparis: number
    ortalamaAylikStok: number
    hareketDurumu: 'Aktif' | 'Yavaş' | 'Durgun' | 'Ölü Stok'
  }
  notes?: StockAlertNote[]
}

export interface StockAlertNote {
  id: string
  text: string
  createdAt: Date
  createdBy?: string // İleride kullanıcı sistemi eklenirse
}

export interface AlertStats {
  total: number
  unread: number
  critical: number
  high: number
  medium: number
}

// LocalStorage yapıları
export interface ReadAlertRecord {
  alertId: string
  stokKodu: string
  readDate: string // ISO string
}

export interface DismissedAlertRecord {
  stokKodu: string
  dismissDate: string // ISO string
  reason?: string // Opsiyonel: neden silindi
}

export interface AlertHistoryRecord {
  alertId: string
  stokKodu: string
  action: 'created' | 'read' | 'dismissed' | 'note_added'
  timestamp: string // ISO string
  details?: any
}