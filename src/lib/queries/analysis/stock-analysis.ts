/**
 * Stok Analiz Sorgusu
 * Giriş-Çıkış karşılaştırma raporunun ana sorgusu
 * Tüm CTE'leri birleştiren ve final sonucu üreten sorgu
 */

import { QueryParams, param, isNull, sqlGreatest } from '../types'
import { getStockMovementSummaryQuery, getMovementStatusCalculation, getMovementDaysCalculation, getTurnoverRateCalculation, getOutlierDetectionCTE } from '../base/stock-movements'
import { getPendingOrdersQuery, getStockOrderCalculations } from '../base/orders'
import { getMonthlyMovementAnalysisCTE, getSeasonalSummaryCTE, getSeasonalPatternType, getSeasonalRiskScore } from './seasonality'
import { getTargetMonthCalculation, getSuggestedOrderCalculation, getOrderReasonCalculation } from './order-suggestions'

/**
 * Ana stok analiz sorgusunu oluşturur
 * Tüm CTE'leri ve hesaplamaları birleştirir
 * GÜNCELLEME: Anormal hareket filtresi eklendi
 * @param params - Sorgu parametreleri
 * @param excludeOutliers - Anormal hareketleri hariç tut (varsayılan: true)
 */
export const getStockAnalysisQuery = (params: QueryParams, excludeOutliers: boolean = true) => {
  // Parametre indeksleri
  const p1 = param(1) // baslangicTarih
  const p2 = param(2) // bitisTarih
  const p3 = param(3) // anaGrup (opsiyonel)
  const aySayisiParam = params.anaGrup ? param(4) : param(3)
  
  // Ana CTE'ler
  const outlierCTE = excludeOutliers ? getOutlierDetectionCTE(params) : ''
  const stockMovementCTE = getStockMovementSummaryQuery(params, true, excludeOutliers)
  const monthlyAnalysisCTE = getMonthlyMovementAnalysisCTE(p1, p2, excludeOutliers)
  const seasonalSummaryCTE = getSeasonalSummaryCTE()
  const ordersCTE = getPendingOrdersQuery()
  
  return `
    WITH ${outlierCTE}
    StokHareketOzet AS (
      ${stockMovementCTE}
    ),
    -- Mevsimsellik Analizi (2025 yılı için)
    AylikHareketAnalizi AS (
      ${monthlyAnalysisCTE}
    ),
    MevsimselOzet AS (
      ${seasonalSummaryCTE}
    ),
    SiparisOzet AS (
      ${ordersCTE}
    )
    -- Ana Sorgu
    SELECT 
      -- Temel bilgiler [1-31]
      sho.sto_kod AS stokKodu,
      sho.sto_isim AS stokIsmi,
      sho.sto_anagrup_kod AS anaGrup,
      sho.sto_altgrup_kod AS altGrup,
      'Seçili tüm depolar' AS depo,
      
      -- Hareket miktarları [34-42]
      sho.giris_miktari AS girisMiktari,
      sho.cikis_miktari AS cikisMiktari,
      sho.kalan_miktar AS kalanMiktar,
      
      -- Sipariş bilgileri [45-48]
      ${isNull('so.verilen_siparis', 0)} AS verilenSiparis,
      ${isNull('so.alinan_siparis', 0)} AS alinanSiparis,
      ${getStockOrderCalculations()},
      
      -- Ortalama hesaplamalar [49-50]
      -- Aylık ortalama satış - ANORMAL HAREKETLER HARİÇ
      CASE 
        WHEN ${aySayisiParam} > 0 THEN sho.normal_cikis_miktari / ${aySayisiParam} 
        ELSE 0 
      END AS aylikOrtalamaSatis,
      
      -- Ortalama aylık stok - ANORMAL HAREKETLER HARİÇ hesaplanan satışa göre
      CASE 
        WHEN sho.normal_cikis_miktari > 0 AND ${aySayisiParam} > 0 
        THEN ((sho.kalan_miktar + ${isNull('so.verilen_siparis', 0)}) - ${isNull('so.alinan_siparis', 0)}) / (sho.normal_cikis_miktari / ${aySayisiParam})
        ELSE 0 
      END AS ortalamaAylikStok,
      
      -- YENİ: Önerilen Sipariş
      ${getSuggestedOrderCalculation(aySayisiParam)},
      ${getTargetMonthCalculation(aySayisiParam)},
      ${getOrderReasonCalculation(aySayisiParam)},
      
      -- Hareket tarihleri
      sho.son_hareket_tarihi AS sonHareketTarihi,
      sho.son_giris_tarihi AS sonGirisTarihi,
      sho.son_cikis_tarihi AS sonCikisTarihi,
      
      -- Hareket günleri
      ${getMovementDaysCalculation()},
      
      -- Devir hızı - NORMAL ÇIKIŞ MİKTARINA GÖRE
      CASE 
        WHEN sho.normal_cikis_miktari > 0 AND ${aySayisiParam} > 0 
        THEN (sho.kalan_miktar * 30) / (sho.normal_cikis_miktari / ${aySayisiParam})
        WHEN sho.kalan_miktar > 0 AND sho.normal_cikis_miktari = 0
        THEN NULL -- Satış yoksa ama stok varsa NULL döndür (badge'de "Hareketsiz" gösterilecek)
        ELSE 0 -- Stok da satış da yoksa 0
      END AS devirHiziGun,
      
      -- Hareket sıklığı
      sho.hareket_gun_sayisi AS hareketGunSayisi,
      sho.donem_giris_sayisi AS donemGirisSayisi,
      sho.donem_cikis_sayisi AS donemCikisSayisi,
      
      -- YENİ: Dönem bazlı çıkış sayıları
      sho.son_30_gun_cikis_sayisi AS son30GunCikisSayisi,
      sho.son_60_gun_cikis_sayisi AS son60GunCikisSayisi,
      sho.son_180_gun_cikis_sayisi AS son180GunCikisSayisi,
      sho.son_365_gun_cikis_sayisi AS son365GunCikisSayisi,
      
      -- Hareket durumu
      ${getMovementStatusCalculation()},
      
      -- Mevsimsellik verileri
      mo.std_sapma AS mevsimselStdSapma,
      mo.degiskenlik_katsayisi AS mevsimselDegiskenlik,
      mo.max_ay AS mevsimselMaxAy,
      mo.min_ay AS mevsimselMinAy,
      
      ${getSeasonalPatternType()},
      ${getSeasonalRiskScore(aySayisiParam)},
      
      -- YENİ: Anormal hareket bilgileri
      ${excludeOutliers ? `
      sho.anormal_hareket_sayisi AS anormalHareketSayisi,
      sho.anormal_miktar_toplam AS anormalMiktarToplam,
      
      -- PROJE BAZLI HAREKET BİLGİLERİ
      sho.proje_hareket_sayisi AS projeHareketSayisi,
      sho.proje_toplam_miktar AS projeToplamMiktar
      ` : ''}
      
    FROM StokHareketOzet sho
    LEFT JOIN SiparisOzet so ON sho.sto_kod = so.sip_stok_kod
    LEFT JOIN MevsimselOzet mo ON sho.sto_kod = mo.sth_stok_kod
    WHERE 
      -- Sadece hareketli stokları göster
      sho.giris_miktari > 0 OR sho.cikis_miktari > 0 OR sho.kalan_miktar != 0
    ORDER BY 
      sho.sto_kod
  `
}

