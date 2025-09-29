/**
 * Stok Hareket Sorguları
 * Stok giriş/çıkış hareketleri ile ilgili temel sorgular
 * İADE MANTIĞI: Mikro'nun mantığına göre düzeltildi
 * - İadeler ana hareketin düzeltmesi olarak işlenir
 * - Satış iadesi (tip=0, cins=0, iade=1) → Çıkıştan düşülür
 * - Alış iadesi (tip=1, cins=0, iade=1) → Girişten düşülür
 */

import { 
  TABLES, 
  COLUMNS, 
  QueryParams, 
  StokHareketTip,
  StokHareketCins,
  DATABASE_SCHEMA,
  param,
  isNull
} from '../types'

/**
 * Veritabanı tam yolu için yardımcı fonksiyon
 */
const getFullTableName = (tableName: string): string => {
  return `[${DATABASE_SCHEMA.name}].[${DATABASE_SCHEMA.schema}].[${tableName}]`
}

/**
 * Anormal hareket tespiti için CTE
 * 3-Sigma kuralı kullanılır (Ortalama + 3 × Standart Sapma)
 * GÜNCELLEME: Proje kodlu hareketler istatistikten hariç tutulur
 * @param params - Sorgu parametreleri
 * @param excludeProjectCode - Hariç tutulacak proje kodu (default: 'P')
 */
export const getOutlierDetectionCTE = (params: QueryParams, excludeProjectCode: string = 'P') => {
  return `
    -- Anormal hareket tespiti için istatistiksel hesaplama (3-Sigma kuralı)
    -- Proje kodlu hareketler istatistikten hariç tutulur
    HareketOrtalamalari AS (
      SELECT 
        ${COLUMNS.HAREKET.STOK_KOD},
        AVG(CAST(${COLUMNS.HAREKET.MIKTAR} AS FLOAT)) as ortalama_miktar,
        STDEV(${COLUMNS.HAREKET.MIKTAR}) as standart_sapma,
        COUNT(*) as hareket_sayisi
      FROM ${getFullTableName(TABLES.STOK_HAREKETLERI)}
      WHERE ${COLUMNS.HAREKET.TIP} = ${StokHareketTip.CIKIS}
        AND ${COLUMNS.HAREKET.CINS} != 9
        AND ISNULL(${COLUMNS.HAREKET.NORMAL_IADE}, 0) = 0  -- İade olmayan normal çıkışlar
        AND ${COLUMNS.HAREKET.TARIH} BETWEEN ${param(1)} AND ${param(2)}
        -- Proje kodlu hareketleri istatistikten hariç tut (sabit değer olarak 'P' kullan)
        AND (${COLUMNS.HAREKET.PROJE_KODU} IS NULL OR ${COLUMNS.HAREKET.PROJE_KODU} != 'P')
        ${params.anaGrup ? `AND EXISTS (
          SELECT 1 FROM ${getFullTableName(TABLES.STOKLAR)} s
          WHERE s.${COLUMNS.STOK.KOD} = ${COLUMNS.HAREKET.STOK_KOD}
            AND s.${COLUMNS.STOK.ANAGRUP_KOD} = ${param(3)}
        )` : ''}
      GROUP BY ${COLUMNS.HAREKET.STOK_KOD}
    ),
  `
}

