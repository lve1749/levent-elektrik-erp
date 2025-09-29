/**
 * Grup Sorguları
 * Stok grupları ile ilgili temel sorgular
 */

import { TABLES, COLUMNS } from '../types'

/**
 * Ana grup listesini getiren sorgu
 * Benzersiz ana grup kodlarını döndürür
 * Not: Mikro'da grup ismi ayrı tabloda tutulmadığı için kod ile aynı
 */
export const getMainGroupsQuery = () => `
  SELECT DISTINCT
    ${COLUMNS.STOK.ANAGRUP_KOD} as grupKodu,
    ${COLUMNS.STOK.ANAGRUP_KOD} as grupIsmi
  FROM ${TABLES.STOKLAR}
  WHERE ${COLUMNS.STOK.ANAGRUP_KOD} IS NOT NULL 
    AND ${COLUMNS.STOK.ANAGRUP_KOD} != ''
  ORDER BY ${COLUMNS.STOK.ANAGRUP_KOD} ASC
`

/**
 * Alt grup listesini getiren sorgu
 * @param anaGrupKodu - Filtrelenecek ana grup kodu (opsiyonel)
 */
export const getSubGroupsQuery = (anaGrupKodu?: string | null) => `
  SELECT DISTINCT
    ${COLUMNS.STOK.ALTGRUP_KOD} as altGrupKodu,
    ${COLUMNS.STOK.ALTGRUP_KOD} as altGrupIsmi
  FROM ${TABLES.STOKLAR}
  WHERE ${COLUMNS.STOK.ALTGRUP_KOD} IS NOT NULL 
    AND ${COLUMNS.STOK.ALTGRUP_KOD} != ''
    ${anaGrupKodu ? `AND ${COLUMNS.STOK.ANAGRUP_KOD} = '${anaGrupKodu}'` : ''}
  ORDER BY ${COLUMNS.STOK.ALTGRUP_KOD} ASC
`

/**
 * Ana ve alt grup kombinasyonlarını getiren sorgu
 * Grup bazında stok sayılarını da gösterir
 */
export const getGroupCombinationsQuery = () => `
  SELECT DISTINCT
    ${COLUMNS.STOK.ANAGRUP_KOD} as anaGrupKodu,
    ${COLUMNS.STOK.ALTGRUP_KOD} as altGrupKodu,
    COUNT(*) as stokSayisi
  FROM ${TABLES.STOKLAR}
  WHERE ${COLUMNS.STOK.ANAGRUP_KOD} IS NOT NULL 
    AND ${COLUMNS.STOK.ALTGRUP_KOD} IS NOT NULL
  GROUP BY ${COLUMNS.STOK.ANAGRUP_KOD}, ${COLUMNS.STOK.ALTGRUP_KOD}
  ORDER BY ${COLUMNS.STOK.ANAGRUP_KOD}, ${COLUMNS.STOK.ALTGRUP_KOD}
`

/**
 * Belirli bir gruptaki stok sayısını getiren sorgu
 * @param anaGrupKodu - Ana grup kodu
 * @param altGrupKodu - Alt grup kodu (opsiyonel)
 */
export const getGroupStockCountQuery = (anaGrupKodu: string, altGrupKodu?: string | null) => `
  SELECT COUNT(DISTINCT ${COLUMNS.STOK.KOD}) as stokSayisi
  FROM ${TABLES.STOKLAR}
  WHERE ${COLUMNS.STOK.ANAGRUP_KOD} = '${anaGrupKodu}'
    ${altGrupKodu ? `AND ${COLUMNS.STOK.ALTGRUP_KOD} = '${altGrupKodu}'` : ''}
`

/**
 * Grup bazında hareket özeti
 * Hangi gruplarda ne kadar hareket olduğunu gösterir
 * @param baslangicTarih - Başlangıç tarihi
 * @param bitisTarih - Bitiş tarihi
 */
export const getGroupMovementSummaryQuery = (baslangicTarih: string, bitisTarih: string) => `
  SELECT 
    s.${COLUMNS.STOK.ANAGRUP_KOD} as anaGrupKodu,
    COUNT(DISTINCT s.${COLUMNS.STOK.KOD}) as stokSayisi,
    COUNT(DISTINCT sh.${COLUMNS.HAREKET.TARIH}) as hareketGunSayisi,
    SUM(CASE WHEN sh.${COLUMNS.HAREKET.TIP} = 0 THEN sh.${COLUMNS.HAREKET.MIKTAR} ELSE 0 END) as toplamGiris,
    SUM(CASE WHEN sh.${COLUMNS.HAREKET.TIP} = 1 THEN sh.${COLUMNS.HAREKET.MIKTAR} ELSE 0 END) as toplamCikis
  FROM ${TABLES.STOKLAR} s
  LEFT JOIN ${TABLES.STOK_HAREKETLERI} sh 
    ON s.${COLUMNS.STOK.KOD} = sh.${COLUMNS.HAREKET.STOK_KOD}
    AND sh.${COLUMNS.HAREKET.TARIH} BETWEEN @P1 AND @P2
  WHERE s.${COLUMNS.STOK.ANAGRUP_KOD} IS NOT NULL
  GROUP BY s.${COLUMNS.STOK.ANAGRUP_KOD}
  ORDER BY toplamCikis DESC
`