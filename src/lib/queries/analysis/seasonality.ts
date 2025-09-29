/**
 * Mevsimsellik Analizi Sorguları
 * Stokların mevsimsel hareketlerini analiz eden sorgular
 */

import { 
  TABLES, 
  COLUMNS, 
  DATABASE_SCHEMA,
  StokHareketTip,
  getValidMovementTypesSQL,
  param
} from '../types'

/**
 * Veritabanı tam yolu için yardımcı fonksiyon
 */
const getFullTableName = (tableName: string): string => {
  return `[${DATABASE_SCHEMA.name}].[${DATABASE_SCHEMA.schema}].[${tableName}]`
}

/**
 * Aylık hareket analizi CTE'si
 * 2025 yılı için aylık giriş/çıkış verilerini toplar
 * GÜNCELLEME: Anormal hareket filtresi eklendi
 * @param baslangicTarih - Başlangıç tarihi parametresi
 * @param bitisTarih - Bitiş tarihi parametresi
 * @param excludeOutliers - Anormal hareketleri hariç tut
 */
export const getMonthlyMovementAnalysisCTE = (baslangicTarih: string, bitisTarih: string, excludeOutliers: boolean = true) => {
  // Artık sadece fiyat farkı hariç kontrolü yapıyoruz
  return `
    SELECT 
      sh.${COLUMNS.HAREKET.STOK_KOD},
      MONTH(sh.${COLUMNS.HAREKET.TARIH}) as ay,
      SUM(CASE 
        WHEN sh.${COLUMNS.HAREKET.TIP} = ${StokHareketTip.GIRIS} 
          AND sh.${COLUMNS.HAREKET.CINS} != 9
        THEN sh.${COLUMNS.HAREKET.MIKTAR} 
        ELSE 0 
      END) as aylik_giris,
      SUM(CASE 
        WHEN sh.${COLUMNS.HAREKET.TIP} = ${StokHareketTip.CIKIS} 
          AND sh.${COLUMNS.HAREKET.CINS} != 9
          ${excludeOutliers ? `AND sh.${COLUMNS.HAREKET.MIKTAR} <= ISNULL(ho.ortalama_miktar + (3 * ho.standart_sapma), sh.${COLUMNS.HAREKET.MIKTAR})` : ''}
        THEN sh.${COLUMNS.HAREKET.MIKTAR} 
        ELSE 0 
      END) as aylik_cikis,
      COUNT(DISTINCT CASE 
        WHEN sh.${COLUMNS.HAREKET.CINS} != 9
          ${excludeOutliers ? `AND (
            sh.${COLUMNS.HAREKET.TIP} = ${StokHareketTip.GIRIS}
            OR sh.${COLUMNS.HAREKET.MIKTAR} <= ISNULL(ho.ortalama_miktar + (3 * ho.standart_sapma), sh.${COLUMNS.HAREKET.MIKTAR})
          )` : ''}
        THEN sh.${COLUMNS.HAREKET.TARIH}
        ELSE NULL
      END) as hareket_sayisi
    FROM ${getFullTableName(TABLES.STOK_HAREKETLERI)} sh
    ${excludeOutliers ? `LEFT JOIN HareketOrtalamalari ho 
      ON sh.${COLUMNS.HAREKET.STOK_KOD} = ho.${COLUMNS.HAREKET.STOK_KOD}` : ''}
    WHERE 
      YEAR(sh.${COLUMNS.HAREKET.TARIH}) = 2025
      AND sh.${COLUMNS.HAREKET.TARIH} BETWEEN ${baslangicTarih} AND ${bitisTarih}
    GROUP BY sh.${COLUMNS.HAREKET.STOK_KOD}, MONTH(sh.${COLUMNS.HAREKET.TARIH})
  `
}

/**
 * Mevsimsel özet CTE'si
 * Standart sapma ve değişkenlik katsayısı hesaplar
 */