export const getStockMovementSummaryQuery = (
  params: QueryParams, 
  includeExtendedInfo: boolean = false,
  excludeOutliers: boolean = true
) => {
  return `
    SELECT 
      s.${COLUMNS.STOK.KOD},
      s.${COLUMNS.STOK.ISIM},
      s.${COLUMNS.STOK.ANAGRUP_KOD},
      s.${COLUMNS.STOK.ALTGRUP_KOD},
      
      -- [34] Giriş Miktarı (MİKRO MANTIĞI: Alış iadesi girişten düşülür)
      ${isNull(`SUM(CASE 
        -- Normal giriş hareketleri
        WHEN sh.${COLUMNS.HAREKET.TIP} = ${StokHareketTip.GIRIS} 
          AND sh.${COLUMNS.HAREKET.CINS} != 9
          AND ISNULL(sh.${COLUMNS.HAREKET.NORMAL_IADE}, 0) = 0
          AND sh.${COLUMNS.HAREKET.TARIH} BETWEEN ${param(1)} AND ${param(2)}
        THEN sh.${COLUMNS.HAREKET.MIKTAR}
        -- Alış iadesi (tip=1, cins=0, iade=1) → GİRİŞTEN DÜŞÜLÜR
        WHEN sh.${COLUMNS.HAREKET.TIP} = ${StokHareketTip.CIKIS}
          AND sh.${COLUMNS.HAREKET.CINS} = 0
          AND sh.${COLUMNS.HAREKET.NORMAL_IADE} = 1
          AND sh.${COLUMNS.HAREKET.TARIH} BETWEEN ${param(1)} AND ${param(2)}
        THEN -sh.${COLUMNS.HAREKET.MIKTAR}  -- NEGATİF olarak eklenir
        ELSE 0 
      END)`, 0)} AS giris_miktari,
      
      -- [39] Çıkış Miktarı (MİKRO MANTIĞI: Satış iadesi çıkıştan düşülür)
      ${isNull(`SUM(CASE 
        -- Normal çıkış hareketleri
        WHEN sh.${COLUMNS.HAREKET.TIP} = ${StokHareketTip.CIKIS}
          AND sh.${COLUMNS.HAREKET.CINS} != 9
          AND ISNULL(sh.${COLUMNS.HAREKET.NORMAL_IADE}, 0) = 0
          AND sh.${COLUMNS.HAREKET.TARIH} BETWEEN ${param(1)} AND ${param(2)}
        THEN sh.${COLUMNS.HAREKET.MIKTAR}
        -- Satış iadesi (tip=0, cins=0, iade=1) → ÇIKIŞTAN DÜŞÜLÜR
        WHEN sh.${COLUMNS.HAREKET.TIP} = ${StokHareketTip.GIRIS}
          AND sh.${COLUMNS.HAREKET.CINS} = 0
          AND sh.${COLUMNS.HAREKET.NORMAL_IADE} = 1
          AND sh.${COLUMNS.HAREKET.TARIH} BETWEEN ${param(1)} AND ${param(2)}
        THEN -sh.${COLUMNS.HAREKET.MIKTAR}  -- NEGATİF olarak eklenir
        ELSE 0 
      END)`, 0)} AS cikis_miktari,
      
      -- [42] Kalan Miktar - Dönem Sonu
      ${isNull(`SUM(CASE 
        -- Fiyat farkı hariç
        WHEN sh.${COLUMNS.HAREKET.CINS} = 9 THEN 0
        -- Normal giriş
        WHEN sh.${COLUMNS.HAREKET.TIP} = ${StokHareketTip.GIRIS} 
          AND ISNULL(sh.${COLUMNS.HAREKET.NORMAL_IADE}, 0) = 0
        THEN sh.${COLUMNS.HAREKET.MIKTAR}
        -- Normal çıkış
        WHEN sh.${COLUMNS.HAREKET.TIP} = ${StokHareketTip.CIKIS}
          AND ISNULL(sh.${COLUMNS.HAREKET.NORMAL_IADE}, 0) = 0
        THEN -sh.${COLUMNS.HAREKET.MIKTAR}
        -- Satış iadesi (tip=0, cins=0, iade=1) → Stoka EKLE
        WHEN sh.${COLUMNS.HAREKET.TIP} = ${StokHareketTip.GIRIS}
          AND sh.${COLUMNS.HAREKET.CINS} = 0
          AND sh.${COLUMNS.HAREKET.NORMAL_IADE} = 1
        THEN sh.${COLUMNS.HAREKET.MIKTAR}
        -- Alış iadesi (tip=1, cins=0, iade=1) → Stoktan ÇIKAR
        WHEN sh.${COLUMNS.HAREKET.TIP} = ${StokHareketTip.CIKIS}
          AND sh.${COLUMNS.HAREKET.CINS} = 0
          AND sh.${COLUMNS.HAREKET.NORMAL_IADE} = 1
        THEN -sh.${COLUMNS.HAREKET.MIKTAR}
        ELSE 0 
      END)`, 0)} AS kalan_miktar
      
      ${includeExtendedInfo ? `,
      -- Normal çıkış miktarı = SADECE POZİTİF ÇIKIŞLAR (Negatif değerler iade kabul edilir)
      ${isNull(`
        CASE 
          WHEN SUM(CASE 
            -- SADECE POZİTİF çıkışları say (negatifler iade kabul edilir ve dahil edilmez)
            WHEN sh.${COLUMNS.HAREKET.TIP} = ${StokHareketTip.CIKIS}
              AND sh.${COLUMNS.HAREKET.CINS} != 9
              AND ISNULL(sh.${COLUMNS.HAREKET.NORMAL_IADE}, 0) = 0
              AND sh.${COLUMNS.HAREKET.TARIH} BETWEEN ${param(1)} AND ${param(2)}
              AND sh.${COLUMNS.HAREKET.MIKTAR} > 0  -- SADECE POZİTİF DEĞERLER
              ${excludeOutliers ? `AND sh.${COLUMNS.HAREKET.MIKTAR} <= ISNULL(ho.ortalama_miktar + (3 * ho.standart_sapma), sh.${COLUMNS.HAREKET.MIKTAR})` : ''}
            THEN sh.${COLUMNS.HAREKET.MIKTAR}
            -- Normal iade işlemleri (tip=0, iade=1) çıkıştan düşülür
            WHEN sh.${COLUMNS.HAREKET.TIP} = ${StokHareketTip.GIRIS}
              AND sh.${COLUMNS.HAREKET.CINS} = 0
              AND sh.${COLUMNS.HAREKET.NORMAL_IADE} = 1
              AND sh.${COLUMNS.HAREKET.TARIH} BETWEEN ${param(1)} AND ${param(2)}
              AND sh.${COLUMNS.HAREKET.MIKTAR} > 0  -- Normal pozitif iadeler
            THEN -sh.${COLUMNS.HAREKET.MIKTAR}
            -- NEGATİF ÇIKIŞLAR İADE KABUL EDİLİR, HESAPLAMAYA DAHİL EDİLMEZ
            ELSE 0 
          END) < 0 
          THEN 0  -- Sonuç negatifse (iadeler satıştan fazlaysa) 0 döndür
          ELSE SUM(CASE 
            WHEN sh.${COLUMNS.HAREKET.TIP} = ${StokHareketTip.CIKIS}
              AND sh.${COLUMNS.HAREKET.CINS} != 9
              AND ISNULL(sh.${COLUMNS.HAREKET.NORMAL_IADE}, 0) = 0
              AND sh.${COLUMNS.HAREKET.TARIH} BETWEEN ${param(1)} AND ${param(2)}
              AND sh.${COLUMNS.HAREKET.MIKTAR} > 0
              ${excludeOutliers ? `AND sh.${COLUMNS.HAREKET.MIKTAR} <= ISNULL(ho.ortalama_miktar + (3 * ho.standart_sapma), sh.${COLUMNS.HAREKET.MIKTAR})` : ''}
            THEN sh.${COLUMNS.HAREKET.MIKTAR}
            WHEN sh.${COLUMNS.HAREKET.TIP} = ${StokHareketTip.GIRIS}
              AND sh.${COLUMNS.HAREKET.CINS} = 0
              AND sh.${COLUMNS.HAREKET.NORMAL_IADE} = 1
              AND sh.${COLUMNS.HAREKET.TARIH} BETWEEN ${param(1)} AND ${param(2)}
              AND sh.${COLUMNS.HAREKET.MIKTAR} > 0
            THEN -sh.${COLUMNS.HAREKET.MIKTAR}
            ELSE 0 
          END)
        END
      `, 0)} AS normal_cikis_miktari,
      
      -- Anormal hareket sayısı
      SUM(CASE 
        WHEN sh.${COLUMNS.HAREKET.TIP} = ${StokHareketTip.CIKIS}
          AND sh.${COLUMNS.HAREKET.CINS} != 9
          AND ISNULL(sh.${COLUMNS.HAREKET.NORMAL_IADE}, 0) = 0
          AND sh.${COLUMNS.HAREKET.TARIH} BETWEEN ${param(1)} AND ${param(2)}
          AND sh.${COLUMNS.HAREKET.MIKTAR} > ISNULL(ho.ortalama_miktar + (3 * ho.standart_sapma), sh.${COLUMNS.HAREKET.MIKTAR} + 1)
        THEN 1
        ELSE 0 
      END) AS anormal_hareket_sayisi,
      
      -- Anormal hareket toplam miktarı
      ISNULL(SUM(CASE 
        WHEN sh.${COLUMNS.HAREKET.TIP} = ${StokHareketTip.CIKIS}
          AND sh.${COLUMNS.HAREKET.CINS} != 9
          AND ISNULL(sh.${COLUMNS.HAREKET.NORMAL_IADE}, 0) = 0
          AND sh.${COLUMNS.HAREKET.TARIH} BETWEEN ${param(1)} AND ${param(2)}
          AND sh.${COLUMNS.HAREKET.MIKTAR} > ISNULL(ho.ortalama_miktar + (3 * ho.standart_sapma), sh.${COLUMNS.HAREKET.MIKTAR} + 1)
        THEN sh.${COLUMNS.HAREKET.MIKTAR}
        ELSE 0 
      END), 0) AS anormal_miktar_toplam,
      
      -- Proje bazlı hareket sayısı ve miktarı
      SUM(CASE 
        WHEN sh.${COLUMNS.HAREKET.TIP} = ${StokHareketTip.CIKIS}
          AND sh.${COLUMNS.HAREKET.CINS} != 9
          AND ISNULL(sh.${COLUMNS.HAREKET.NORMAL_IADE}, 0) = 0
          AND sh.${COLUMNS.HAREKET.TARIH} BETWEEN ${param(1)} AND ${param(2)}
          AND sh.${COLUMNS.HAREKET.PROJE_KODU} = 'P'
        THEN 1
        ELSE 0 
      END) AS proje_hareket_sayisi,
      
      ISNULL(SUM(CASE 
        WHEN sh.${COLUMNS.HAREKET.TIP} = ${StokHareketTip.CIKIS}
          AND sh.${COLUMNS.HAREKET.CINS} != 9
          AND ISNULL(sh.${COLUMNS.HAREKET.NORMAL_IADE}, 0) = 0
          AND sh.${COLUMNS.HAREKET.TARIH} BETWEEN ${param(1)} AND ${param(2)}
          AND sh.${COLUMNS.HAREKET.PROJE_KODU} = 'P'
        THEN sh.${COLUMNS.HAREKET.MIKTAR}
        ELSE 0 
      END), 0) AS proje_toplam_miktar,
      
      -- Son hareket tarihleri (İade hareketleri dahil)
      MAX(sh.${COLUMNS.HAREKET.TARIH}) AS son_hareket_tarihi,
      
      -- Son giriş tarihi (Normal giriş + Satış iadesi)
      MAX(CASE 
        WHEN sh.${COLUMNS.HAREKET.TIP} = ${StokHareketTip.GIRIS} 
          AND sh.${COLUMNS.HAREKET.CINS} != 9
          AND ISNULL(sh.${COLUMNS.HAREKET.NORMAL_IADE}, 0) = 0
        THEN sh.${COLUMNS.HAREKET.TARIH}
        -- Satış iadesi de son giriş sayılır
        WHEN sh.${COLUMNS.HAREKET.TIP} = ${StokHareketTip.GIRIS}
          AND sh.${COLUMNS.HAREKET.CINS} = 0
          AND sh.${COLUMNS.HAREKET.NORMAL_IADE} = 1
        THEN sh.${COLUMNS.HAREKET.TARIH}
        ELSE NULL 
      END) AS son_giris_tarihi,
      
      -- Son çıkış tarihi (Normal çıkış + Alış iadesi)
      MAX(CASE 
        WHEN sh.${COLUMNS.HAREKET.TIP} = ${StokHareketTip.CIKIS}
          AND sh.${COLUMNS.HAREKET.CINS} != 9
          AND ISNULL(sh.${COLUMNS.HAREKET.NORMAL_IADE}, 0) = 0
          ${excludeOutliers ? `AND sh.${COLUMNS.HAREKET.MIKTAR} <= ISNULL(ho.ortalama_miktar + (3 * ho.standart_sapma), sh.${COLUMNS.HAREKET.MIKTAR})` : ''}
        THEN sh.${COLUMNS.HAREKET.TARIH}
        -- Alış iadesi de son çıkış sayılır
        WHEN sh.${COLUMNS.HAREKET.TIP} = ${StokHareketTip.CIKIS}
          AND sh.${COLUMNS.HAREKET.CINS} = 0
          AND sh.${COLUMNS.HAREKET.NORMAL_IADE} = 1
        THEN sh.${COLUMNS.HAREKET.TARIH}
        ELSE NULL 
      END) AS son_cikis_tarihi,
      
      -- Hareket gün sayısı
      COUNT(DISTINCT CAST(sh.${COLUMNS.HAREKET.TARIH} AS DATE)) AS hareket_gun_sayisi,
      
      -- Dönem giriş/çıkış sayıları (İşlem sayısı)
      SUM(CASE 
        WHEN sh.${COLUMNS.HAREKET.TIP} = ${StokHareketTip.GIRIS}
          AND sh.${COLUMNS.HAREKET.CINS} != 9
          AND sh.${COLUMNS.HAREKET.TARIH} BETWEEN ${param(1)} AND ${param(2)}
        THEN 1 
        ELSE 0 
      END) AS donem_giris_sayisi,
      
      SUM(CASE 
        WHEN sh.${COLUMNS.HAREKET.TIP} = ${StokHareketTip.CIKIS}
          AND sh.${COLUMNS.HAREKET.CINS} != 9
          AND sh.${COLUMNS.HAREKET.TARIH} BETWEEN ${param(1)} AND ${param(2)}
        THEN 1 
        ELSE 0 
      END) AS donem_cikis_sayisi,
      
      -- YENİ: Dönem bazlı çıkış sayıları
      SUM(CASE 
        WHEN sh.${COLUMNS.HAREKET.TIP} = ${StokHareketTip.CIKIS}
          AND sh.${COLUMNS.HAREKET.CINS} != 9
          AND sh.${COLUMNS.HAREKET.TARIH} >= DATEADD(DAY, -30, GETDATE())
        THEN 1 
        ELSE 0 
      END) AS son_30_gun_cikis_sayisi,
      
      SUM(CASE 
        WHEN sh.${COLUMNS.HAREKET.TIP} = ${StokHareketTip.CIKIS}
          AND sh.${COLUMNS.HAREKET.CINS} != 9
          AND sh.${COLUMNS.HAREKET.TARIH} >= DATEADD(DAY, -60, GETDATE())
        THEN 1 
        ELSE 0 
      END) AS son_60_gun_cikis_sayisi,
      
      SUM(CASE 
        WHEN sh.${COLUMNS.HAREKET.TIP} = ${StokHareketTip.CIKIS}
          AND sh.${COLUMNS.HAREKET.CINS} != 9
          AND sh.${COLUMNS.HAREKET.TARIH} >= DATEADD(DAY, -180, GETDATE())
        THEN 1 
        ELSE 0 
      END) AS son_180_gun_cikis_sayisi,
      
      SUM(CASE 
        WHEN sh.${COLUMNS.HAREKET.TIP} = ${StokHareketTip.CIKIS}
          AND sh.${COLUMNS.HAREKET.CINS} != 9
          AND sh.${COLUMNS.HAREKET.TARIH} >= DATEADD(DAY, -365, GETDATE())
        THEN 1 
        ELSE 0 
      END) AS son_365_gun_cikis_sayisi
      ` : ''}
      
    FROM ${getFullTableName(TABLES.STOKLAR)} s
    LEFT JOIN ${getFullTableName(TABLES.STOK_HAREKETLERI)} sh 
      ON s.${COLUMNS.STOK.KOD} = sh.${COLUMNS.HAREKET.STOK_KOD}
    ${excludeOutliers && includeExtendedInfo ? `
    LEFT JOIN HareketOrtalamalari ho 
      ON s.${COLUMNS.STOK.KOD} = ho.${COLUMNS.HAREKET.STOK_KOD}
    ` : ''}
    WHERE 1=1
      ${params.anaGrup ? `AND s.${COLUMNS.STOK.ANAGRUP_KOD} = ${param(3)}` : ''}
      ${params.altGrup ? `AND s.${COLUMNS.STOK.ALTGRUP_KOD} = ${param(params.anaGrup ? 4 : 3)}` : ''}
    GROUP BY 
      s.${COLUMNS.STOK.KOD},
      s.${COLUMNS.STOK.ISIM},
      s.${COLUMNS.STOK.ANAGRUP_KOD},
      s.${COLUMNS.STOK.ALTGRUP_KOD}
      ${excludeOutliers && includeExtendedInfo ? ',ho.ortalama_miktar' : ''}
  `
}

