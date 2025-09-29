/**
 * SQL Filtre Yardımcı Fonksiyonları
 * Dinamik filtre koşulları oluşturmak için kullanılır
 */

import { param } from '../types'

/**
 * Tarih aralığı filtresi oluşturur
 * @param column - Tarih kolonu
 * @param startParam - Başlangıç tarihi parametre indexi
 * @param endParam - Bitiş tarihi parametre indexi
 */
export const dateRangeFilter = (column: string, startParam: number, endParam: number): string => {
  return `${column} BETWEEN ${param(startParam)} AND ${param(endParam)}`
}

/**
 * NULL kontrolü ile opsiyonel filtre oluşturur
 * @param column - Kolon adı
 * @param paramIndex - Parametre indexi
 * @param operator - Karşılaştırma operatörü
 */
export const optionalFilter = (
  column: string, 
  paramIndex: number, 
  operator: '=' | '!=' | '>' | '<' | '>=' | '<=' | 'LIKE' = '='
): string => {
  return `(@P${paramIndex} IS NULL OR ${column} ${operator} @P${paramIndex})`
}

/**
 * IN operatörü için filtre oluşturur
 * @param column - Kolon adı
 * @param values - Değerler listesi
 */
export const inFilter = (column: string, values: (string | number)[]): string => {
  if (values.length === 0) return '1=1'
  
  const formattedValues = values.map(v => 
    typeof v === 'string' ? `'${v.replace(/'/g, "''")}'` : v
  ).join(', ')
  
  return `${column} IN (${formattedValues})`
}

/**
 * Metin arama filtresi (LIKE)
 * @param columns - Aranacak kolonlar
 * @param paramIndex - Parametre indexi
 * @param mode - Arama modu
 */
export const textSearchFilter = (
  columns: string[], 
  paramIndex: number,
  mode: 'contains' | 'startsWith' | 'endsWith' | 'exact' = 'contains'
): string => {
  const conditions = columns.map(col => {
    switch (mode) {
      case 'contains':
        return `${col} LIKE '%' + @P${paramIndex} + '%'`
      case 'startsWith':
        return `${col} LIKE @P${paramIndex} + '%'`
      case 'endsWith':
        return `${col} LIKE '%' + @P${paramIndex}`
      case 'exact':
        return `${col} = @P${paramIndex}`
    }
  })
  
  return `(${conditions.join(' OR ')})`
}

/**
 * Sayısal aralık filtresi
 * @param column - Kolon adı
 * @param minParam - Minimum değer parametre indexi
 * @param maxParam - Maximum değer parametre indexi
 */
export const numericRangeFilter = (
  column: string, 
  minParam?: number, 
  maxParam?: number
): string => {
  const conditions: string[] = []
  
  if (minParam !== undefined) {
    conditions.push(`(@P${minParam} IS NULL OR ${column} >= @P${minParam})`)
  }
  
  if (maxParam !== undefined) {
    conditions.push(`(@P${maxParam} IS NULL OR ${column} <= @P${maxParam})`)
  }
  
  return conditions.length > 0 ? `(${conditions.join(' AND ')})` : '1=1'
}

/**
 * Boolean filtre oluşturur
 * @param column - Kolon adı
 * @param paramIndex - Parametre indexi
 */
export const booleanFilter = (column: string, paramIndex: number): string => {
  return `(@P${paramIndex} IS NULL OR ${column} = @P${paramIndex})`
}

/**
 * Case-insensitive karşılaştırma
 * @param column - Kolon adı
 * @param paramIndex - Parametre indexi
 */
export const caseInsensitiveFilter = (column: string, paramIndex: number): string => {
  return `UPPER(${column}) = UPPER(@P${paramIndex})`
}

/**
 * Hareket durumu filtresi
 * @param daysColumn - Gün sayısı kolonu (örn: sonCikisGun)
 * @param status - Hareket durumu
 */
export const movementStatusFilter = (
  daysColumn: string,
  status: 'active' | 'slow' | 'stagnant' | 'dead'
): string => {
  switch (status) {
    case 'active':
      return `${daysColumn} <= 30`
    case 'slow':
      return `${daysColumn} BETWEEN 31 AND 90`
    case 'stagnant':
      return `${daysColumn} BETWEEN 91 AND 365`
    case 'dead':
      return `${daysColumn} > 365`
  }
}

/**
 * Stok durumu filtresi (kritik, az, yeterli)
 * @param stockMonthColumn - Aylık stok kolonu
 * @param status - Stok durumu
 */
export const stockStatusFilter = (
  stockMonthColumn: string,
  status: 'critical' | 'low' | 'sufficient'
): string => {
  switch (status) {
    case 'critical':
      return `${stockMonthColumn} BETWEEN 0 AND 1`
    case 'low':
      return `${stockMonthColumn} BETWEEN 1.01 AND 2`
    case 'sufficient':
      return `${stockMonthColumn} > 2`
  }
}

/**
 * Birden fazla filtreyi AND ile birleştirir
 * @param filters - Filtre listesi
 */
export const combineFiltersAnd = (...filters: (string | null | undefined)[]): string => {
  const validFilters = filters.filter(f => f && f.trim() !== '')
  if (validFilters.length === 0) return '1=1'
  if (validFilters.length === 1) return validFilters[0]!
  return `(${validFilters.join(' AND ')})`
}

/**
 * Birden fazla filtreyi OR ile birleştirir
 * @param filters - Filtre listesi
 */
export const combineFiltersOr = (...filters: (string | null | undefined)[]): string => {
  const validFilters = filters.filter(f => f && f.trim() !== '')
  if (validFilters.length === 0) return '1=0'
  if (validFilters.length === 1) return validFilters[0]!
  return `(${validFilters.join(' OR ')})`
}

/**
 * Dinamik WHERE koşulu oluşturur
 * @param baseCondition - Temel koşul
 * @param additionalFilters - Ek filtreler
 */
export const buildWhereClause = (
  baseCondition: string = '1=1',
  ...additionalFilters: (string | null | undefined)[]
): string => {
  const allConditions = [baseCondition, ...additionalFilters.filter(Boolean)]
  return `WHERE ${combineFiltersAnd(...allConditions)}`
}

/**
 * Örnek kullanım:
 * 
 * const whereClause = buildWhereClause(
 *   '1=1',
 *   dateRangeFilter('sth_tarih', 1, 2),
 *   optionalFilter('sto_anagrup_kod', 3),
 *   textSearchFilter(['sto_kod', 'sto_isim'], 4),
 *   stockStatusFilter('ortalamaAylikStok', 'critical')
 * )
 */