export const getSeasonalSummaryCTE = () => `
  SELECT 
    aha.sth_stok_kod,
    -- Ortalama ve standart sapma
    AVG(aha.aylik_cikis) as ort_aylik_cikis,
    STDEV(aha.aylik_cikis) as std_sapma,
    -- En yüksek ve en düşük aylar
    (SELECT TOP 1 ay FROM AylikHareketAnalizi WHERE sth_stok_kod = aha.sth_stok_kod ORDER BY aylik_cikis DESC) as max_ay,
    (SELECT TOP 1 ay FROM AylikHareketAnalizi WHERE sth_stok_kod = aha.sth_stok_kod ORDER BY aylik_cikis ASC) as min_ay,
    -- Değişkenlik katsayısı
    CASE 
      WHEN AVG(aha.aylik_cikis) > 0 
      THEN STDEV(aha.aylik_cikis) / AVG(aha.aylik_cikis) 
      ELSE 0 
    END as degiskenlik_katsayisi
  FROM AylikHareketAnalizi aha
  GROUP BY aha.sth_stok_kod
`

/**
 * Mevsimsel pattern tipi hesaplama
 * Değişkenlik katsayısına göre stok hareketlerini sınıflandırır
 */
export const getSeasonalPatternType = () => `
  -- Mevsimsel pattern tipi
  CASE 
    WHEN mo.degiskenlik_katsayisi IS NULL OR mo.degiskenlik_katsayisi = 0 THEN 'Stabil'
    WHEN mo.degiskenlik_katsayisi > 0.5 THEN 'Mevsimsel'
    WHEN mo.degiskenlik_katsayisi > 0.3 THEN 'Düzensiz'
    ELSE 'Stabil'
  END AS mevsimselPatternTip
`

/**
 * Mevsimsel risk skoru hesaplama
 * 0-100 arası risk puanı verir
 */
export const getSeasonalRiskScore = (aySayisiParam: string) => `
  -- Risk skoru (0-100)
  CASE 
    WHEN mo.degiskenlik_katsayisi IS NULL THEN 0
    WHEN mo.degiskenlik_katsayisi > 0.7 AND sho.kalan_miktar / NULLIF(sho.cikis_miktari / ${aySayisiParam}, 0) < 2 THEN 90
    WHEN mo.degiskenlik_katsayisi > 0.5 AND sho.kalan_miktar / NULLIF(sho.cikis_miktari / ${aySayisiParam}, 0) < 2 THEN 70
    WHEN mo.degiskenlik_katsayisi > 0.3 AND sho.kalan_miktar / NULLIF(sho.cikis_miktari / ${aySayisiParam}, 0) < 3 THEN 50
    WHEN mo.degiskenlik_katsayisi > 0.2 THEN 30
    ELSE 10
  END AS mevsimselRisk
`

/**
 * Mevsimsellik faktörü hesaplama
 * Pik dönemlerde sipariş miktarını artırmak için kullanılır
 */
export const getSeasonalityFactor = () => `
  -- Mevsimsellik faktörü
  CASE 
    WHEN mo.degiskenlik_katsayisi > 0.5 AND MONTH(GETDATE()) IN (mo.max_ay - 1, mo.max_ay) THEN 1.5
    ELSE 1
  END
`

/**
 * Belirli bir stok için aylık hareket grafiği verisi
 * Frontend'de grafik çizimi için kullanılır
 * GÜNCELLEME: Anormal hareket filtresi eklendi
 * @param stokKodu - Stok kodu
 * @param yil - Analiz yılı (varsayılan: 2025)
 * @param excludeOutliers - Anormal hareketleri hariç tut
 */