/**
 * Filtrelenmiş stok analiz sorgusu
 * Ek filtreler (miktar, durum vb.) uygular
 * @param params - Sorgu parametreleri
 * @param filters - Ek filtreler
 * @param excludeOutliers - Anormal hareketleri hariç tut
 */
export const getFilteredStockAnalysisQuery = (
  params: QueryParams,
  filters?: {
    minQuantity?: number
    maxQuantity?: number
    stockStatus?: 'all' | 'critical' | 'low' | 'sufficient'
    movementStatus?: 'all' | 'active' | 'slow' | 'stagnant' | 'dead'
    hasOrder?: boolean
    onlyWithSuggestion?: boolean
    hasOutliers?: boolean // YENİ: Sadece anormal hareketi olanlar
    hasProjectMovements?: boolean // YENİ: Sadece proje hareketi olanlar
    anomalyType?: 'all' | 'project' | 'outlier' | 'both' // YENİ: Anormallik tipi filtresi
  },
  excludeOutliers: boolean = true
) => {
  let baseQuery = getStockAnalysisQuery(params, excludeOutliers)
  
  // WHERE koşullarını eklemek için sorguyu wrapper CTE içine al
  if (filters && Object.keys(filters).length > 0) {
    const conditions: string[] = []
    
    // Miktar filtreleri
    if (filters.minQuantity !== undefined) {
      conditions.push(`kalanMiktar >= ${filters.minQuantity}`)
    }
    if (filters.maxQuantity !== undefined) {
      conditions.push(`kalanMiktar <= ${filters.maxQuantity}`)
    }
    
    // Stok durumu filtresi
    if (filters.stockStatus && filters.stockStatus !== 'all') {
      switch (filters.stockStatus) {
        case 'critical':
          conditions.push(`ortalamaAylikStok BETWEEN 0 AND 1`)
          break
        case 'low':
          conditions.push(`ortalamaAylikStok BETWEEN 1.01 AND 2`)
          break
        case 'sufficient':
          conditions.push(`ortalamaAylikStok > 2`)
          break
      }
    }
    
    // Hareket durumu filtresi
    if (filters.movementStatus && filters.movementStatus !== 'all') {
      switch (filters.movementStatus) {
        case 'active':
          conditions.push(`hareketDurumu = 'Aktif'`)
          break
        case 'slow':
          conditions.push(`hareketDurumu = 'Yavaş'`)
          break
        case 'stagnant':
          conditions.push(`hareketDurumu = 'Durgun'`)
          break
        case 'dead':
          conditions.push(`hareketDurumu = 'Ölü Stok'`)
          break
      }
    }
    
    // Sipariş filtresi
    if (filters.hasOrder === true) {
      conditions.push(`(verilenSiparis > 0 OR alinanSiparis > 0)`)
    } else if (filters.hasOrder === false) {
      conditions.push(`verilenSiparis = 0 AND alinanSiparis = 0`)
    }
    
    // Sadece sipariş önerisi olanlar
    if (filters.onlyWithSuggestion === true) {
      conditions.push(`onerilenSiparis > 0`)
    }
    
    // YENİ: Anormal hareket filtresi
    if (filters.hasOutliers === true && excludeOutliers) {
      conditions.push(`anormalHareketSayisi > 0`)
    }
    
    // YENİ: Proje hareketi filtresi
    if (filters.hasProjectMovements === true && excludeOutliers) {
      conditions.push(`projeHareketSayisi > 0`)
    }
    
    // YENİ: Anormallik tipi filtresi
    if (filters.anomalyType && filters.anomalyType !== 'all' && excludeOutliers) {
      switch (filters.anomalyType) {
        case 'project':
          conditions.push(`projeHareketSayisi > 0 AND anormalHareketSayisi = 0`)
          break
        case 'outlier':
          conditions.push(`anormalHareketSayisi > 0 AND projeHareketSayisi = 0`)
          break
        case 'both':
          conditions.push(`projeHareketSayisi > 0 AND anormalHareketSayisi > 0`)
          break
      }
    }
    
    if (conditions.length > 0) {
      baseQuery = `
        WITH AnalysisResult AS (
          ${baseQuery}
        )
        SELECT * FROM AnalysisResult
        WHERE ${conditions.join(' AND ')}
        ORDER BY stokKodu
      `
    }
  }
  
  return baseQuery
}

