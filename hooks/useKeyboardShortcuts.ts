import { useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';

interface ShortcutConfig {
  key: string;
  ctrl?: boolean;
  alt?: boolean;
  shift?: boolean;
  action: () => void;
  description?: string;
}

export const useKeyboardShortcuts = () => {
  const router = useRouter();
  const { theme, setTheme } = useTheme();

  // Navigation shortcuts
  const navigateTo = useCallback((path: string) => {
    router.push(path);
  }, [router]);

  // Theme toggle
  const toggleTheme = useCallback(() => {
    if (theme === 'dark') {
      setTheme('light');
    } else if (theme === 'light') {
      setTheme('system');
    } else {
      setTheme('dark');
    }
    
    // Show toast notification
    const themeMessage = theme === 'dark' ? '☀️ Açık tema aktif' : 
                        theme === 'light' ? '🖥️ Sistem teması aktif' : 
                        '🌙 Koyu tema aktif';
    
    // Create toast element
    const toast = document.createElement('div');
    toast.className = 'fixed bottom-4 right-4 bg-gray-800 text-white px-4 py-2 rounded-lg shadow-lg z-50 animate-slide-up';
    toast.textContent = themeMessage;
    document.body.appendChild(toast);
    
    // Remove toast after 2 seconds
    setTimeout(() => {
      toast.remove();
    }, 2000);
  }, [theme, setTheme]);

  // Search focus
  const focusSearch = useCallback(() => {
    const searchInput = document.querySelector('input[type="search"], input[placeholder*="Ara"], input[placeholder*="Search"]') as HTMLInputElement;
    if (searchInput) {
      searchInput.focus();
      searchInput.select();
    }
  }, []);

  // Clear filters
  const clearFilters = useCallback(() => {
    const event = new CustomEvent('clearFilters');
    window.dispatchEvent(event);
  }, []);

  // Refresh data
  const refreshData = useCallback(() => {
    window.location.reload();
  }, []);

  // New list/item
  const createNew = useCallback(() => {
    const event = new CustomEvent('createNew');
    window.dispatchEvent(event);
  }, []);

  // Edit selected
  const editSelected = useCallback(() => {
    const event = new CustomEvent('editSelected');
    window.dispatchEvent(event);
  }, []);

  // Delete selected
  const deleteSelected = useCallback(() => {
    const event = new CustomEvent('deleteSelected');
    window.dispatchEvent(event);
  }, []);

  // Export to Excel
  const exportExcel = useCallback(() => {
    const event = new CustomEvent('exportExcel');
    window.dispatchEvent(event);
  }, []);

  // Show help
  const showHelp = useCallback(() => {
    const event = new CustomEvent('showKeyboardShortcuts');
    window.dispatchEvent(event);
  }, []);

  // Advanced filter toggle
  const toggleAdvancedFilter = useCallback(() => {
    const event = new CustomEvent('toggleAdvancedFilter');
    window.dispatchEvent(event);
  }, []);

  // Command palette
  const openCommandPalette = useCallback(() => {
    const event = new CustomEvent('openCommandPalette');
    window.dispatchEvent(event);
  }, []);

  // Define all shortcuts
  const shortcuts: ShortcutConfig[] = [
    // Navigation
    { key: 'd', alt: true, action: () => navigateTo('/dashboard'), description: 'Dashboard\'a git' },
    { key: 'l', alt: true, action: () => navigateTo('/listeler'), description: 'Listeler sayfasına git' },
    { key: 'a', alt: true, action: () => navigateTo('/arsiv'), description: 'Arşiv sayfasına git' },
    { key: 's', alt: true, action: () => navigateTo('/siparisler/kanban'), description: 'Sipariş yönetimine git' },
    
    // Theme
    { key: 't', alt: true, shift: true, action: toggleTheme, description: 'Tema değiştir' },
    
    // Search and filter
    { key: 'f', ctrl: true, action: focusSearch, description: 'Arama kutusuna odaklan' },
    { key: 'f', ctrl: true, shift: true, action: toggleAdvancedFilter, description: 'Gelişmiş filtreleme' },
    { key: 'Escape', action: clearFilters, description: 'Filtreleri temizle' },
    
    // List operations
    { key: 'n', ctrl: true, action: createNew, description: 'Yeni oluştur' },
    { key: 'e', ctrl: true, action: editSelected, description: 'Düzenle' },
    { key: 'Delete', action: deleteSelected, description: 'Sil' },
    { key: 'r', ctrl: true, action: refreshData, description: 'Yenile' },
    { key: 'F5', action: refreshData, description: 'Sayfayı yenile' },
    
    // Excel operations
    { key: 'e', ctrl: true, shift: true, action: exportExcel, description: 'Excel\'e aktar' },
    
    // Help and commands
    { key: 'F1', action: showHelp, description: 'Kısayollar listesi' },
    { key: 'k', ctrl: true, action: openCommandPalette, description: 'Komut paleti' },
  ];

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in inputs (unless it's a global shortcut)
      const target = event.target as HTMLElement;
      const isInput = target.tagName === 'INPUT' || 
                     target.tagName === 'TEXTAREA' || 
                     target.contentEditable === 'true';
      
      // Allow some shortcuts even in inputs
      const allowedInInput = ['Escape', 'F1', 'F5'];
      
      if (isInput && !allowedInInput.includes(event.key)) {
        return;
      }

      // Check each shortcut
      for (const shortcut of shortcuts) {
        const keyMatch = shortcut.key.toLowerCase() === event.key.toLowerCase();
        const ctrlMatch = shortcut.ctrl ? (event.ctrlKey || event.metaKey) : !event.ctrlKey && !event.metaKey;
        const altMatch = shortcut.alt ? event.altKey : !event.altKey;
        const shiftMatch = shortcut.shift ? event.shiftKey : !event.shiftKey;

        if (keyMatch && ctrlMatch && altMatch && shiftMatch) {
          event.preventDefault();
          shortcut.action();
          break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [shortcuts]);

  return { shortcuts };
};

// Export shortcuts list for help modal
export const getShortcutsList = () => {
  return [
    { category: 'Navigasyon', shortcuts: [
      { keys: 'Alt + D', description: 'Dashboard' },
      { keys: 'Alt + L', description: 'Listeler' },
      { keys: 'Alt + A', description: 'Arşiv' },
      { keys: 'Alt + S', description: 'Siparişler' },
    ]},
    { category: 'Tema', shortcuts: [
      { keys: 'Alt + Shift + T', description: 'Tema değiştir (Açık/Koyu/Sistem)' },
    ]},
    { category: 'Arama ve Filtreleme', shortcuts: [
      { keys: 'Ctrl + F', description: 'Hızlı arama' },
      { keys: 'Ctrl + Shift + F', description: 'Gelişmiş filtreler' },
      { keys: 'Esc', description: 'Filtreleri temizle' },
    ]},
    { category: 'Liste İşlemleri', shortcuts: [
      { keys: 'Ctrl + N', description: 'Yeni kayıt' },
      { keys: 'Ctrl + E', description: 'Düzenle' },
      { keys: 'Delete', description: 'Sil' },
      { keys: 'Ctrl + R', description: 'Verileri yenile' },
      { keys: 'F5', description: 'Sayfayı yenile' },
    ]},
    { category: 'Excel', shortcuts: [
      { keys: 'Ctrl + Shift + E', description: 'Excel\'e aktar' },
    ]},
    { category: 'Yardım', shortcuts: [
      { keys: 'F1', description: 'Kısayollar listesi' },
      { keys: 'Ctrl + K', description: 'Komut paleti' },
    ]},
  ];
};