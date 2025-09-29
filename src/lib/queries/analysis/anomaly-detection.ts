/**
 * Anormal Hareket ve Proje Bazlı Hareket Tespiti
 * 3-Sigma kuralı ve proje kodu bazlı tespit sistemi
 */

import { 
  TABLES, 
  COLUMNS, 
  DATABASE_SCHEMA,
  QueryParams,
  StokHareketTip,
  StokHareketCins,
  param,
  isNull
} from '../types'
import { getProjectBasedAnomalyDetectionQuery } from '../base/stock-movements'

/**
 * Veritabanı tam yolu için yardımcı fonksiyon
 */
const getFullTableName = (tableName: string): string => {
  return `[${DATABASE_SCHEMA.name}].[${DATABASE_SCHEMA.schema}].[${tableName}]`
}

/**
 * Proje kodlu ve anormal hareketlerin özet istatistikleri
 * Tüm stoklar için proje bazlı ve anormal hareket sayıları
 * @param params - Sorgu parametreleri
 * @param projeKodu - Kontrol edilecek proje kodu (default: 'P')
 */
export const getAnomalyStatisticsSummaryQuery = (params: QueryParams, projeKodu: string = 'P') => {
  const p1 = param(1) // baslangicTarih
  const p2 = param(2) // bitisTarih
  const p3 = param(3) // anaGrup (opsiyonel)
  
  return `
    WITH HareketIstatistik AS (
      SELECT 
        sh.${COLUMNS.HAREKET.STOK_KOD},
        AVG(CAST(sh.${COLUMNS.HAREKET.MIKTAR} AS FLOAT)) as ortalama_miktar,
        STDEV(sh.${COLUMNS.HAREKET.MIKTAR}) as standart_sapma,
        COUNT(*) as normal_hareket_sayisi
      FROM ${getFullTableName(TABLES.STOK_HAREKETLERI)} sh
      ${params.anaGrup ? `
      INNER JOIN ${getFullTableName(TABLES.STOKLAR)} s 
        ON sh.${COLUMNS.HAREKET.STOK_KOD} = s.${COLUMNS.STOK.KOD}
      ` : ''}
      WHERE sh.${COLUMNS.HAREKET.TIP} = ${StokHareketTip.CIKIS}
        AND sh.${COLUMNS.HAREKET.CINS} != ${StokHareketCins.FIYAT_FARKI}
        AND sh.${COLUMNS.HAREKET.TARIH} BETWEEN ${p1} AND ${p2}
        AND (sh.${COLUMNS.HAREKET.PROJE_KODU} IS NULL OR sh.${COLUMNS.HAREKET.PROJE_KODU} != '${projeKodu}')
        ${params.anaGrup ? `AND s.${COLUMNS.STOK.ANAGRUP_KOD} = ${p3}` : ''}
      GROUP BY sh.${COLUMNS.HAREKET.STOK_KOD}
    ),
    AnormallikTespiti AS (
      SELECT 
        s.${COLUMNS.STOK.KOD},
        s.${COLUMNS.STOK.ISIM},
        s.${COLUMNS.STOK.ANAGRUP_KOD},
        s.${COLUMNS.STOK.ALTGRUP_KOD},
        
        -- Normal hareket istatistikleri
        ${isNull('hi.ortalama_miktar', 0)} as ortalama_miktar,
        ${isNull('hi.standart_sapma', 0)} as standart_sapma,
        ${isNull('hi.ortalama_miktar + (3 * hi.standart_sapma)', 0)} as ust_sinir_3sigma,
        
        -- Proje bazlı hareketler
        ${isNull(`(
          SELECT COUNT(*) 
          FROM ${getFullTableName(TABLES.STOK_HAREKETLERI)} sh2
          WHERE sh2.${COLUMNS.HAREKET.STOK_KOD} = s.${COLUMNS.STOK.KOD}
            AND sh2.${COLUMNS.HAREKET.TIP} = ${StokHareketTip.CIKIS}
            AND sh2.${COLUMNS.HAREKET.CINS} != ${StokHareketCins.FIYAT_FARKI}
            AND sh2.${COLUMNS.HAREKET.TARIH} BETWEEN ${p1} AND ${p2}
            AND sh2.${COLUMNS.HAREKET.PROJE_KODU} = '${projeKodu}'
        )`, 0)} as proje_hareket_sayisi,
        
        ${isNull(`(
          SELECT SUM(sh2.${COLUMNS.HAREKET.MIKTAR}) 
          FROM ${getFullTableName(TABLES.STOK_HAREKETLERI)} sh2
          WHERE sh2.${COLUMNS.HAREKET.STOK_KOD} = s.${COLUMNS.STOK.KOD}
            AND sh2.${COLUMNS.HAREKET.TIP} = ${StokHareketTip.CIKIS}
            AND sh2.${COLUMNS.HAREKET.CINS} != ${StokHareketCins.FIYAT_FARKI}
            AND sh2.${COLUMNS.HAREKET.TARIH} BETWEEN ${p1} AND ${p2}
            AND sh2.${COLUMNS.HAREKET.PROJE_KODU} = '${projeKodu}'
        )`, 0)} as proje_toplam_miktar,
        
        -- Anormal hareketler (3-Sigma üstü)
        ${isNull(`(
          SELECT COUNT(*) 
          FROM ${getFullTableName(TABLES.STOK_HAREKETLERI)} sh3
          WHERE sh3.${COLUMNS.HAREKET.STOK_KOD} = s.${COLUMNS.STOK.KOD}
            AND sh3.${COLUMNS.HAREKET.TIP} = ${StokHareketTip.CIKIS}
            AND sh3.${COLUMNS.HAREKET.CINS} != ${StokHareketCins.FIYAT_FARKI}
            AND sh3.${COLUMNS.HAREKET.TARIH} BETWEEN ${p1} AND ${p2}
            AND sh3.${COLUMNS.HAREKET.MIKTAR} > hi.ortalama_miktar + (3 * hi.standart_sapma)
            AND (sh3.${COLUMNS.HAREKET.PROJE_KODU} IS NULL OR sh3.${COLUMNS.HAREKET.PROJE_KODU} != '${projeKodu}')
        )`, 0)} as anormal_hareket_sayisi,
        
        ${isNull(`(
          SELECT SUM(sh3.${COLUMNS.HAREKET.MIKTAR}) 
          FROM ${getFullTableName(TABLES.STOK_HAREKETLERI)} sh3
          WHERE sh3.${COLUMNS.HAREKET.STOK_KOD} = s.${COLUMNS.STOK.KOD}
            AND sh3.${COLUMNS.HAREKET.TIP} = ${StokHareketTip.CIKIS}
            AND sh3.${COLUMNS.HAREKET.CINS} != ${StokHareketCins.FIYAT_FARKI}
            AND sh3.${COLUMNS.HAREKET.TARIH} BETWEEN ${p1} AND ${p2}
            AND sh3.${COLUMNS.HAREKET.MIKTAR} > hi.ortalama_miktar + (3 * hi.standart_sapma)
            AND (sh3.${COLUMNS.HAREKET.PROJE_KODU} IS NULL OR sh3.${COLUMNS.HAREKET.PROJE_KODU} != '${projeKodu}')
        )`, 0)} as anormal_toplam_miktar,
        
        -- Toplam normal hareket (proje ve anormal hariç)
        ${isNull(`(
          SELECT COUNT(*) 
          FROM ${getFullTableName(TABLES.STOK_HAREKETLERI)} sh4
          WHERE sh4.${COLUMNS.HAREKET.STOK_KOD} = s.${COLUMNS.STOK.KOD}
            AND sh4.${COLUMNS.HAREKET.TIP} = ${StokHareketTip.CIKIS}
            AND sh4.${COLUMNS.HAREKET.CINS} != ${StokHareketCins.FIYAT_FARKI}
            AND sh4.${COLUMNS.HAREKET.TARIH} BETWEEN ${p1} AND ${p2}
            AND sh4.${COLUMNS.HAREKET.MIKTAR} <= ISNULL(hi.ortalama_miktar + (3 * hi.standart_sapma), sh4.${COLUMNS.HAREKET.MIKTAR})
            AND (sh4.${COLUMNS.HAREKET.PROJE_KODU} IS NULL OR sh4.${COLUMNS.HAREKET.PROJE_KODU} != '${projeKodu}')
        )`, 0)} as normal_hareket_sayisi,
        
        ${isNull(`(
          SELECT SUM(sh4.${COLUMNS.HAREKET.MIKTAR}) 
          FROM ${getFullTableName(TABLES.STOK_HAREKETLERI)} sh4
          WHERE sh4.${COLUMNS.HAREKET.STOK_KOD} = s.${COLUMNS.STOK.KOD}
            AND sh4.${COLUMNS.HAREKET.TIP} = ${StokHareketTip.CIKIS}
            AND sh4.${COLUMNS.HAREKET.CINS} != ${StokHareketCins.FIYAT_FARKI}
            AND sh4.${COLUMNS.HAREKET.TARIH} BETWEEN ${p1} AND ${p2}
            AND sh4.${COLUMNS.HAREKET.MIKTAR} <= ISNULL(hi.ortalama_miktar + (3 * hi.standart_sapma), sh4.${COLUMNS.HAREKET.MIKTAR})
            AND (sh4.${COLUMNS.HAREKET.PROJE_KODU} IS NULL OR sh4.${COLUMNS.HAREKET.PROJE_KODU} != '${projeKodu}')
        )`, 0)} as normal_toplam_miktar
        
      FROM ${getFullTableName(TABLES.STOKLAR)} s
      LEFT JOIN HareketIstatistik hi ON s.${COLUMNS.STOK.KOD} = hi.${COLUMNS.HAREKET.STOK_KOD}
      WHERE 1=1
        ${params.anaGrup ? `AND s.${COLUMNS.STOK.ANAGRUP_KOD} = ${p3}` : ''}
    )
    SELECT 
      sto_kod as stokKodu,
      sto_isim as stokIsmi,
      sto_anagrup_kod as anaGrup,
      sto_altgrup_kod as altGrup,
      
      -- İstatistikler
      ROUND(ortalama_miktar, 2) as ortalamaMiktar,
      ROUND(standart_sapma, 2) as standartSapma,
      ROUND(ust_sinir_3sigma, 2) as ustSinir3Sigma,
      
      -- Hareket sayıları
      normal_hareket_sayisi as normalHareketSayisi,
      normal_toplam_miktar as normalToplamMiktar,
      
      proje_hareket_sayisi as projeHareketSayisi,
      proje_toplam_miktar as projeToplamMiktar,
      
      anormal_hareket_sayisi as anormalHareketSayisi,
      anormal_toplam_miktar as anormalToplamMiktar,
      
      -- Toplam hareket sayısı ve miktarı
      (normal_hareket_sayisi + proje_hareket_sayisi + anormal_hareket_sayisi) as toplamHareketSayisi,
      (normal_toplam_miktar + proje_toplam_miktar + anormal_toplam_miktar) as toplamCikisMiktari,
      
      -- Tespit durumu
      CASE 
        WHEN proje_hareket_sayisi > 0 AND anormal_hareket_sayisi > 0 THEN 'Proje + Anormal'
        WHEN proje_hareket_sayisi > 0 THEN 'Proje Hareketi'
        WHEN anormal_hareket_sayisi > 0 THEN 'Anormal Hareket'
        ELSE 'Normal'
      END as tespitDurumu,
      
      -- Yüzdesel dağılım
      CASE 
        WHEN (normal_toplam_miktar + proje_toplam_miktar + anormal_toplam_miktar) > 0
        THEN ROUND(proje_toplam_miktar * 100.0 / (normal_toplam_miktar + proje_toplam_miktar + anormal_toplam_miktar), 2)
        ELSE 0
      END as projeMiktarYuzde,
      
      CASE 
        WHEN (normal_toplam_miktar + proje_toplam_miktar + anormal_toplam_miktar) > 0
        THEN ROUND(anormal_toplam_miktar * 100.0 / (normal_toplam_miktar + proje_toplam_miktar + anormal_toplam_miktar), 2)
        ELSE 0
      END as anormalMiktarYuzde
      
    FROM AnormallikTespiti
    WHERE (normal_hareket_sayisi + proje_hareket_sayisi + anormal_hareket_sayisi) > 0
    ORDER BY 
      CASE 
        WHEN proje_hareket_sayisi > 0 AND anormal_hareket_sayisi > 0 THEN 1
        WHEN proje_hareket_sayisi > 0 THEN 2
        WHEN anormal_hareket_sayisi > 0 THEN 3
        ELSE 4
      END,
      (proje_toplam_miktar + anormal_toplam_miktar) DESC
  `
}