/**
 * Hareket durumu hesaplama
 * Son hareket tarihine ve hareket sıklığına göre kategori belirler
 * Güncelleme: Hareket sayısı ve gün aralığı birlikte değerlendirilir
 */
export const getMovementStatusCalculation = () => `
  CASE 
    -- Aktif: Son 30 günde en az 3 hareket
    WHEN sho.son_30_gun_cikis_sayisi >= 3 
    THEN 'Aktif'
    
    -- Yavaş: Son 60 günde en az 2 hareket (30 günde 3'ten az)
    WHEN sho.son_60_gun_cikis_sayisi >= 2
    THEN 'Yavaş'
    
    -- Durgun: Son 180 günde en az 1 hareket (60 günde 2'den az)
    WHEN sho.son_180_gun_cikis_sayisi >= 1
    THEN 'Durgun'
    
    -- Ölü Stok: 180 günde hiç hareket yok veya son hareket 180 günden eski
    WHEN sho.son_180_gun_cikis_sayisi = 0 
      OR sho.son_cikis_tarihi IS NULL
      OR DATEDIFF(DAY, sho.son_cikis_tarihi, GETDATE()) > 180
    THEN 'Ölü Stok'
    
    -- Varsayılan durum
    ELSE 'Ölü Stok'
  END AS hareketDurumu
`

