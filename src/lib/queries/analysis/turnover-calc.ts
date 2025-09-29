/**
 * Stok Devir Hızı Hesaplama Sorguları
 * Stok devir hızı ve ilgili metriklerin hesaplanması
 */

import { QueryParams, TABLES, COLUMNS, sanitizeParam } from '../types'

/**
 * Stok devir hızı hesaplama sorgusu
 * Devir Hızı = Satılan Malın Maliyeti / Ortalama Stok
 * @param params - Sorgu parametreleri
 */
export const getStockTurnoverQuery = (params: QueryParams) => `
  WITH StokDevirData AS (
    SELECT 
      s.${COLUMNS.STOK.KOD} as stokKodu,
      s.${COLUMNS.STOK.ISIM} as stokIsmi,
      
      -- Dönem başı stok
      ISNULL((
        SELECT SUM(CASE 
          WHEN ${COLUMNS.HAREKET.TIP} = 0 THEN ${COLUMNS.HAREKET.MIKTAR}
          WHEN ${COLUMNS.HAREKET.TIP} = 1 THEN -${COLUMNS.HAREKET.MIKTAR}
          ELSE 0 
        END)
        FROM ${TABLES.STOK_HAREKETLERI}
        WHERE ${COLUMNS.HAREKET.STOK_KOD} = s.${COLUMNS.STOK.KOD}
          AND ${COLUMNS.HAREKET.TARIH} < ${sanitizeParam(params.baslangicTarih)}
      ), 0) AS donemBasiStok,
      
      -- Dönem sonu stok
      ISNULL((
        SELECT SUM(CASE 
          WHEN ${COLUMNS.HAREKET.TIP} = 0 THEN ${COLUMNS.HAREKET.MIKTAR}
          WHEN ${COLUMNS.HAREKET.TIP} = 1 THEN -${COLUMNS.HAREKET.MIKTAR}
          ELSE 0 
        END)
        FROM ${TABLES.STOK_HAREKETLERI}
        WHERE ${COLUMNS.HAREKET.STOK_KOD} = s.${COLUMNS.STOK.KOD}
          AND ${COLUMNS.HAREKET.TARIH} <= ${sanitizeParam(params.bitisTarih)}
      ), 0) AS donemSonuStok,
      
      -- Dönem içi çıkış (satış)
      ISNULL((
        SELECT SUM(${COLUMNS.HAREKET.MIKTAR})
        FROM ${TABLES.STOK_HAREKETLERI}
        WHERE ${COLUMNS.HAREKET.STOK_KOD} = s.${COLUMNS.STOK.KOD}
          AND ${COLUMNS.HAREKET.TIP} = 1
          AND ${COLUMNS.HAREKET.TARIH} BETWEEN ${sanitizeParam(params.baslangicTarih)} 
          AND ${sanitizeParam(params.bitisTarih)}
      ), 0) AS donemCikis
      
    FROM ${TABLES.STOKLAR} s
    WHERE 1=1
      ${params.anaGrup ? `AND s.${COLUMNS.STOK.ANAGRUP_KOD} = ${sanitizeParam(params.anaGrup)}` : ''}
  )
  SELECT 
    stokKodu,
    stokIsmi,
    donemBasiStok,
    donemSonuStok,
    donemCikis,
    -- Ortalama stok
    (donemBasiStok + donemSonuStok) / 2.0 AS ortalamaStok,
    -- Devir hızı
    CASE 
      WHEN (donemBasiStok + donemSonuStok) > 0 
      THEN donemCikis / ((donemBasiStok + donemSonuStok) / 2.0)
      ELSE 0 
    END AS devirHizi,
    -- Devir süresi (gün)
    CASE 
      WHEN donemCikis > 0 
      THEN (((donemBasiStok + donemSonuStok) / 2.0) * 365) / donemCikis
      ELSE 0 
    END AS devirSuresiGun
  FROM StokDevirData
  WHERE donemCikis > 0 OR donemBasiStok > 0 OR donemSonuStok > 0
  ORDER BY devirHizi DESC
`

