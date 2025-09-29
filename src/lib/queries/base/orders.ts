/**
 * Sipariş Sorguları
 * Alış ve satış siparişleri ile ilgili temel sorgular
 * Mikro ERP'de fn_Depodaki_Siparis_Miktar fonksiyonunun alternatifi
 */

import { 
  TABLES, 
  COLUMNS, 
  SiparisTip,
  param,
  isNull
} from '../types'

/**
 * Bekleyen (açık) siparişleri getiren sorgu
 * Teslim edilmemiş sipariş miktarlarını hesaplar
 * Ana stok analiz raporunda SiparisOzet CTE'si olarak kullanılır
 * GÜNCELLEME: Sadece son 1 yıl içindeki siparişleri alır
 */
export const getPendingOrdersQuery = () => `
  SELECT 
    ${COLUMNS.SIPARIS.STOK_KOD} as sip_stok_kod,
    -- [45] Verilen Sipariş (Tedarikçiye verilen sipariş - stoka girecek)
    SUM(CASE 
      WHEN ${COLUMNS.SIPARIS.TIP} = ${SiparisTip.SATIS} 
      THEN ${COLUMNS.SIPARIS.MIKTAR} - ${COLUMNS.SIPARIS.TESLIM_MIKTAR}
      ELSE 0 
    END) AS verilen_siparis,
    -- [46] Alınan Sipariş (Müşteriden alınan sipariş - stoktan çıkacak)
    SUM(CASE 
      WHEN ${COLUMNS.SIPARIS.TIP} = ${SiparisTip.ALIS}
      THEN ${COLUMNS.SIPARIS.MIKTAR} - ${COLUMNS.SIPARIS.TESLIM_MIKTAR}
      ELSE 0 
    END) AS alinan_siparis
  FROM ${TABLES.SIPARISLER}
  WHERE 
    ${COLUMNS.SIPARIS.MIKTAR} > ${COLUMNS.SIPARIS.TESLIM_MIKTAR} -- Açık siparişler
    AND ${COLUMNS.SIPARIS.TIP} IN (${SiparisTip.ALIS}, ${SiparisTip.SATIS})
    -- YENİ: Sadece son 1 yıl içindeki siparişler (eski siparişleri hariç tut)
    AND ${COLUMNS.SIPARIS.TARIH} >= DATEADD(YEAR, -1, GETDATE())
    -- YENİ: Kapatılmış veya iptal edilmiş siparişleri hariç tut
    AND ${COLUMNS.SIPARIS.KAPAT_FL} = 0
    AND ${COLUMNS.SIPARIS.IPTAL} = 0
  GROUP BY ${COLUMNS.SIPARIS.STOK_KOD}
`

/**
 * Belirli bir stok için bekleyen siparişleri detaylı getiren sorgu
 * @param stokKodu - Stok kodu
 * @param siparisTipi - Sipariş tipi (0: Alış, 1: Satış, null: Tümü)
 */
export const getStockPendingOrdersDetailQuery = (stokKodu: string, siparisTipi?: number | null) => `
  SELECT 
    ${COLUMNS.SIPARIS.TARIH} as siparisTarihi,
    ${COLUMNS.SIPARIS.TIP} as siparisTipi,
    CASE 
      WHEN ${COLUMNS.SIPARIS.TIP} = ${SiparisTip.ALIS} THEN 'Alış'
      WHEN ${COLUMNS.SIPARIS.TIP} = ${SiparisTip.SATIS} THEN 'Satış'
    END as tipAdi,
    ${COLUMNS.SIPARIS.MIKTAR} as siparisMiktari,
    ${COLUMNS.SIPARIS.TESLIM_MIKTAR} as teslimMiktari,
    ${COLUMNS.SIPARIS.MIKTAR} - ${COLUMNS.SIPARIS.TESLIM_MIKTAR} as bekleyenMiktar,
    ${COLUMNS.SIPARIS.BELGE_NO} as belgeNo,
    ${COLUMNS.SIPARIS.ACIKLAMA} as aciklama
  FROM ${TABLES.SIPARISLER}
  WHERE 
    ${COLUMNS.SIPARIS.STOK_KOD} = ${param(1)}
    AND ${COLUMNS.SIPARIS.MIKTAR} > ${COLUMNS.SIPARIS.TESLIM_MIKTAR}
    ${siparisTipi !== null && siparisTipi !== undefined ? `AND ${COLUMNS.SIPARIS.TIP} = ${siparisTipi}` : ''}
    -- YENİ: Sadece son 1 yıl içindeki siparişler
    AND ${COLUMNS.SIPARIS.TARIH} >= DATEADD(YEAR, -1, GETDATE())
    -- YENİ: Kapatılmış veya iptal edilmiş siparişleri hariç tut
    AND ${COLUMNS.SIPARIS.KAPAT_FL} = 0
    AND ${COLUMNS.SIPARIS.IPTAL} = 0
  ORDER BY ${COLUMNS.SIPARIS.TARIH} DESC
`

/**
 * Stok bazında toplam bekleyen sipariş hesaplama
 * Stok + Bekleyen ve Toplam Eksik hesaplamalarında kullanılır
 */
