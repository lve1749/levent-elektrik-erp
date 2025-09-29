/**
 * Özet İstatistik Sorguları
 * Dashboard kartları için özet veriler
 */

import { QueryParams, TABLES, COLUMNS, sanitizeParam } from '../types'

/**
 * Genel stok özet istatistikleri
 * @param params - Sorgu parametreleri
 */
export const getGeneralStatsQuery = (params: QueryParams) => `
  SELECT 
    -- Toplam stok sayısı
    COUNT(DISTINCT s.${COLUMNS.STOK.KOD}) as toplamStokSayisi,
    
    -- Hareketli stok sayısı
    COUNT(DISTINCT sh.${COLUMNS.HAREKET.STOK_KOD}) as hareketliStokSayisi,
    
    -- Grup sayıları
    COUNT(DISTINCT s.${COLUMNS.STOK.ANAGRUP_KOD}) as anaGrupSayisi,
    COUNT(DISTINCT s.${COLUMNS.STOK.ALTGRUP_KOD}) as altGrupSayisi
    
  FROM ${TABLES.STOKLAR} s
  LEFT JOIN ${TABLES.STOK_HAREKETLERI} sh 
    ON s.${COLUMNS.STOK.KOD} = sh.${COLUMNS.HAREKET.STOK_KOD}
    AND sh.${COLUMNS.HAREKET.TARIH} BETWEEN ${sanitizeParam(params.baslangicTarih)} 
    AND ${sanitizeParam(params.bitisTarih)}
  WHERE 1=1
    ${params.anaGrup ? `AND s.${COLUMNS.STOK.ANAGRUP_KOD} = ${sanitizeParam(params.anaGrup)}` : ''}
`

/**
 * Hareket özet istatistikleri
 * @param params - Sorgu parametreleri
 */
export const getMovementStatsQuery = (params: QueryParams) => `
  SELECT 
    -- Toplam giriş/çıkış
    SUM(CASE WHEN ${COLUMNS.HAREKET.TIP} = 0 THEN ${COLUMNS.HAREKET.MIKTAR} ELSE 0 END) as toplamGiris,
    SUM(CASE WHEN ${COLUMNS.HAREKET.TIP} = 1 THEN ${COLUMNS.HAREKET.MIKTAR} ELSE 0 END) as toplamCikis,
    
    -- İşlem sayıları
    COUNT(CASE WHEN ${COLUMNS.HAREKET.TIP} = 0 THEN 1 END) as girisIslemSayisi,
    COUNT(CASE WHEN ${COLUMNS.HAREKET.TIP} = 1 THEN 1 END) as cikisIslemSayisi,
    
    -- Ortalama işlem miktarları
    AVG(CASE WHEN ${COLUMNS.HAREKET.TIP} = 0 THEN ${COLUMNS.HAREKET.MIKTAR} END) as ortalamaGirisMiktari,
    AVG(CASE WHEN ${COLUMNS.HAREKET.TIP} = 1 THEN ${COLUMNS.HAREKET.MIKTAR} END) as ortalamaCikisMiktari
    
  FROM ${TABLES.STOK_HAREKETLERI} sh
  ${params.anaGrup ? `
    INNER JOIN ${TABLES.STOKLAR} s 
      ON sh.${COLUMNS.HAREKET.STOK_KOD} = s.${COLUMNS.STOK.KOD}
      AND s.${COLUMNS.STOK.ANAGRUP_KOD} = ${sanitizeParam(params.anaGrup)}
  ` : ''}
  WHERE sh.${COLUMNS.HAREKET.TARIH} BETWEEN ${sanitizeParam(params.baslangicTarih)} 
    AND ${sanitizeParam(params.bitisTarih)}
`

/**
 * Sipariş özet istatistikleri
 * @param params - Sorgu parametreleri
 */
export const getOrderStatsQuery = (params: QueryParams) => `
  SELECT 
    -- Açık sipariş sayıları
    COUNT(CASE WHEN ${COLUMNS.SIPARIS.TIP} = 0 AND ${COLUMNS.SIPARIS.MIKTAR} > ${COLUMNS.SIPARIS.TESLIM_MIKTAR} THEN 1 END) as acikAlisSiparisSayisi,
    COUNT(CASE WHEN ${COLUMNS.SIPARIS.TIP} = 1 AND ${COLUMNS.SIPARIS.MIKTAR} > ${COLUMNS.SIPARIS.TESLIM_MIKTAR} THEN 1 END) as acikSatisSiparisSayisi,
    
    -- Bekleyen miktar toplamları
    SUM(CASE 
      WHEN ${COLUMNS.SIPARIS.TIP} = 0 AND ${COLUMNS.SIPARIS.MIKTAR} > ${COLUMNS.SIPARIS.TESLIM_MIKTAR}
      THEN ${COLUMNS.SIPARIS.MIKTAR} - ${COLUMNS.SIPARIS.TESLIM_MIKTAR}
      ELSE 0 
    END) as bekleyenAlisMiktari,
    SUM(CASE 
      WHEN ${COLUMNS.SIPARIS.TIP} = 1 AND ${COLUMNS.SIPARIS.MIKTAR} > ${COLUMNS.SIPARIS.TESLIM_MIKTAR}
      THEN ${COLUMNS.SIPARIS.MIKTAR} - ${COLUMNS.SIPARIS.TESLIM_MIKTAR}
      ELSE 0 
    END) as bekleyenSatisMiktari,
    
    -- Tamamlanma oranları
    CAST(
      SUM(CASE WHEN ${COLUMNS.SIPARIS.MIKTAR} = ${COLUMNS.SIPARIS.TESLIM_MIKTAR} THEN 1.0 ELSE 0.0 END) * 100.0 
      / NULLIF(COUNT(*), 0) AS DECIMAL(5,2)
    ) as genelTamamlanmaOrani
    
  FROM ${TABLES.SIPARISLER} sip
  ${params.anaGrup ? `
    INNER JOIN ${TABLES.STOKLAR} s 
      ON sip.${COLUMNS.SIPARIS.STOK_KOD} = s.${COLUMNS.STOK.KOD}
      AND s.${COLUMNS.STOK.ANAGRUP_KOD} = ${sanitizeParam(params.anaGrup)}
  ` : ''}
`