/**
 * ABC analizi sorgusu
 * Stokları değer bazında sınıflandırır
 * @param params - Sorgu parametreleri
 */
export const getABCAnalysisQuery = (params: QueryParams) => `
  WITH StokDeger AS (
    SELECT 
      s.${COLUMNS.STOK.KOD} as stokKodu,
      s.${COLUMNS.STOK.ISIM} as stokIsmi,
      -- Dönem çıkış miktarı
      ISNULL(SUM(CASE 
        WHEN sh.${COLUMNS.HAREKET.TIP} = 1 
        THEN sh.${COLUMNS.HAREKET.MIKTAR}
        ELSE 0 
      END), 0) AS cikisMiktari,
      -- Ortalama maliyet (basitleştirilmiş)
      1 AS birimMaliyet -- Gerçek uygulamada maliyet tablosundan alınmalı
    FROM ${TABLES.STOKLAR} s
    LEFT JOIN ${TABLES.STOK_HAREKETLERI} sh 
      ON s.${COLUMNS.STOK.KOD} = sh.${COLUMNS.HAREKET.STOK_KOD}
      AND sh.${COLUMNS.HAREKET.TARIH} BETWEEN ${sanitizeParam(params.baslangicTarih)} 
      AND ${sanitizeParam(params.bitisTarih)}
    WHERE 1=1
      ${params.anaGrup ? `AND s.${COLUMNS.STOK.ANAGRUP_KOD} = ${sanitizeParam(params.anaGrup)}` : ''}
    GROUP BY s.${COLUMNS.STOK.KOD}, s.${COLUMNS.STOK.ISIM}
  ),
  ToplamDeger AS (
    SELECT SUM(cikisMiktari * birimMaliyet) as toplamDeger
    FROM StokDeger
  ),
  KumulatifDeger AS (
    SELECT 
      stokKodu,
      stokIsmi,
      cikisMiktari,
      cikisMiktari * birimMaliyet as stokDegeri,
      SUM(cikisMiktari * birimMaliyet) OVER (ORDER BY cikisMiktari * birimMaliyet DESC) as kumulatifDeger,
      (SELECT toplamDeger FROM ToplamDeger) as toplamDeger
    FROM StokDeger
  )
  SELECT 
    stokKodu,
    stokIsmi,
    cikisMiktari,
    stokDegeri,
    CAST((kumulatifDeger * 100.0 / NULLIF(toplamDeger, 0)) AS DECIMAL(5,2)) as kumulatifYuzde,
    CASE 
      WHEN (kumulatifDeger * 100.0 / NULLIF(toplamDeger, 0)) <= 80 THEN 'A'
      WHEN (kumulatifDeger * 100.0 / NULLIF(toplamDeger, 0)) <= 95 THEN 'B'
      ELSE 'C'
    END as abcSinifi
  FROM KumulatifDeger
  WHERE stokDegeri > 0
  ORDER BY stokDegeri DESC
`

/**
 * Yavaş hareket eden stoklar sorgusu
 * Belirli bir süre hareket etmeyen stokları listeler
 * @param params - Sorgu parametreleri
 * @param gunSayisi - Hareketsizlik gün sayısı
 */