export const getStockMonthlyChartData = (stokKodu: string, yil: number = 2025, excludeOutliers: boolean = true) => {
  return `
    ${excludeOutliers ? `WITH HareketOrtalamalari AS (
      SELECT 
        AVG(CAST(${COLUMNS.HAREKET.MIKTAR} AS FLOAT)) as ortalama_miktar,
        STDEV(${COLUMNS.HAREKET.MIKTAR}) as standart_sapma
      FROM ${getFullTableName(TABLES.STOK_HAREKETLERI)}
      WHERE ${COLUMNS.HAREKET.STOK_KOD} = ${param(1)}
        AND ${COLUMNS.HAREKET.TIP} = ${StokHareketTip.CIKIS}
        AND ${COLUMNS.HAREKET.CINS} != 9
        AND YEAR(${COLUMNS.HAREKET.TARIH}) = ${yil}
    )` : ''}
    SELECT 
      MONTH(${COLUMNS.HAREKET.TARIH}) as ay,
      SUM(CASE 
        WHEN ${COLUMNS.HAREKET.TIP} = ${StokHareketTip.GIRIS} 
          AND ${COLUMNS.HAREKET.CINS} != 9
        THEN ${COLUMNS.HAREKET.MIKTAR} 
        ELSE 0 
      END) as giris_miktari,
      SUM(CASE 
        WHEN ${COLUMNS.HAREKET.TIP} = ${StokHareketTip.CIKIS} 
          AND ${COLUMNS.HAREKET.CINS} != 9
          ${excludeOutliers ? `AND ${COLUMNS.HAREKET.MIKTAR} <= (SELECT ortalama_miktar + (3 * standart_sapma) FROM HareketOrtalamalari)` : ''}
        THEN ${COLUMNS.HAREKET.MIKTAR} 
        ELSE 0 
      END) as cikis_miktari,
      COUNT(DISTINCT CASE 
        WHEN ${COLUMNS.HAREKET.CINS} != 9
          ${excludeOutliers ? `AND (
            ${COLUMNS.HAREKET.TIP} = ${StokHareketTip.GIRIS}
            OR ${COLUMNS.HAREKET.MIKTAR} <= (SELECT ortalama_miktar + (3 * standart_sapma) FROM HareketOrtalamalari)
          )` : ''}
        THEN ${COLUMNS.HAREKET.TARIH}
        ELSE NULL
      END) as hareket_sayisi,
      AVG(CASE 
        WHEN ${COLUMNS.HAREKET.TIP} = ${StokHareketTip.GIRIS} 
          AND ${COLUMNS.HAREKET.CINS} != 9
        THEN ${COLUMNS.HAREKET.MIKTAR} 
        WHEN ${COLUMNS.HAREKET.TIP} = ${StokHareketTip.CIKIS} 
          AND ${COLUMNS.HAREKET.CINS} != 9
          ${excludeOutliers ? `AND ${COLUMNS.HAREKET.MIKTAR} <= (SELECT ortalama_miktar + (3 * standart_sapma) FROM HareketOrtalamalari)` : ''}
        THEN -${COLUMNS.HAREKET.MIKTAR} 
        ELSE 0 
      END) as ortalama_stok
    FROM ${getFullTableName(TABLES.STOK_HAREKETLERI)}
    WHERE 
      ${COLUMNS.HAREKET.STOK_KOD} = ${param(1)}
      AND YEAR(${COLUMNS.HAREKET.TARIH}) = ${yil}
    GROUP BY MONTH(${COLUMNS.HAREKET.TARIH})
    ORDER BY MONTH(${COLUMNS.HAREKET.TARIH})
  `
}

/**
 * Mevsimsel tahmin hesaplama
 * Geçmiş verilere göre gelecek ay tahmini
 */
export const getSeasonalForecast = (currentMonth: number) => `
  -- Gelecek ay tahmini
  WITH AylikOrtalamalar AS (
    SELECT 
      ay,
      AVG(aylik_cikis) as ort_cikis
    FROM AylikHareketAnalizi
    GROUP BY ay
  )
  SELECT 
    CASE 
      WHEN ${currentMonth} = 12 THEN 
        (SELECT ort_cikis FROM AylikOrtalamalar WHERE ay = 1)
      ELSE 
        (SELECT ort_cikis FROM AylikOrtalamalar WHERE ay = ${currentMonth + 1})
    END as gelecek_ay_tahmini
`