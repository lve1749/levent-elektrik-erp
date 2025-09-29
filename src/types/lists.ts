// 1. KLASÖR (Folder)
export interface Folder {
  id: string
  name: string
  description?: string
  color?: string // Görsel ayırt etme için (#hex)
  icon?: string // lucide-react icon adı
  parentId?: string // Alt klasör için
  createdAt: Date
  updatedAt: Date
  listCount: number // İçindeki liste sayısı
  totalItems: number // Toplam ürün sayısı
  totalValue?: number // Toplam tahmini değer
  tags?: string[] // Klasör etiketleri
  permissions?: {
    canEdit: boolean
    canDelete: boolean
    canShare: boolean
  }
  // Soft delete fields
  isDeleted?: boolean
  deletedAt?: Date
  deletedBy?: string
}

// 2. LİSTE (List)
export interface PurchaseList {
  id: string
  name: string
  description?: string
  folderId?: string // Hangi klasörde
  status: 'draft' | 'pending' | 'approved' | 'ordered' | 'completed' | 'cancelled'
  priority: 'low' | 'normal' | 'high' | 'urgent'
  items: ListItem[]
  createdAt: Date
  updatedAt: Date
  dueDate?: Date // Sipariş son tarihi
  orderedDate?: Date
  completedDate?: Date
  createdBy: string
  assignedTo?: string // Sorumlu kişi
  supplier?: {
    id: string
    name: string
    contactInfo?: string
  }
  budget?: {
    estimated: number
    approved?: number
    spent?: number
  }
  tags?: string[]
  notes?: string
  cancellationReason?: string // İptal nedeni
  attachments?: Attachment[]
  approvalChain?: ApprovalStep[]
  shareSettings?: {
    isPublic: boolean
    sharedWith?: string[]
    shareLink?: string
    expiresAt?: Date
  }
  // Soft delete fields
  isDeleted?: boolean
  deletedAt?: Date
  deletedBy?: string
}

// 3. LİSTE ÖĞESİ (List Item)
export interface ListItem {
  id: string
  stokKodu: string
  stokIsmi: string
  quantity: number // İstenen miktar
  suggestedQuantity: number // Sistem önerisi
  currentStock: number // Anlık stok
  unit: string // Birim
  isModified?: boolean // Miktar değiştirildi mi?
  estimatedPrice?: number
  actualPrice?: number
  supplier?: string
  priority: 'low' | 'normal' | 'high' | 'urgent'
  status: 'pending' | 'approved' | 'ordered' | 'received' | 'cancelled'
  notes?: string
  addedAt: Date
  orderedAt?: Date
  receivedAt?: Date
  receivedQuantity?: number
  qualityCheck?: {
    status: 'passed' | 'failed' | 'pending'
    notes?: string
  }
}

// 4. ETİKET (Tag)
export interface Tag {
  id: string
  name: string
  color: string
  usageCount: number
  category?: 'supplier' | 'priority' | 'department' | 'custom'
}

// 5. ŞABLON (Template)
export interface ListTemplate {
  id: string
  name: string
  description: string
  items: TemplateItem[]
  isPublic: boolean
  category: string
  usageCount: number
}

// 6. ŞABLON ÖĞESİ
export interface TemplateItem {
  stokKodu: string
  stokIsmi: string
  defaultQuantity: number
  unit: string
  notes?: string
}

// 7. EK DOSYA
export interface Attachment {
  id: string
  name: string
  url: string
  type: string
  size: number
  uploadedAt: Date
  uploadedBy: string
}

// 8. ONAY ADIMI
export interface ApprovalStep {
  id: string
  approver: string
  status: 'pending' | 'approved' | 'rejected'
  comments?: string
  decidedAt?: Date
  order: number
}

// 9. GÖRÜNÜM MODU
export type ViewMode = 'folder' | 'kanban' | 'table' | 'card' | 'calendar' | 'gantt'

// 10. FİLTRE
export interface ListFilter {
  search?: string
  status?: PurchaseList['status'][]
  priority?: PurchaseList['priority'][]
  folderId?: string
  tags?: string[]
  dateRange?: {
    start: Date
    end: Date
  }
  assignedTo?: string
  supplier?: string
}

// 11. SIRALAMA
export interface ListSort {
  field: 'name' | 'createdAt' | 'updatedAt' | 'dueDate' | 'priority' | 'status' | 'itemCount'
  direction: 'asc' | 'desc'
}

// 12. TOPLU İŞLEM
export interface BulkAction {
  type: 'move' | 'copy' | 'delete' | 'archive' | 'share' | 'export' | 'merge' | 'updateStatus'
  targetIds: string[]
  options?: {
    targetFolderId?: string
    newStatus?: PurchaseList['status']
    shareWith?: string[]
  }
}

// 13. AKTİVİTE LOGU
export interface ActivityLog {
  id: string
  listId: string
  action: 'created' | 'updated' | 'deleted' | 'shared' | 'statusChanged' | 'itemAdded' | 'itemRemoved'
  details: string
  userId: string
  timestamp: Date
  metadata?: Record<string, any>
}

// 14. İSTATİSTİK
export interface ListStatistics {
  totalLists: number
  totalItems: number
  totalValue: number
  byStatus: Record<PurchaseList['status'], number>
  byPriority: Record<PurchaseList['priority'], number>
  recentActivity: ActivityLog[]
  upcomingDueDates: PurchaseList[]
  pendingApprovals: PurchaseList[]
}

// 15. PAYLAŞIM
export interface ShareSettings {
  type: 'view' | 'edit' | 'admin'
  users?: string[]
  emails?: string[]
  link?: {
    url: string
    expiresAt?: Date
    password?: string
  }
}