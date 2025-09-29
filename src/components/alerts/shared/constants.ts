/**
 * Stok Uyarı Sistemi - Paylaşılan Sabitler
 */

// Severity seviyeleri ve renkleri
export const SEVERITY_CONFIGS = {
    critical: {
      label: 'Kritik',
      color: 'red',
      bgColor: 'bg-red-500',
      textColor: 'text-red-600',
      lightBg: 'bg-red-50',
      darkBg: 'bg-red-950',
      progressColor: 'bg-red-500',
      badgeVariant: 'destructive' as const,
      dotColor: 'bg-red-500',
      priority: 1
    },
    high: {
      label: 'Yüksek',
      color: 'orange',
      bgColor: 'bg-orange-500',
      textColor: 'text-orange-600',
      lightBg: 'bg-orange-50',
      darkBg: 'bg-orange-950',
      progressColor: 'bg-orange-500',
      badgeVariant: 'warning' as const,
      dotColor: 'bg-orange-500',
      priority: 2
    },
    medium: {
      label: 'Orta',
      color: 'yellow',
      bgColor: 'bg-yellow-500',
      textColor: 'text-yellow-600',
      lightBg: 'bg-yellow-50',
      darkBg: 'bg-yellow-950',
      progressColor: 'bg-yellow-500',
      badgeVariant: 'warning' as const,
      dotColor: 'bg-yellow-500',
      priority: 3
    }
  } as const
  
  // Uyarı durumları
  export const ALERT_STATUS = {
    ACTIVE: 'active',
    READ: 'read',
    DISMISSED: 'dismissed'
  } as const
  
  // LocalStorage keys
  export const STORAGE_KEYS = {
    ALERTS: 'stockAlerts',
    READ: 'readAlerts',
    DISMISSED: 'dismissedAlerts',
    HISTORY: 'alertHistory',
    CLEANUP_DONE: 'alertCleanupDone'
  } as const
  
  // UI Sabitleri
  export const UI_CONSTANTS = {
    POPOVER_WIDTH: 520,
    POPOVER_HEIGHT: 600,
    CARD_MIN_HEIGHT: 180,
    MAX_VISIBLE_ALERTS: 5,
    ANIMATION_DURATION: 200,
    NOTIFICATION_TIMEOUT: 2000,
    ALERT_EXPIRY_HOURS: 24
  } as const
  
  // Uyarı kriterleri
  export const ALERT_CRITERIA = {
    MIN_SUGGESTED_ORDER: 1,
    MAX_STOCK_MONTHS: 1.5,
    CRITICAL_STOCK_MONTHS: 0.5,
    EXCLUDED_MOVEMENT_STATUS: ['Ölü Stok', 'Durgun'] as const
  } as const
  
  // Metin sabitleri
  export const TEXTS = {
    EMPTY_ACTIVE: 'Aktif uyarı bulunmuyor',
    EMPTY_READ: 'Okunmuş uyarı bulunmuyor',
    LOADING: 'Yükleniyor...',
    NO_SUGGESTION: 'Öneri yok',
    SPECIAL_ORDER: 'Özel sipariş',
    ONE_TIME: 'Tek seferlik',
    LOW_FREQUENCY: 'Az satılan',
    URGENT: 'Acil',
    CRITICAL: 'Kritik',
    NORMAL: 'Normal',
    DELETE_CONFIRM: 'Bu uyarıyı silmek istediğinize emin misiniz?'
  } as const