/**
 * En çok hareket gören stoklar
 * @param params - Sorgu parametreleri
 * @param limit - Gösterilecek kayıt sayısı
 */
export const getTopMovingStocksQuery = (params: QueryParams, limit: number = 10) => `
  SELECT TOP ${limit}
    sh.${COLUMNS.HAREKET.STOK_KOD} as stokKodu,
    s.${COLUMNS.STOK.ISIM} as stokIsmi,
    COUNT(*) as hareketSayisi,
    SUM(CASE WHEN sh.${COLUMNS.HAREKET.TIP} = 0 THEN sh.${COLUMNS.HAREKET.MIKTAR} ELSE 0 END) as toplamGiris,
    SUM(CASE WHEN sh.${COLUMNS.HAREKET.TIP} = 1 THEN sh.${COLUMNS.HAREKET.MIKTAR} ELSE 0 END) as toplamCikis
  FROM ${TABLES.STOK_HAREKETLERI} sh
  INNER JOIN ${TABLES.STOKLAR} s ON sh.${COLUMNS.HAREKET.STOK_KOD} = s.${COLUMNS.STOK.KOD}
  WHERE sh.${COLUMNS.HAREKET.TARIH} BETWEEN ${sanitizeParam(params.baslangicTarih)} 
    AND ${sanitizeParam(params.bitisTarih)}
    ${params.anaGrup ? `AND s.${COLUMNS.STOK.ANAGRUP_KOD} = ${sanitizeParam(params.anaGrup)}` : ''}
  GROUP BY sh.${COLUMNS.HAREKET.STOK_KOD}, s.${COLUMNS.STOK.ISIM}
  ORDER BY hareketSayisi DESC
`

/**
 * Kritik stok listesi
 * @param params - Sorgu parametreleri
 * @param kritikSeviye - Kritik stok ay seviyesi (varsayılan: 1)
 */
export const getCriticalStocksQuery = (params: QueryParams, kritikSeviye: number = 1) => `
  WITH StokDurum AS (
    SELECT 
      s.${COLUMNS.STOK.KOD} as stokKodu,
      s.${COLUMNS.STOK.ISIM} as stokIsmi,
      -- Mevcut stok
      ISNULL(SUM(CASE 
        WHEN sh.${COLUMNS.HAREKET.TIP} = 0 THEN sh.${COLUMNS.HAREKET.MIKTAR}
        WHEN sh.${COLUMNS.HAREKET.TIP} = 1 THEN -sh.${COLUMNS.HAREKET.MIKTAR}
        ELSE 0 
      END), 0) AS mevcutStok,
      -- Aylık ortalama çıkış
      ISNULL(SUM(CASE 
        WHEN sh.${COLUMNS.HAREKET.TIP} = 1 
          AND sh.${COLUMNS.HAREKET.TARIH} BETWEEN ${sanitizeParam(params.baslangicTarih)} 
          AND ${sanitizeParam(params.bitisTarih)}
        THEN sh.${COLUMNS.HAREKET.MIKTAR}
        ELSE 0 
      END) / NULLIF(${params.aySayisi}, 0), 0) AS aylikOrtalamaCikis
    FROM ${TABLES.STOKLAR} s
    LEFT JOIN ${TABLES.STOK_HAREKETLERI} sh 
      ON s.${COLUMNS.STOK.KOD} = sh.${COLUMNS.HAREKET.STOK_KOD}
    WHERE 1=1
      ${params.anaGrup ? `AND s.${COLUMNS.STOK.ANAGRUP_KOD} = ${sanitizeParam(params.anaGrup)}` : ''}
    GROUP BY s.${COLUMNS.STOK.KOD}, s.${COLUMNS.STOK.ISIM}
  )
  SELECT 
    stokKodu,
    stokIsmi,
    mevcutStok,
    aylikOrtalamaCikis,
    CASE 
      WHEN aylikOrtalamaCikis > 0 
      THEN mevcutStok / aylikOrtalamaCikis
      ELSE 999 
    END as stokAySayisi
  FROM StokDurum
  WHERE aylikOrtalamaCikis > 0 
    AND (mevcutStok / aylikOrtalamaCikis) < ${kritikSeviye}
  ORDER BY stokAySayisi ASC
`