export const getStockOrderCalculations = () => `
  -- [47] STOK + BEKLEYEN = Kalan Miktar + Tedarikçi Siparişi (Verilen Sipariş)
  kalan_miktar + ${isNull('verilen_siparis', 0)} AS stokBekleyen,
  
  -- [48] TOPLAM EKSİK = (Kalan Miktar + Tedarikçi Siparişi) - Müşteri Siparişi
  -- Net kullanılabilir stok = Mevcut + Gelecek - Gidecek
  (kalan_miktar + ${isNull('verilen_siparis', 0)}) - ${isNull('alinan_siparis', 0)} AS toplamEksik
`

/**
 * Sipariş karşılama oranını hesaplayan sorgu
 * @param stokKodu - Stok kodu (opsiyonel)
 * @param baslangic - Başlangıç tarihi
 * @param bitis - Bitiş tarihi
 */
export const getOrderFulfillmentRateQuery = (stokKodu?: string, baslangic?: string, bitis?: string) => `
  SELECT 
    ${!stokKodu ? `${COLUMNS.SIPARIS.STOK_KOD} as stokKodu,` : ''}
    ${COLUMNS.SIPARIS.TIP} as siparisTipi,
    COUNT(*) as toplamSiparis,
    SUM(CASE 
      WHEN ${COLUMNS.SIPARIS.MIKTAR} = ${COLUMNS.SIPARIS.TESLIM_MIKTAR}
      THEN 1 
      ELSE 0 
    END) as tamamlananSiparis,
    SUM(${COLUMNS.SIPARIS.MIKTAR}) as toplamSiparisMiktari,
    SUM(${COLUMNS.SIPARIS.TESLIM_MIKTAR}) as toplamTeslimMiktari,
    CAST(
      SUM(CASE 
        WHEN ${COLUMNS.SIPARIS.MIKTAR} = ${COLUMNS.SIPARIS.TESLIM_MIKTAR}
        THEN 1.0 
        ELSE 0.0 
      END) * 100.0 / NULLIF(COUNT(*), 0) AS DECIMAL(5,2)
    ) as karsilamaOrani
  FROM ${TABLES.SIPARISLER}
  WHERE 1=1
    ${stokKodu ? `AND ${COLUMNS.SIPARIS.STOK_KOD} = ${param(1)}` : ''}
    ${baslangic && bitis ? `AND ${COLUMNS.SIPARIS.TARIH} BETWEEN ${param(stokKodu ? 2 : 1)} AND ${param(stokKodu ? 3 : 2)}` : ''}
  GROUP BY ${!stokKodu ? `${COLUMNS.SIPARIS.STOK_KOD},` : ''} ${COLUMNS.SIPARIS.TIP}
`

/**
 * Tarih aralığına göre sipariş özeti
 * Grup bazında sipariş analizinde kullanılır
 * @param baslangic - Başlangıç tarihi
 * @param bitis - Bitiş tarihi
 * @param anaGrup - Ana grup kodu (opsiyonel)
 */
export const getOrderSummaryByDateQuery = (baslangic: string, bitis: string, anaGrup?: string | null) => `
  SELECT 
    s.${COLUMNS.STOK.KOD} as stokKodu,
    s.${COLUMNS.STOK.ISIM} as stokIsmi,
    COUNT(DISTINCT sip.${COLUMNS.SIPARIS.TARIH}) as siparisSayisi,
    SUM(CASE 
      WHEN sip.${COLUMNS.SIPARIS.TIP} = ${SiparisTip.ALIS}
      THEN sip.${COLUMNS.SIPARIS.MIKTAR}
      ELSE 0 
    END) AS toplamAlisSiparis,
    SUM(CASE 
      WHEN sip.${COLUMNS.SIPARIS.TIP} = ${SiparisTip.SATIS}
      THEN sip.${COLUMNS.SIPARIS.MIKTAR}
      ELSE 0 
    END) AS toplamSatisSiparis,
    -- Bekleyen siparişler
    SUM(CASE 
      WHEN sip.${COLUMNS.SIPARIS.TIP} = ${SiparisTip.ALIS}
        AND sip.${COLUMNS.SIPARIS.MIKTAR} > sip.${COLUMNS.SIPARIS.TESLIM_MIKTAR}
      THEN sip.${COLUMNS.SIPARIS.MIKTAR} - sip.${COLUMNS.SIPARIS.TESLIM_MIKTAR}
      ELSE 0 
    END) AS bekleyenAlisSiparis,
    SUM(CASE 
      WHEN sip.${COLUMNS.SIPARIS.TIP} = ${SiparisTip.SATIS}
        AND sip.${COLUMNS.SIPARIS.MIKTAR} > sip.${COLUMNS.SIPARIS.TESLIM_MIKTAR}
      THEN sip.${COLUMNS.SIPARIS.MIKTAR} - sip.${COLUMNS.SIPARIS.TESLIM_MIKTAR}
      ELSE 0 
    END) AS bekleyenSatisSiparis
  FROM ${TABLES.SIPARISLER} sip
  INNER JOIN ${TABLES.STOKLAR} s ON sip.${COLUMNS.SIPARIS.STOK_KOD} = s.${COLUMNS.STOK.KOD}
  WHERE 
    sip.${COLUMNS.SIPARIS.TARIH} BETWEEN ${param(1)} AND ${param(2)}
    ${anaGrup ? `AND s.${COLUMNS.STOK.ANAGRUP_KOD} = ${param(3)}` : ''}
  GROUP BY s.${COLUMNS.STOK.KOD}, s.${COLUMNS.STOK.ISIM}
  ORDER BY s.${COLUMNS.STOK.KOD}
`