export const getSlowMovingStocksQuery = (params: QueryParams, gunSayisi: number = 90) => `
  WITH SonHareketler AS (
    SELECT 
      s.${COLUMNS.STOK.KOD} as stokKodu,
      s.${COLUMNS.STOK.ISIM} as stokIsmi,
      MAX(sh.${COLUMNS.HAREKET.TARIH}) as sonHareketTarihi,
      -- Mevcut stok
      ISNULL(SUM(CASE 
        WHEN sh.${COLUMNS.HAREKET.TIP} = 0 THEN sh.${COLUMNS.HAREKET.MIKTAR}
        WHEN sh.${COLUMNS.HAREKET.TIP} = 1 THEN -sh.${COLUMNS.HAREKET.MIKTAR}
        ELSE 0 
      END), 0) AS mevcutStok
    FROM ${TABLES.STOKLAR} s
    LEFT JOIN ${TABLES.STOK_HAREKETLERI} sh 
      ON s.${COLUMNS.STOK.KOD} = sh.${COLUMNS.HAREKET.STOK_KOD}
    WHERE 1=1
      ${params.anaGrup ? `AND s.${COLUMNS.STOK.ANAGRUP_KOD} = ${sanitizeParam(params.anaGrup)}` : ''}
    GROUP BY s.${COLUMNS.STOK.KOD}, s.${COLUMNS.STOK.ISIM}
    HAVING ISNULL(SUM(CASE 
      WHEN sh.${COLUMNS.HAREKET.TIP} = 0 THEN sh.${COLUMNS.HAREKET.MIKTAR}
      WHEN sh.${COLUMNS.HAREKET.TIP} = 1 THEN -sh.${COLUMNS.HAREKET.MIKTAR}
      ELSE 0 
    END), 0) > 0 -- Sadece stokta olan ürünler
  )
  SELECT 
    stokKodu,
    stokIsmi,
    mevcutStok,
    sonHareketTarihi,
    DATEDIFF(DAY, sonHareketTarihi, GETDATE()) as hareketsizGunSayisi
  FROM SonHareketler
  WHERE DATEDIFF(DAY, sonHareketTarihi, GETDATE()) >= ${gunSayisi}
  ORDER BY hareketsizGunSayisi DESC
`

/**
 * Stok yaşlandırma raporu sorgusu
 * FIFO mantığına göre stok yaşını hesaplar
 * @param params - Sorgu parametreleri
 */
export const getStockAgingQuery = (params: QueryParams) => `
  WITH StokYas AS (
    SELECT 
      s.${COLUMNS.STOK.KOD} as stokKodu,
      s.${COLUMNS.STOK.ISIM} as stokIsmi,
      sh.${COLUMNS.HAREKET.TARIH} as hareketTarihi,
      sh.${COLUMNS.HAREKET.MIKTAR} as miktar,
      DATEDIFF(DAY, sh.${COLUMNS.HAREKET.TARIH}, GETDATE()) as gunSayisi,
      CASE 
        WHEN DATEDIFF(DAY, sh.${COLUMNS.HAREKET.TARIH}, GETDATE()) <= 30 THEN '0-30 gün'
        WHEN DATEDIFF(DAY, sh.${COLUMNS.HAREKET.TARIH}, GETDATE()) <= 60 THEN '31-60 gün'
        WHEN DATEDIFF(DAY, sh.${COLUMNS.HAREKET.TARIH}, GETDATE()) <= 90 THEN '61-90 gün'
        WHEN DATEDIFF(DAY, sh.${COLUMNS.HAREKET.TARIH}, GETDATE()) <= 180 THEN '91-180 gün'
        ELSE '180+ gün'
      END as yasAraligi
    FROM ${TABLES.STOKLAR} s
    INNER JOIN ${TABLES.STOK_HAREKETLERI} sh 
      ON s.${COLUMNS.STOK.KOD} = sh.${COLUMNS.HAREKET.STOK_KOD}
    WHERE sh.${COLUMNS.HAREKET.TIP} = 0 -- Sadece girişler
      AND sh.${COLUMNS.HAREKET.TARIH} <= ${sanitizeParam(params.bitisTarih)}
      ${params.anaGrup ? `AND s.${COLUMNS.STOK.ANAGRUP_KOD} = ${sanitizeParam(params.anaGrup)}` : ''}
  )
  SELECT 
    stokKodu,
    stokIsmi,
    yasAraligi,
    SUM(miktar) as toplamMiktar,
    COUNT(*) as islemSayisi,
    AVG(gunSayisi) as ortalamaGunSayisi
  FROM StokYas
  GROUP BY stokKodu, stokIsmi, yasAraligi
  ORDER BY stokKodu, yasAraligi
`