/**
 * Hareket günleri hesaplama
 * Son hareket tarihinden bugüne kadar geçen gün sayısı
 */
export const getMovementDaysCalculation = () => `
  DATEDIFF(DAY, sho.son_hareket_tarihi, GETDATE()) AS harekettenBeriGunSayisi,
  DATEDIFF(DAY, sho.son_giris_tarihi, GETDATE()) AS sonGiristenBeriGun,
  DATEDIFF(DAY, sho.son_cikis_tarihi, GETDATE()) AS sonCikistanBeriGun
`

/**
 * Devir hızı hesaplama
 * Stok devir hızını gün cinsinden hesaplar
 */
export const getTurnoverRateCalculation = (aySayisiParam: string) => `
  CASE 
    WHEN sho.cikis_miktari > 0 AND ${aySayisiParam} > 0 
    THEN (sho.kalan_miktar * 30) / (sho.cikis_miktari / ${aySayisiParam})
    ELSE 999999
  END AS devirHiziGun
`

/**
 * Mevsimsel hareket analizi CTE
 * Aylık hareket verilerini analiz eder
 */
export const getMonthlyMovementAnalysisCTE = (startDate: string, endDate: string, excludeOutliers: boolean = true) => `
  SELECT 
    sth_stok_kod,
    MONTH(sth_tarih) as ay,
    YEAR(sth_tarih) as yil,
    SUM(CASE 
      WHEN sth_tip = 1 
        AND sth_cins != 9
        ${excludeOutliers ? `AND sth_miktar <= (
          SELECT AVG(CAST(sth_miktar AS FLOAT)) * 3
          FROM [${DATABASE_SCHEMA.name}].[${DATABASE_SCHEMA.schema}].[${TABLES.STOK_HAREKETLERI}] h2
          WHERE h2.sth_stok_kod = [${DATABASE_SCHEMA.name}].[${DATABASE_SCHEMA.schema}].[${TABLES.STOK_HAREKETLERI}].sth_stok_kod
            AND h2.sth_tip = 1
            AND h2.sth_cins != 9
            AND h2.sth_tarih BETWEEN ${startDate} AND ${endDate}
        )` : ''}
      THEN sth_miktar 
      ELSE 0 
    END) as cikis_miktari
  FROM [${DATABASE_SCHEMA.name}].[${DATABASE_SCHEMA.schema}].[${TABLES.STOK_HAREKETLERI}]
  WHERE sth_tarih BETWEEN ${startDate} AND ${endDate}
  GROUP BY sth_stok_kod, MONTH(sth_tarih), YEAR(sth_tarih)
`

