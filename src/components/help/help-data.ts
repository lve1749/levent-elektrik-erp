import { 
  Book,
  BarChart3,
  Package,
  ShoppingCart,
  Shield,
  Settings,
  LogIn,
  User,
  Palette,
  Navigation,
  FileText,
  Filter,
  Download,
  Columns,
  FileStack,
  FolderPlus,
  Copy,
  Layers,
  Clock,
  History,
  RotateCw,
  Lock,
  UserCheck,
  Database,
  AlertCircle,
  Zap,
  Globe
} from 'lucide-react'

export interface HelpTreeItem {
  id: string
  name: string
  icon: any
  disabled?: boolean
  children?: HelpTreeItem[]
}

export const helpTreeData: HelpTreeItem[] = [
  {
    id: 'getting-started',
    name: 'Başlarken',
    icon: Book,
    children: [
      { id: 'first-login', name: 'Sisteme giriş', icon: LogIn },
      { id: 'basic-navigation', name: 'Temel navigasyon', icon: Navigation },
      { id: 'theme-change', name: 'Tema değiştirme', icon: Palette }
    ]
  },
  {
    id: 'stock-analysis',
    name: 'Stok Analiz',
    icon: BarChart3,
    children: [
      { id: 'table-usage', name: 'Stok analiz tablosu kullanımı', icon: FileText },
      { id: 'filter-usage', name: 'Tablo filtreleri nelerdir?', icon: Filter },
      { id: 'customize-columns', name: 'Tablo kolonları nelerdir?', icon: Columns },
      { id: 'data-export', name: 'Veri dışa aktarma', icon: Download }
    ]
  },
  {
    id: 'lists-folders',
    name: 'Listeler ve Klasörler',
    icon: Package,
    disabled: true,
    children: [
      { id: 'create-list', name: 'Liste oluşturma', icon: FileStack, disabled: true },
      { id: 'folder-management', name: 'Klasör yönetimi', icon: FolderPlus, disabled: true },
      { id: 'move-copy', name: 'Öğeleri taşıma ve kopyalama', icon: Copy, disabled: true },
      { id: 'bulk-operations', name: 'Toplu işlemler', icon: Layers, disabled: true }
    ]
  },
  {
    id: 'orders',
    name: 'Siparişler',
    icon: ShoppingCart,
    disabled: true,
    children: [
      { id: 'create-order', name: 'Sipariş oluşturma', icon: ShoppingCart, disabled: true },
      { id: 'order-status', name: 'Sipariş durumları', icon: Clock, disabled: true },
      { id: 'order-history', name: 'Sipariş geçmişi', icon: History, disabled: true },
      { id: 'auto-suggestions', name: 'Otomatik sipariş önerileri', icon: RotateCw, disabled: true }
    ]
  },
  {
    id: 'security',
    name: 'Güvenlik ve Gizlilik',
    icon: Shield,
    disabled: true,
    children: [
      { id: 'change-password', name: 'Şifre değiştirme', icon: Lock, disabled: true },
      { id: 'two-factor', name: 'İki faktörlü doğrulama', icon: UserCheck, disabled: true },
      { id: 'session-management', name: 'Oturum yönetimi', icon: History, disabled: true },
      { id: 'data-security', name: 'Veri güvenliği', icon: Database, disabled: true }
    ]
  },
  {
    id: 'technical-support',
    name: 'Teknik Destek',
    icon: Settings,
    disabled: true,
    children: [
      { id: 'troubleshooting', name: 'Sorun giderme', icon: AlertCircle, disabled: true },
      { id: 'common-errors', name: 'Sık karşılaşılan hatalar', icon: AlertCircle, disabled: true },
      { id: 'performance', name: 'Performans iyileştirme', icon: Zap, disabled: true },
      { id: 'browser-compatibility', name: 'Tarayıcı uyumluluğu', icon: Globe, disabled: true }
    ]
  }
]