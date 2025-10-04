/**
 * Safe Storage Utility
 * localStorage/sessionStorage için quota ve error handling
 */

const MAX_ITEM_SIZE = 1024 * 1024 // 1MB per item
const STORAGE_QUOTA_WARNING = 0.8 // %80 doluluk uyarısı

interface StorageStats {
  used: number
  total: number
  percentage: number
}

class SafeStorage {
  private storageType: Storage
  private storageName: string

  constructor(storage: Storage, name: string) {
    this.storageType = storage
    this.storageName = name
  }

  /**
   * Güvenli setItem - Quota ve hata kontrolü ile
   */
  setItem(key: string, value: any): boolean {
    if (typeof window === 'undefined') return false

    try {
      const serialized = JSON.stringify(value)
      
      // Boyut kontrolü
      if (serialized.length > MAX_ITEM_SIZE) {
        console.warn(`[${this.storageName}] Item too large:`, key, `(${(serialized.length / 1024).toFixed(2)}KB)`)
        return false
      }

      // Quota kontrolü yap
      const stats = this.getStats()
      if (stats.percentage > STORAGE_QUOTA_WARNING) {
        console.warn(`[${this.storageName}] Storage ${(stats.percentage * 100).toFixed(0)}% full, cleaning old data...`)
        this.cleanup()
      }

      // Kaydet
      this.storageType.setItem(key, serialized)
      return true
      
    } catch (error) {
      // Quota hatası
      if (error instanceof DOMException && error.code === 22) {
        console.error(`[${this.storageName}] Quota exceeded for key:`, key)
        
        // Acil temizlik
        this.emergencyCleanup(key)
        
        // Tekrar dene
        try {
          const serialized = JSON.stringify(value)
          this.storageType.setItem(key, serialized)
          return true
        } catch (retryError) {
          console.error(`[${this.storageName}] Failed even after cleanup:`, key)
          return false
        }
      }
      
      console.error(`[${this.storageName}] setItem error:`, key, error)
      return false
    }
  }

  /**
   * Güvenli getItem - Parse hata kontrolü ile
   */
  getItem<T = any>(key: string, defaultValue: T | null = null): T | null {
    if (typeof window === 'undefined') return defaultValue

    try {
      const item = this.storageType.getItem(key)
      if (item === null) return defaultValue
      
      return JSON.parse(item) as T
    } catch (error) {
      console.error(`[${this.storageName}] getItem parse error:`, key, error)
      
      // Corrupt data, temizle
      this.removeItem(key)
      return defaultValue
    }
  }

  /**
   * Item sil
   */
  removeItem(key: string): void {
    if (typeof window === 'undefined') return
    
    try {
      this.storageType.removeItem(key)
    } catch (error) {
      console.error(`[${this.storageName}] removeItem error:`, key, error)
    }
  }

  /**
   * Tümünü temizle
   */
  clear(): void {
    if (typeof window === 'undefined') return
    
    try {
      this.storageType.clear()
    } catch (error) {
      console.error(`[${this.storageName}] clear error:`, error)
    }
  }

  /**
   * Storage istatistikleri
   */
  getStats(): StorageStats {
    if (typeof window === 'undefined') {
      return { used: 0, total: 0, percentage: 0 }
    }

    try {
      let used = 0
      for (let i = 0; i < this.storageType.length; i++) {
        const key = this.storageType.key(i)
        if (key) {
          const item = this.storageType.getItem(key)
          if (item) {
            used += item.length + key.length
          }
        }
      }

      // Tahmini total (5-10MB arası)
      const total = 5 * 1024 * 1024 // 5MB
      
      return {
        used,
        total,
        percentage: used / total
      }
    } catch (error) {
      console.error(`[${this.storageName}] getStats error:`, error)
      return { used: 0, total: 0, percentage: 0 }
    }
  }

  /**
   * Eski verileri temizle (%80 dolulukta)
   */
  private cleanup(): void {
    console.log(`[${this.storageName}] Running cleanup...`)
    
    // stockAnalysis ile başlayan eski key'leri bul
    const keysToCheck = []
    for (let i = 0; i < this.storageType.length; i++) {
      const key = this.storageType.key(i)
      if (key && key.startsWith('stockAnalysis')) {
        keysToCheck.push(key)
      }
    }

    // En eski 3 key'i sil (Filters hariç)
    const keysToKeep = ['stockAnalysisFilters', 'stockAnalysisVisibleColumns', 'stockAnalysisRowsPerPage']
    const keysToDelete = keysToCheck
      .filter(key => !keysToKeep.includes(key))
      .slice(0, 3)

    keysToDelete.forEach(key => {
      console.log(`[${this.storageName}] Removing old key:`, key)
      this.removeItem(key)
    })
  }

  /**
   * Acil temizlik (Quota exceeded hatası sonrası)
   */
  private emergencyCleanup(attemptedKey: string): void {
    console.error(`[${this.storageName}] Emergency cleanup triggered by:`, attemptedKey)
    
    // stockAnalysisData'yı temizle (en büyük item)
    if (attemptedKey !== 'stockAnalysisData') {
      this.removeItem('stockAnalysisData')
    }

    // Diğer büyük item'ları temizle
    const nonCriticalKeys = [
      'stockAnalysisSearchTerm',
      'stockAnalysisSortConfig',
      'stockAnalysisSelectedItems'
    ]

    nonCriticalKeys.forEach(key => {
      if (key !== attemptedKey) {
        this.removeItem(key)
      }
    })
  }
}

// Export instances
export const safeLocalStorage = new SafeStorage(
  typeof window !== 'undefined' ? localStorage : {} as Storage,
  'localStorage'
)

export const safeSessionStorage = new SafeStorage(
  typeof window !== 'undefined' ? sessionStorage : {} as Storage,
  'sessionStorage'
)

// Export utility functions
export function getStorageStats() {
  return {
    localStorage: safeLocalStorage.getStats(),
    sessionStorage: safeSessionStorage.getStats()
  }
}