/**
 * Mevsimsellik özet CTE
 * Varyasyon katsayısı ve min/max ayları hesaplar
 */
export const getSeasonalSummaryCTE = () => `
  SELECT 
    sth_stok_kod,
    STDEV(cikis_miktari) as std_sapma,
    AVG(CAST(cikis_miktari AS FLOAT)) as ortalama_cikis,
    CASE 
      WHEN AVG(CAST(cikis_miktari AS FLOAT)) > 0 
      THEN STDEV(cikis_miktari) / AVG(CAST(cikis_miktari AS FLOAT))
      ELSE 0 
    END as degiskenlik_katsayisi,
    (SELECT TOP 1 ay FROM AylikHareketAnalizi a2 
     WHERE a2.sth_stok_kod = AylikHareketAnalizi.sth_stok_kod 
     ORDER BY cikis_miktari DESC) as max_ay,
    (SELECT TOP 1 ay FROM AylikHareketAnalizi a2 
     WHERE a2.sth_stok_kod = AylikHareketAnalizi.sth_stok_kod 
       AND cikis_miktari > 0
     ORDER BY cikis_miktari ASC) as min_ay
  FROM AylikHareketAnalizi
  GROUP BY sth_stok_kod
`

/**
 * Mevsimsel pattern tipi belirleme
 * Değişkenlik katsayısına göre sınıflandırma
 */
