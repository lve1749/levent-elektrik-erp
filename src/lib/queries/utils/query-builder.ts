/**
 * SQL Query Builder
 * Dinamik SQL sorguları oluşturmak için yardımcı sınıf
 */

import { sanitizeParam } from '../types'

export interface WhereCondition {
  column: string
  operator: '=' | '!=' | '>' | '<' | '>=' | '<=' | 'LIKE' | 'IN' | 'BETWEEN'
  value: any
  value2?: any // BETWEEN için ikinci değer
}

export interface JoinClause {
  type: 'INNER' | 'LEFT' | 'RIGHT' | 'FULL'
  table: string
  on: string
}

export class QueryBuilder {
  private selectColumns: string[] = []
  private fromTable: string = ''
  private joins: JoinClause[] = []
  private whereConditions: string[] = []
  private groupByColumns: string[] = []
  private havingConditions: string[] = []
  private orderByColumns: { column: string; direction: 'ASC' | 'DESC' }[] = []
  private limitValue?: number
  private withClauses: { name: string; query: string }[] = []

  /**
   * WITH CTE ekler
   */
  with(name: string, query: string): this {
    this.withClauses.push({ name, query })
    return this
  }

  /**
   * SELECT kolonlarını belirler
   */
  select(...columns: string[]): this {
    this.selectColumns.push(...columns)
    return this
  }

  /**
   * FROM tablosunu belirler
   */
  from(table: string): this {
    this.fromTable = table
    return this
  }

  /**
   * JOIN ekler
   */
  join(type: JoinClause['type'], table: string, on: string): this {
    this.joins.push({ type, table, on })
    return this
  }

  /**
   * WHERE koşulu ekler
   */
  where(condition: WhereCondition | string): this {
    if (typeof condition === 'string') {
      this.whereConditions.push(condition)
    } else {
      const whereStr = this.buildWhereCondition(condition)
      if (whereStr) {
        this.whereConditions.push(whereStr)
      }
    }
    return this
  }

  /**
   * WHERE koşulunu oluşturur
   */
  private buildWhereCondition(condition: WhereCondition): string {
    const { column, operator, value, value2 } = condition

    // NULL değer kontrolü
    if (value === null || value === undefined) {
      if (operator === '=') return `${column} IS NULL`
      if (operator === '!=') return `${column} IS NOT NULL`
      return ''
    }

    switch (operator) {
      case 'IN':
        if (Array.isArray(value)) {
          const values = value.map(v => sanitizeParam(v)).join(', ')
          return `${column} IN (${values})`
        }
        return ''
      
      case 'BETWEEN':
        if (value2 !== undefined) {
          return `${column} BETWEEN ${sanitizeParam(value)} AND ${sanitizeParam(value2)}`
        }
        return ''
      
      case 'LIKE':
        return `${column} LIKE ${sanitizeParam(value)}`
      
      default:
        return `${column} ${operator} ${sanitizeParam(value)}`
    }
  }

  /**
   * GROUP BY ekler
   */
  groupBy(...columns: string[]): this {
    this.groupByColumns.push(...columns)
    return this
  }

  /**
   * HAVING koşulu ekler
   */
  having(condition: string): this {
    this.havingConditions.push(condition)
    return this
  }

  /**
   * ORDER BY ekler
   */
  orderBy(column: string, direction: 'ASC' | 'DESC' = 'ASC'): this {
    this.orderByColumns.push({ column, direction })
    return this
  }

  /**
   * LIMIT ekler (SQL Server için TOP)
   */
  limit(value: number): this {
    this.limitValue = value
    return this
  }

  /**
   * Sorguyu oluşturur
   */
  build(): string {
    const parts: string[] = []

    // WITH clause
    if (this.withClauses.length > 0) {
      const withParts = this.withClauses.map(({ name, query }) => `${name} AS (\n${query}\n)`)
      parts.push(`WITH ${withParts.join(',\n')}`)
    }

    // SELECT
    const selectStr = this.selectColumns.length > 0 
      ? this.selectColumns.join(', ') 
      : '*'
    
    // SQL Server için TOP
    const topStr = this.limitValue ? `TOP ${this.limitValue} ` : ''
    parts.push(`SELECT ${topStr}${selectStr}`)

    // FROM
    if (this.fromTable) {
      parts.push(`FROM ${this.fromTable}`)
    }

    // JOINs
    for (const join of this.joins) {
      parts.push(`${join.type} JOIN ${join.table} ON ${join.on}`)
    }

    // WHERE
    if (this.whereConditions.length > 0) {
      parts.push(`WHERE ${this.whereConditions.join(' AND ')}`)
    }

    // GROUP BY
    if (this.groupByColumns.length > 0) {
      parts.push(`GROUP BY ${this.groupByColumns.join(', ')}`)
    }

    // HAVING
    if (this.havingConditions.length > 0) {
      parts.push(`HAVING ${this.havingConditions.join(' AND ')}`)
    }

    // ORDER BY
    if (this.orderByColumns.length > 0) {
      const orderStr = this.orderByColumns
        .map(({ column, direction }) => `${column} ${direction}`)
        .join(', ')
      parts.push(`ORDER BY ${orderStr}`)
    }

    return parts.join('\n')
  }

  /**
   * Sorguyu temizler ve yeniden başlar
   */
  reset(): this {
    this.selectColumns = []
    this.fromTable = ''
    this.joins = []
    this.whereConditions = []
    this.groupByColumns = []
    this.havingConditions = []
    this.orderByColumns = []
    this.limitValue = undefined
    this.withClauses = []
    return this
  }
}

/**
 * Yeni QueryBuilder instance'ı oluşturur
 */
export const createQueryBuilder = () => new QueryBuilder()

/**
 * Örnek kullanım:
 * 
 * const query = createQueryBuilder()
 *   .select('sto_kod', 'sto_isim', 'SUM(sth_miktar) as toplam')
 *   .from('STOKLAR s')
 *   .join('LEFT', 'STOK_HAREKETLERI sh', 's.sto_kod = sh.sth_stok_kod')
 *   .where({ column: 's.sto_anagrup_kod', operator: '=', value: 'GIDA' })
 *   .where({ column: 'sh.sth_tarih', operator: 'BETWEEN', value: '2025-01-01', value2: '2025-12-31' })
 *   .groupBy('sto_kod', 'sto_isim')
 *   .having('SUM(sth_miktar) > 0')
 *   .orderBy('toplam', 'DESC')
 *   .limit(10)
 *   .build()
 */