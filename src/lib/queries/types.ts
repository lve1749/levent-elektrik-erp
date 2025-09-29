/**
 * SQL Sorgu Tip Tanımlamaları
 * Mikro ERP veritabanı için tüm SQL sorgularında kullanılan ortak tipler
 */

/**
 * Veritabanı şema bilgileri
 */
export const DATABASE_SCHEMA = {
  name: 'MikroDB_V16_LEVENT2025',
  schema: 'dbo'
} as const

/**
 * Temel sorgu parametreleri
 */
export interface QueryParams {
  baslangicTarih: string  // YYYY-MM-DD formatında
  bitisTarih: string      // YYYY-MM-DD formatında
  anaGrup?: string | null // Opsiyonel ana grup kodu
  altGrup?: string | null // Opsiyonel alt grup kodu
  depo?: string | null    // Opsiyonel depo kodu
  aySayisi: number        // Ortalama hesaplama için ay sayısı
}

/**
 * SQL sorgu parçası
 */
export interface SQLFragment {
  query: string
  params?: any[]
}

/**
 * Stok hareket tipleri (sth_tip)
 */
export enum StokHareketTip {
  GIRIS = 0,
  CIKIS = 1
}

/**
 * Stok hareket cinsleri (sth_cins)
 * GÜNCELLEME: Gerçek Mikro değerleri eklendi
 */
export enum StokHareketCins {
  SATIS = 0,        // Normal satış/alış
  ALIS = 1,         // (Kullanılmıyor)
  DEGISIM = 3,      // Ürün değişimi
  DEVIR = 6,        // Depolar arası sevk
  URETIM = 7,       // (Kullanılmıyor)
  FIYAT_FARKI = 9,  // Fiyat farkı (miktar hareketi değil!)
  SAYIM_1 = 10,     // Sayım hareketi
  SAYIM_2 = 11      // Sayım/Devir hareketi
}

/**
 * Sipariş tipleri (sip_tip)
 */
export enum SiparisTip {
  ALIS = 0,
  SATIS = 1
}

/**
 * Hareket durumu kategorileri
 */
export type HareketDurumu = 'Aktif' | 'Yavaş' | 'Durgun' | 'Ölü Stok'

/**
 * Mevsimsel pattern tipleri
 */
export type MevsimselPatternTip = 'Stabil' | 'Mevsimsel' | 'Düzensiz'

/**
 * Tablo isimleri - Mikro ERP
 * Not: Veritabanı adı Prisma connection string'de belirtildiği için tekrar yazmıyoruz
 */
export const TABLES = {
  STOKLAR: 'STOKLAR',
  STOK_HAREKETLERI: 'STOK_HAREKETLERI',
  SIPARISLER: 'SIPARISLER',
  DEPOLAR: 'DEPOLAR',
  STOK_GRUP_KODLARI: 'STOK_GRUP_KODLARI'
} as const

/**
 * Kolon isimleri mapping - Mikro ERP'deki gerçek kolon isimleri
 */
export const COLUMNS = {
  STOK: {
    KOD: 'sto_kod',
    ISIM: 'sto_isim',
    ANAGRUP_KOD: 'sto_anagrup_kod',
    ALTGRUP_KOD: 'sto_altgrup_kod',
    BIRIM1_AD: 'sto_birim1_ad',
    BIRIM2_AD: 'sto_birim2_ad',
    BIRIM3_AD: 'sto_birim3_ad'
  },
  HAREKET: {
    STOK_KOD: 'sth_stok_kod',
    TARIH: 'sth_tarih',
    TIP: 'sth_tip',
    CINS: 'sth_cins',
    MIKTAR: 'sth_miktar',
    EVRAK_TIP: 'sth_evraktip',
    NORMAL_IADE: 'sth_normal_iade',
    BELGE_NO: 'sth_belge_no',
    ACIKLAMA: 'sth_aciklama',
    PROJE_KODU: 'sth_proje_kodu',
    CARI_KODU: 'sth_cari_kodu',
    EVRAKNO_SERI: 'sth_evrakno_seri',
    EVRAKNO_SIRA: 'sth_evrakno_sira',
    TUTAR: 'sth_tutar',
    ISKONTO1: 'sth_iskonto1',
    ISKONTO2: 'sth_iskonto2'
  },
  SIPARIS: {
    STOK_KOD: 'sip_stok_kod',
    TIP: 'sip_tip',
    MIKTAR: 'sip_miktar',
    TESLIM_MIKTAR: 'sip_teslim_miktar',
    TARIH: 'sip_tarih',
    BELGE_NO: 'sip_belge_no',
    ACIKLAMA: 'sip_aciklama',
    IPTAL: 'sip_iptal',
    KAPAT_FL: 'sip_kapat_fl',
    KAPATMA_NEDEN_KOD: 'sip_kapatmanedenkod'
  }
} as const

/**
 * Geçerli hareket cinsleri (Satış/Alış hareketleri)
 * GÜNCELLEME: Fiyat farkı hariç tüm hareketler dahil
 */
export const VALID_MOVEMENT_TYPES = [0, 1, 3, 6, 7, 10, 11] as const

/**
 * Hareket cinsi kontrol fonksiyonu
 */
export const isValidMovementType = (cins: number): boolean => {
  return VALID_MOVEMENT_TYPES.includes(cins as any)
}

/**
 * SQL Server GREATEST fonksiyonu alternatifi
 * SQL Server'da GREATEST yoktur, CASE ile simüle edilir
 */
export const sqlGreatest = (value1: string, value2: string | number): string => {
  return `CASE WHEN ${value1} > ${value2} THEN ${value1} ELSE ${value2} END`
}

/**
 * Parametreli sorgu için placeholder oluşturur
 * @param index - Parametre indeksi (1'den başlar)
 */
export const param = (index: number): string => `@P${index}`

/**
 * Tarih formatı dönüştürücü
 * JavaScript Date'i SQL Server formatına çevirir
 */
export const formatDateForSQL = (date: Date | string): string => {
  if (typeof date === 'string') return date
  return date.toISOString().split('T')[0]
}

/**
 * NULL kontrolü için yardımcı
 */
export const isNull = (column: string, defaultValue: any = 0): string => {
  return `ISNULL(${column}, ${defaultValue})`
}

/**
 * Geçerli hareket cinsleri listesi SQL için
 * GÜNCELLEME: Artık sadece 9 (fiyat farkı) hariç kontrolü yapıyoruz
 */
export const getValidMovementTypesSQL = (): string => {
  // Eski sistem için uyumluluk
  return VALID_MOVEMENT_TYPES.join(',')
}

/**
 * SQL injection koruması için değer temizleme
 * @param value - Temizlenecek değer
 */
export const sanitizeParam = (value: any): string => {
  if (value === null || value === undefined) return 'NULL'
  
  if (typeof value === 'boolean') {
    return value ? '1' : '0'
  }
  
  if (typeof value === 'number') {
    return value.toString()
  }
  
  if (value instanceof Date) {
    return `'${formatDateForSQL(value)}'`
  }
  
  if (typeof value === 'string') {
    // Tek tırnakları escape et
    const escaped = value.replace(/'/g, "''")
    return `'${escaped}'`
  }
  
  return 'NULL'
}