export const getSeasonalPatternType = () => `
  CASE 
    WHEN mo.degiskenlik_katsayisi < 0.3 THEN 'Stabil'
    WHEN mo.degiskenlik_katsayisi BETWEEN 0.3 AND 0.7 THEN 'Mevsimsel'
    ELSE 'Düzensiz'
  END AS mevsimselPatternTip
`

/**
 * Mevsimsel risk skoru hesaplama
 * Mevsimsellik ve stok durumuna göre risk değerlendirmesi
 */
export const getSeasonalRiskScore = (aySayisiParam: string) => `
  CASE 
    WHEN mo.degiskenlik_katsayisi > 0.5 
      AND MONTH(GETDATE()) IN (mo.max_ay - 1, mo.max_ay, mo.max_ay + 1)
      AND sho.kalan_miktar < (sho.cikis_miktari / ${aySayisiParam} * 2)
    THEN 5 -- Yüksek risk
    WHEN mo.degiskenlik_katsayisi > 0.5 
      AND sho.kalan_miktar < (sho.cikis_miktari / ${aySayisiParam})
    THEN 4 -- Orta-yüksek risk
    WHEN mo.degiskenlik_katsayisi BETWEEN 0.3 AND 0.5
      AND sho.kalan_miktar < (sho.cikis_miktari / ${aySayisiParam} * 1.5)
    THEN 3 -- Orta risk
    WHEN sho.kalan_miktar < (sho.cikis_miktari / ${aySayisiParam})
    THEN 2 -- Düşük-orta risk
    ELSE 1 -- Düşük risk
  END AS mevsimselRisk
`