/**
 * Belirli bir stok için detaylı anormal ve proje bazlı hareket listesi
 * @param stokKodu - Stok kodu
 * @param baslangicTarih - Başlangıç tarihi
 * @param bitisTarih - Bitiş tarihi
 * @param projeKodu - Proje kodu (default: 'P')
 */
export const getStockAnomalyDetails = (
  stokKodu: string,
  baslangicTarih: string,
  bitisTarih: string,
  projeKodu: string = 'P'
) => {
  return getProjectBasedAnomalyDetectionQuery(stokKodu, baslangicTarih, bitisTarih, projeKodu)
}

/**
 * Özet istatistikler - Toplam proje ve anormal hareket sayıları
 * @param params - Sorgu parametreleri
 * @param projeKodu - Proje kodu (default: 'P')
 */
export const getAnomalySummaryStats = (params: QueryParams, projeKodu: string = 'P') => {
  const p1 = param(1) // baslangicTarih
  const p2 = param(2) // bitisTarih
  const p3 = param(3) // anaGrup (opsiyonel)
  
  return `
    WITH HareketIstatistik AS (
      SELECT 
        sh.${COLUMNS.HAREKET.STOK_KOD},
        AVG(CAST(sh.${COLUMNS.HAREKET.MIKTAR} AS FLOAT)) as ortalama_miktar,
        STDEV(sh.${COLUMNS.HAREKET.MIKTAR}) as standart_sapma
      FROM ${getFullTableName(TABLES.STOK_HAREKETLERI)} sh
      ${params.anaGrup ? `
      INNER JOIN ${getFullTableName(TABLES.STOKLAR)} s 
        ON sh.${COLUMNS.HAREKET.STOK_KOD} = s.${COLUMNS.STOK.KOD}
      ` : ''}
      WHERE sh.${COLUMNS.HAREKET.TIP} = ${StokHareketTip.CIKIS}
        AND sh.${COLUMNS.HAREKET.CINS} != ${StokHareketCins.FIYAT_FARKI}
        AND sh.${COLUMNS.HAREKET.TARIH} BETWEEN ${p1} AND ${p2}
        AND (sh.${COLUMNS.HAREKET.PROJE_KODU} IS NULL OR sh.${COLUMNS.HAREKET.PROJE_KODU} != '${projeKodu}')
        ${params.anaGrup ? `AND s.${COLUMNS.STOK.ANAGRUP_KOD} = ${p3}` : ''}
      GROUP BY sh.${COLUMNS.HAREKET.STOK_KOD}
    )
    SELECT 
      -- Proje bazlı istatistikler
      COUNT(DISTINCT CASE 
        WHEN sh.${COLUMNS.HAREKET.PROJE_KODU} = '${projeKodu}'
        THEN sh.${COLUMNS.HAREKET.STOK_KOD}
      END) as projeli_urun_sayisi,
      
      SUM(CASE 
        WHEN sh.${COLUMNS.HAREKET.PROJE_KODU} = '${projeKodu}'
        THEN 1 ELSE 0
      END) as toplam_proje_hareket_sayisi,
      
      SUM(CASE 
        WHEN sh.${COLUMNS.HAREKET.PROJE_KODU} = '${projeKodu}'
        THEN sh.${COLUMNS.HAREKET.MIKTAR} ELSE 0
      END) as toplam_proje_miktar,
      
      -- Anormal hareket istatistikleri
      COUNT(DISTINCT CASE 
        WHEN sh.${COLUMNS.HAREKET.MIKTAR} > hi.ortalama_miktar + (3 * hi.standart_sapma)
          AND (sh.${COLUMNS.HAREKET.PROJE_KODU} IS NULL OR sh.${COLUMNS.HAREKET.PROJE_KODU} != '${projeKodu}')
        THEN sh.${COLUMNS.HAREKET.STOK_KOD}
      END) as anormal_hareketli_urun_sayisi,
      
      SUM(CASE 
        WHEN sh.${COLUMNS.HAREKET.MIKTAR} > hi.ortalama_miktar + (3 * hi.standart_sapma)
          AND (sh.${COLUMNS.HAREKET.PROJE_KODU} IS NULL OR sh.${COLUMNS.HAREKET.PROJE_KODU} != '${projeKodu}')
        THEN 1 ELSE 0
      END) as toplam_anormal_hareket_sayisi,
      
      SUM(CASE 
        WHEN sh.${COLUMNS.HAREKET.MIKTAR} > hi.ortalama_miktar + (3 * hi.standart_sapma)
          AND (sh.${COLUMNS.HAREKET.PROJE_KODU} IS NULL OR sh.${COLUMNS.HAREKET.PROJE_KODU} != '${projeKodu}')
        THEN sh.${COLUMNS.HAREKET.MIKTAR} ELSE 0
      END) as toplam_anormal_miktar,
      
      -- Normal hareket istatistikleri
      SUM(CASE 
        WHEN sh.${COLUMNS.HAREKET.MIKTAR} <= ISNULL(hi.ortalama_miktar + (3 * hi.standart_sapma), sh.${COLUMNS.HAREKET.MIKTAR})
          AND (sh.${COLUMNS.HAREKET.PROJE_KODU} IS NULL OR sh.${COLUMNS.HAREKET.PROJE_KODU} != '${projeKodu}')
        THEN 1 ELSE 0
      END) as toplam_normal_hareket_sayisi,
      
      SUM(CASE 
        WHEN sh.${COLUMNS.HAREKET.MIKTAR} <= ISNULL(hi.ortalama_miktar + (3 * hi.standart_sapma), sh.${COLUMNS.HAREKET.MIKTAR})
          AND (sh.${COLUMNS.HAREKET.PROJE_KODU} IS NULL OR sh.${COLUMNS.HAREKET.PROJE_KODU} != '${projeKodu}')
        THEN sh.${COLUMNS.HAREKET.MIKTAR} ELSE 0
      END) as toplam_normal_miktar,
      
      -- Genel toplamlar
      COUNT(*) as toplam_hareket_sayisi,
      SUM(sh.${COLUMNS.HAREKET.MIKTAR}) as toplam_miktar
      
    FROM ${getFullTableName(TABLES.STOK_HAREKETLERI)} sh
    LEFT JOIN HareketIstatistik hi ON sh.${COLUMNS.HAREKET.STOK_KOD} = hi.${COLUMNS.HAREKET.STOK_KOD}
    ${params.anaGrup ? `
    INNER JOIN ${getFullTableName(TABLES.STOKLAR)} s 
      ON sh.${COLUMNS.HAREKET.STOK_KOD} = s.${COLUMNS.STOK.KOD}
    ` : ''}
    WHERE sh.${COLUMNS.HAREKET.TIP} = ${StokHareketTip.CIKIS}
      AND sh.${COLUMNS.HAREKET.CINS} != ${StokHareketCins.FIYAT_FARKI}
      AND sh.${COLUMNS.HAREKET.TARIH} BETWEEN ${p1} AND ${p2}
      ${params.anaGrup ? `AND s.${COLUMNS.STOK.ANAGRUP_KOD} = ${p3}` : ''}
  `
}