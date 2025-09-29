/**
 * SQL Formatlama Yardımcı Fonksiyonları
 * SQL sorgularını formatlamak ve optimize etmek için kullanılır
 */

/**
 * SQL sorgusunu okunabilir formata getirir
 * @param query - Ham SQL sorgusu
 * @param indent - Girinti seviyesi
 */
export const formatSQL = (query: string, indent: number = 2): string => {
    const keywords = [
      'SELECT', 'FROM', 'WHERE', 'JOIN', 'LEFT JOIN', 'RIGHT JOIN', 'INNER JOIN',
      'GROUP BY', 'ORDER BY', 'HAVING', 'WITH', 'AS', 'ON', 'AND', 'OR',
      'CASE', 'WHEN', 'THEN', 'ELSE', 'END', 'INSERT', 'UPDATE', 'DELETE',
      'VALUES', 'SET', 'INTO', 'UNION', 'UNION ALL', 'EXCEPT', 'INTERSECT'
    ]
    
    let formatted = query
    const indentStr = ' '.repeat(indent)
    
    // Anahtar kelimeleri yeni satıra al
    keywords.forEach(keyword => {
      const regex = new RegExp(`\\b${keyword}\\b`, 'gi')
      formatted = formatted.replace(regex, `\n${indentStr}${keyword}`)
    })
    
    // Virgülleri düzenle
    formatted = formatted.replace(/,\s*/g, ',\n' + indentStr + '  ')
    
    // Fazla boşlukları temizle
    formatted = formatted.replace(/\n\s*\n/g, '\n')
    formatted = formatted.trim()
    
    return formatted
  }
  
  /**
   * SQL injection koruması için string temizleme
   * @param value - Temizlenecek değer
   */
  export const sanitizeValue = (value: any): string => {
    if (value === null || value === undefined) return 'NULL'
    
    if (typeof value === 'boolean') {
      return value ? '1' : '0'
    }
    
    if (typeof value === 'number') {
      return value.toString()
    }
    
    if (value instanceof Date) {
      return `'${formatDateForSQL(value)}'`
    }
    
    if (typeof value === 'string') {
      // Tek tırnakları escape et
      const escaped = value.replace(/'/g, "''")
      return `'${escaped}'`
    }
    
    return 'NULL'
  }
  
  /**
   * Tarih değerini SQL Server formatına çevirir
   * @param date - JavaScript Date objesi
   * @param includeTime - Saat bilgisi dahil edilsin mi
   */
  export const formatDateForSQL = (date: Date | string, includeTime: boolean = false): string => {
    if (typeof date === 'string') return date
    
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    
    if (!includeTime) {
      return `${year}-${month}-${day}`
    }
    
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')
    const seconds = String(date.getSeconds()).padStart(2, '0')
    
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
  }
  
  /**
   * Kolon isimlerini köşeli parantez ile escape eder
   * @param columnName - Kolon ismi
   */
  export const escapeColumnName = (columnName: string): string => {
    // Zaten escape edilmişse tekrar etme
    if (columnName.startsWith('[') && columnName.endsWith(']')) {
      return columnName
    }
    
    // Nokta içeriyorsa (tablo.kolon) ayrı ayrı escape et
    if (columnName.includes('.')) {
      return columnName.split('.').map(part => `[${part}]`).join('.')
    }
    
    return `[${columnName}]`
  }
  
  /**
   * Tablo ismini köşeli parantez ile escape eder
   * @param tableName - Tablo ismi
   */
  export const escapeTableName = (tableName: string): string => {
    return escapeColumnName(tableName)
  }
  
  /**
   * SQL Server için TOP ifadesi oluşturur
   * @param limit - Limit değeri
   * @param percent - Yüzde olarak mı
   */
  export const formatTop = (limit: number, percent: boolean = false): string => {
    return `TOP ${limit}${percent ? ' PERCENT' : ''}`
  }
  
  /**
   * ORDER BY ifadesi oluşturur
   * @param columns - Sıralama kolonları
   */
  export const formatOrderBy = (
    columns: Array<{ column: string; direction?: 'ASC' | 'DESC' }>
  ): string => {
    if (columns.length === 0) return ''
    
    const orderParts = columns.map(({ column, direction = 'ASC' }) => 
      `${column} ${direction}`
    )
    
    return `ORDER BY ${orderParts.join(', ')}`
  }
  
  /**
   * CASE WHEN ifadesi oluşturur
   * @param cases - Koşul ve sonuç çiftleri
   * @param elseValue - ELSE değeri
   */
  export const formatCaseWhen = (
    cases: Array<{ condition: string; result: string }>,
    elseValue: string = 'NULL'
  ): string => {
    if (cases.length === 0) return elseValue
    
    const whenParts = cases.map(({ condition, result }) => 
      `WHEN ${condition} THEN ${result}`
    ).join('\n    ')
    
    return `CASE\n    ${whenParts}\n    ELSE ${elseValue}\n  END`
  }
  
  /**
   * Decimal formatlama için CAST ifadesi
   * @param expression - İfade
   * @param precision - Toplam basamak sayısı
   * @param scale - Ondalık basamak sayısı
   */
  export const formatDecimalCast = (
    expression: string, 
    precision: number = 10, 
    scale: number = 2
  ): string => {
    return `CAST(${expression} AS DECIMAL(${precision}, ${scale}))`
  }
  
  /**
   * COALESCE ifadesi oluşturur (NULL kontrolü)
   * @param expressions - Kontrol edilecek ifadeler
   */
  export const formatCoalesce = (...expressions: string[]): string => {
    if (expressions.length === 0) return 'NULL'
    if (expressions.length === 1) return expressions[0]
    return `COALESCE(${expressions.join(', ')})`
  }
  
  /**
   * SQL Server için string birleştirme
   * @param parts - Birleştirilecek parçalar
   */
  export const formatConcat = (...parts: string[]): string => {
    return parts.join(' + ')
  }
  
  /**
   * Alt sorgu parantezleme
   * @param subquery - Alt sorgu
   * @param alias - Tablo alias'ı
   */
  export const formatSubquery = (subquery: string, alias?: string): string => {
    const formatted = `(${subquery})`
    return alias ? `${formatted} AS ${alias}` : formatted
  }
  
  /**
   * Parametre listesi oluşturur
   * @param count - Parametre sayısı
   * @param startIndex - Başlangıç indexi
   */
  export const generateParamList = (count: number, startIndex: number = 1): string => {
    return Array.from({ length: count }, (_, i) => `@P${startIndex + i}`).join(', ')
  }
  
  /**
   * SQL yorumu ekler
   * @param text - Yorum metni
   * @param multiline - Çok satırlı mı
   */
  export const formatComment = (text: string, multiline: boolean = false): string => {
    if (multiline) {
      return `/* ${text} */`
    }
    return `-- ${text}`
  }
  
  /**
   * Örnek kullanım:
   * 
   * const formattedQuery = formatSQL(`
   *   SELECT ${formatTop(10)} 
   *     ${formatCaseWhen([
   *       { condition: 'miktar > 100', result: "'Yüksek'" },
   *       { condition: 'miktar > 50', result: "'Orta'" }
   *     ], "'Düşük'")} as seviye,
   *     ${formatDecimalCast('miktar * 1.18', 10, 2)} as kdvli_fiyat
   *   FROM ${escapeTableName('STOKLAR')}
   *   ${formatOrderBy([{ column: 'miktar', direction: 'DESC' }])}
   * `)
   */