/**
 * Proje bazlı ve anormal hareket detay sorgusu
 * Belirli bir stok için proje kodlu ve anormal hareketleri tespit eder
 * 3-Sigma kuralı + Proje kodu kontrolü
 * @param stokKodu - Analiz edilecek stok kodu
 * @param baslangicTarih - Başlangıç tarihi 
 * @param bitisTarih - Bitiş tarihi
 * @param projeKodu - Filtrelenecek proje kodu (opsiyonel, default: 'P')
 */
export const getProjectBasedAnomalyDetectionQuery = (
  stokKodu: string, 
  baslangicTarih: string, 
  bitisTarih: string,
  projeKodu: string = 'P'
) => {
  return `
    WITH HareketIstatistik AS (
      SELECT 
        ${COLUMNS.HAREKET.STOK_KOD},
        AVG(CAST(${COLUMNS.HAREKET.MIKTAR} AS FLOAT)) as ortalama,
        STDEV(${COLUMNS.HAREKET.MIKTAR}) as standart_sapma,
        COUNT(*) as hareket_sayisi
      FROM ${getFullTableName(TABLES.STOK_HAREKETLERI)}
      WHERE ${COLUMNS.HAREKET.TIP} = ${StokHareketTip.CIKIS}
        AND ${COLUMNS.HAREKET.CINS} != ${StokHareketCins.FIYAT_FARKI}
        AND ${COLUMNS.HAREKET.STOK_KOD} = ${param(1)}
        AND ${COLUMNS.HAREKET.TARIH} BETWEEN ${param(2)} AND ${param(3)}
        AND (${COLUMNS.HAREKET.PROJE_KODU} IS NULL OR ${COLUMNS.HAREKET.PROJE_KODU} != ${param(4)})
      GROUP BY ${COLUMNS.HAREKET.STOK_KOD}
    ),
    HareketDetay AS (
      SELECT 
        sh.${COLUMNS.HAREKET.STOK_KOD},
        sh.${COLUMNS.HAREKET.TARIH},
        sh.${COLUMNS.HAREKET.EVRAKNO_SERI},
        sh.${COLUMNS.HAREKET.EVRAKNO_SIRA},
        sh.${COLUMNS.HAREKET.MIKTAR},
        sh.${COLUMNS.HAREKET.TUTAR},
        sh.${COLUMNS.HAREKET.ISKONTO1},
        sh.${COLUMNS.HAREKET.ISKONTO2},
        sh.${COLUMNS.HAREKET.PROJE_KODU},
        sh.${COLUMNS.HAREKET.CARI_KODU},
        sh.${COLUMNS.HAREKET.ACIKLAMA},
        hi.ortalama,
        hi.standart_sapma,
        hi.ortalama + (3 * hi.standart_sapma) as ust_sinir,
        CASE 
          WHEN hi.ortalama > 0 
          THEN sh.${COLUMNS.HAREKET.MIKTAR} / hi.ortalama
          ELSE 0
        END as anormallik_katsayisi
      FROM ${getFullTableName(TABLES.STOK_HAREKETLERI)} sh
      INNER JOIN HareketIstatistik hi ON sh.${COLUMNS.HAREKET.STOK_KOD} = hi.${COLUMNS.HAREKET.STOK_KOD}
      WHERE sh.${COLUMNS.HAREKET.TIP} = ${StokHareketTip.CIKIS}
        AND sh.${COLUMNS.HAREKET.CINS} != ${StokHareketCins.FIYAT_FARKI}
        AND sh.${COLUMNS.HAREKET.STOK_KOD} = ${param(1)}
        AND sh.${COLUMNS.HAREKET.TARIH} BETWEEN ${param(2)} AND ${param(3)}
    )
    SELECT 
      ${COLUMNS.HAREKET.STOK_KOD} AS stokKodu,
      ${COLUMNS.HAREKET.TARIH} AS tarih,
      ${COLUMNS.HAREKET.EVRAKNO_SERI} + '-' + CAST(${COLUMNS.HAREKET.EVRAKNO_SIRA} AS VARCHAR) AS evrakNo,
      ${COLUMNS.HAREKET.MIKTAR} AS miktar,
      ROUND(ortalama, 2) AS normalOrtalama,
      ROUND(standart_sapma, 2) AS standartSapma,
      ROUND(ust_sinir, 2) AS ustSinir3Sigma,
      ROUND(anormallik_katsayisi, 2) AS anormallikKatsayisi,
      
      CASE 
        WHEN ${COLUMNS.HAREKET.PROJE_KODU} = ${param(4)} THEN 'PROJE'
        WHEN ${COLUMNS.HAREKET.MIKTAR} > ust_sinir THEN 'ANORMAL'
        ELSE 'NORMAL'
      END AS hareketTipi,
      
      CASE 
        WHEN ${COLUMNS.HAREKET.PROJE_KODU} = ${param(4)}
          THEN ${param(4)} + ' Projesi - ' + ISNULL(${COLUMNS.HAREKET.ACIKLAMA}, '')
        WHEN ${COLUMNS.HAREKET.MIKTAR} > ust_sinir 
          THEN 'Ortalamanın ' + CAST(ROUND(anormallik_katsayisi, 1) AS VARCHAR) + ' katı (3σ aşımı)'
        ELSE 'Normal satış'
      END AS tespitDetayi,
      
      ${COLUMNS.HAREKET.PROJE_KODU} AS projeKodu,
      ${COLUMNS.HAREKET.CARI_KODU} AS cariKodu,
      ${COLUMNS.HAREKET.TUTAR} AS tutar,
      ROUND((${COLUMNS.HAREKET.ISKONTO1} + ${COLUMNS.HAREKET.ISKONTO2}) * 100.0 / NULLIF(${COLUMNS.HAREKET.TUTAR}, 0), 2) AS iskontoYuzde,
      ${COLUMNS.HAREKET.ACIKLAMA} AS aciklama
    FROM HareketDetay
    WHERE 
      ${COLUMNS.HAREKET.PROJE_KODU} = ${param(4)}
      OR ${COLUMNS.HAREKET.MIKTAR} > ust_sinir
    ORDER BY 
      CASE 
        WHEN ${COLUMNS.HAREKET.PROJE_KODU} = ${param(4)} THEN 1
        WHEN ${COLUMNS.HAREKET.MIKTAR} > ust_sinir THEN 2
        ELSE 3
      END,
      ${COLUMNS.HAREKET.MIKTAR} DESC
  `
}