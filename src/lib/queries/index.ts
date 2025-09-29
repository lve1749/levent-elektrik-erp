/**
 * SQL Sorgu Modülleri - Ana Export Dosyası
 * Tüm SQL sorgularına merkezi erişim noktası
 */

// Tip tanımlamaları
export * from './types'

// Temel sorgular
export * as GroupQueries from './base/groups'
export * as StockMovementQueries from './base/stock-movements'
export * as OrderQueries from './base/orders'

// Analiz sorguları
export * as StockAnalysisQueries from './analysis/stock-analysis'
export * as SeasonalityQueries from './analysis/seasonality'
export * as OrderSuggestionQueries from './analysis/order-suggestions'
export * as SummaryStatsQueries from './analysis/summary-stats'
export * as TurnoverQueries from './analysis/turnover-calc'

// Yardımcı fonksiyonlar
export { QueryBuilder, createQueryBuilder } from './utils/query-builder'
export * as SQLFilters from './utils/filters'
export * as SQLFormatters from './utils/formatters'

// Hazır sorgu fonksiyonları - kolay kullanım için
import { getStockAnalysisQuery, getFilteredStockAnalysisQuery, getStockAnalysisSummaryQuery } from './analysis/stock-analysis'
import { getMainGroupsQuery } from './base/groups'
import { getStockMonthlyChartData } from './analysis/seasonality'

export const queries = {
  // Ana sorgular
  getStockAnalysis: getStockAnalysisQuery,
  getFilteredStockAnalysis: getFilteredStockAnalysisQuery,
  getStockAnalysisSummary: getStockAnalysisSummaryQuery,
  
  // Liste sorguları
  getMainGroups: getMainGroupsQuery,
  
  // Grafik verileri
  getMonthlyChart: getStockMonthlyChartData,
} as const

/**
 * Örnek kullanım:
 * 
 * import { queries, QueryParams } from '@/lib/queries'
 * 
 * const params: QueryParams = {
 *   baslangicTarih: '2025-01-01',
 *   bitisTarih: '2025-12-31',
 *   anaGrup: 'GIDA',
 *   aySayisi: 12
 * }
 * 
 * const query = queries.getStockAnalysis(params)
 * const result = await prisma.$queryRawUnsafe(query, ...params)
 */