/**
 * Stok analiz özet istatistiklerini getiren sorgu
 * Summary cards için kullanılır
 * @param params - Sorgu parametreleri
 * @param excludeOutliers - Anormal hareketleri hariç tut
 */
export const getStockAnalysisSummaryQuery = (params: QueryParams, excludeOutliers: boolean = true) => `
  WITH AnalysisData AS (
    ${getStockAnalysisQuery(params, excludeOutliers)}
  )
  SELECT 
    COUNT(*) as toplamStokSayisi,
    SUM(girisMiktari) as toplamGirisMiktari,
    SUM(cikisMiktari) as toplamCikisMiktari,
    SUM(kalanMiktar) as toplamKalanMiktar,
    SUM(verilenSiparis) as toplamVerilenSiparis,
    SUM(alinanSiparis) as toplamAlinanSiparis,
    SUM(CASE WHEN toplamEksik < 0 THEN 1 ELSE 0 END) as eksikStokSayisi,
    SUM(CASE WHEN ortalamaAylikStok < 1 THEN 1 ELSE 0 END) as kritikStokSayisi,
    SUM(CASE WHEN ortalamaAylikStok BETWEEN 1 AND 2 THEN 1 ELSE 0 END) as azStokSayisi,
    SUM(CASE WHEN ortalamaAylikStok > 2 THEN 1 ELSE 0 END) as yeterliStokSayisi,
    -- Yeni istatistikler
    SUM(CASE WHEN hareketDurumu = 'Aktif' THEN 1 ELSE 0 END) as aktifStokSayisi,
    SUM(CASE WHEN hareketDurumu = 'Ölü Stok' THEN 1 ELSE 0 END) as oluStokSayisi,
    SUM(CASE WHEN onerilenSiparis > 0 THEN 1 ELSE 0 END) as siparisCnerilensayisi,
    SUM(onerilenSiparis) as toplamOnerilenSiparis,
    SUM(CASE WHEN mevsimselPatternTip = 'Mevsimsel' THEN 1 ELSE 0 END) as mevsimselUrunSayisi,
    AVG(mevsimselRisk) as ortalamaRiskSkoru
    ${excludeOutliers ? `,
    -- Anormal hareket istatistikleri
    SUM(anormalHareketSayisi) as toplamAnormalHareket,
    SUM(anormalMiktarToplam) as toplamAnormalMiktar,
    COUNT(CASE WHEN anormalHareketSayisi > 0 THEN 1 END) as anormalHareketliUrunSayisi
    ` : ''}
  FROM AnalysisData
`