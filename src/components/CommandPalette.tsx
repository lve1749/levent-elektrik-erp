'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, Home, Archive, ShoppingCart, 
  Wallet, List, FolderOpen, Kanban,
  ListPlus, FolderPlus,
  Moon, Sun, 
  HelpCircle, MessageSquare 
} from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

interface Command {
  id: string;
  label: string;
  icon: React.ReactNode;
  action: () => void;
  shortcut?: string;
  category: string;
  disabled?: boolean;
}

export const CommandPalette: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const inputRef = useRef<HTMLInputElement>(null);

  const commands: Command[] = [
    // Navigation
    { id: 'stock-analysis', label: 'Stok Analiz', icon: <Home className="w-3.5 h-3.5" />, action: () => router.push('/'), shortcut: 'Alt+D', category: 'Navigasyon' },
    { id: 'lists', label: 'Listeler', icon: <List className="w-3.5 h-3.5" />, action: () => {}, category: 'Navigasyon', disabled: true },
    { id: 'folders', label: 'Klasörler', icon: <FolderOpen className="w-3.5 h-3.5" />, action: () => {}, category: 'Navigasyon', disabled: true },
    { id: 'kanban', label: 'Kanban', icon: <Kanban className="w-3.5 h-3.5" />, action: () => {}, category: 'Navigasyon', disabled: true },
    { id: 'collection', label: 'Tahsilat', icon: <Wallet className="w-3.5 h-3.5" />, action: () => {}, category: 'Navigasyon', disabled: true },
    { id: 'archive', label: 'Arşiv', icon: <Archive className="w-3.5 h-3.5" />, action: () => {}, category: 'Navigasyon', disabled: true },
    
    // İşlemler
    { id: 'create-list', label: 'Liste Oluştur', icon: <ListPlus className="w-3.5 h-3.5" />, action: () => {}, category: 'İşlemler', disabled: true },
    { id: 'create-folder', label: 'Klasör Oluştur', icon: <FolderPlus className="w-3.5 h-3.5" />, action: () => {}, category: 'İşlemler', disabled: true },
    
    // Theme
    { id: 'theme-dark', label: 'Koyu Tema', icon: <Moon className="w-3.5 h-3.5" />, action: () => setTheme('dark'), category: 'Tema' },
    { id: 'theme-light', label: 'Açık Tema', icon: <Sun className="w-3.5 h-3.5" />, action: () => setTheme('light'), category: 'Tema' },
    
    // Help
    { id: 'shortcuts', label: 'Klavye Kısayolları', icon: <HelpCircle className="w-3.5 h-3.5" />, action: () => window.dispatchEvent(new CustomEvent('showKeyboardShortcuts')), category: 'Yardım' },
    { id: 'feedback', label: 'Geri Bildirim', icon: <MessageSquare className="w-3.5 h-3.5" />, action: () => router.push('/geri-bildirim'), category: 'Yardım' },
  ];

  const filteredCommands = commands.filter(cmd => 
    cmd.label.toLowerCase().includes(search.toLowerCase()) ||
    cmd.category.toLowerCase().includes(search.toLowerCase())
  );

  const groupedCommands = filteredCommands.reduce((acc, cmd) => {
    if (!acc[cmd.category]) acc[cmd.category] = [];
    acc[cmd.category].push(cmd);
    return acc;
  }, {} as Record<string, Command[]>);

  useEffect(() => {
    const handleOpen = () => {
      setIsOpen(true);
      setSearch('');
      setSelectedIndex(0);
    };
    
    window.addEventListener('openCommandPalette', handleOpen);
    return () => window.removeEventListener('openCommandPalette', handleOpen);
  }, []);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(i => Math.min(i + 1, filteredCommands.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(i => Math.max(i - 1, 0));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filteredCommands[selectedIndex] && !filteredCommands[selectedIndex].disabled) {
          filteredCommands[selectedIndex].action();
          setIsOpen(false);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, selectedIndex, filteredCommands]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          className="fixed inset-0 z-50 flex items-start justify-center pt-20"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
        >
          <motion.div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
          />
          
          <motion.div 
            className="relative bg-[oklch(0.99_0.00_0)] dark:bg-[oklch(0.20_0.00_0)] rounded-xl shadow-2xl w-full max-w-xl overflow-hidden border border-[oklch(0.92_0.00_0_/_0.5)] dark:border-[oklch(0.27_0.00_0_/_0.5)]"
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ 
              opacity: 1, 
              scale: 1, 
              y: 0,
              transition: {
                type: "spring",
                duration: 0.3,
                damping: 25,
                stiffness: 500
              }
            }}
            exit={{ 
              opacity: 0, 
              scale: 0.95, 
              y: -20,
              transition: {
                duration: 0.15
              }
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <motion.div 
              className="flex items-center px-3 py-2.5 border-b border-[oklch(0.92_0.00_0_/_0.5)] dark:border-[oklch(0.27_0.00_0_/_0.5)]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
            >
              <Search className="w-4 h-4 text-[oklch(0.556_0_0)] dark:text-[oklch(0.703_0_0)] mr-2" />
              <input
                ref={inputRef}
                type="text"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setSelectedIndex(0);
                }}
                placeholder="Komut ara..."
                className="flex-1 bg-transparent outline-none text-[oklch(0.145_0_0)] dark:text-[oklch(0.985_0_0)] placeholder-[oklch(0.556_0_0)] dark:placeholder-[oklch(0.703_0_0)] text-sm"
              />
              <kbd className="text-[10px] px-1.5 py-0.5 bg-[oklch(0.97_0.00_0)] dark:bg-[oklch(0.238_0_0)] rounded-[3px] text-[oklch(0.556_0_0)] dark:text-[oklch(0.703_0_0)]">ESC</kbd>
            </motion.div>
            
            <ScrollArea className="h-80">
              <motion.div 
                className="py-1"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
              >
                {Object.entries(groupedCommands).map(([category, cmds], categoryIndex) => (
                  <motion.div 
                    key={category}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.05 * categoryIndex }}
                  >
                    <div className="px-3 py-1">
                      <div className="text-[10px] font-semibold text-[oklch(0.556_0_0)] dark:text-[oklch(0.703_0_0)] uppercase tracking-wider">
                        {category}
                      </div>
                    </div>
                    {cmds.map((cmd, idx) => {
                      const globalIndex = filteredCommands.indexOf(cmd);
                      const isSelected = globalIndex === selectedIndex;
                      
                      return (
                        <motion.button
                          key={cmd.id}
                          onClick={() => {
                            if (!cmd.disabled) {
                              cmd.action();
                              setIsOpen(false);
                            }
                          }}
                          onMouseEnter={() => !cmd.disabled && setSelectedIndex(globalIndex)}
                          className={`w-full flex items-center justify-between px-3 py-2 transition-colors ${
                            cmd.disabled 
                              ? 'cursor-not-allowed opacity-50' 
                              : isSelected 
                                ? 'bg-[oklch(0.95_0.00_0)] text-[oklch(0.145_0_0)] dark:bg-[oklch(0.27_0.00_0)] dark:text-[oklch(0.985_0_0)]' 
                                : 'hover:bg-[oklch(0.97_0.00_0)] text-[oklch(0.145_0_0)] dark:hover:bg-[oklch(0.238_0_0)] dark:text-[oklch(0.985_0_0)]'
                          }`}
                          whileHover={!cmd.disabled ? { x: 2 } : {}}
                          whileTap={!cmd.disabled ? { scale: 0.98 } : {}}
                        >
                          <div className="flex items-center gap-2.5">
                            <span className={`${cmd.disabled ? 'text-[oklch(0.70_0.00_0)] dark:text-[oklch(0.40_0.00_0)]' : 'text-[oklch(0.556_0_0)] dark:text-[oklch(0.703_0_0)]'}`}>{cmd.icon}</span>
                            <span className={`text-sm ${cmd.disabled ? 'text-[oklch(0.70_0.00_0)] dark:text-[oklch(0.40_0.00_0)]' : ''}`}>{cmd.label}</span>
                          </div>
                          {cmd.disabled ? (
                            <span className="text-[10px] px-1.5 py-0.5 bg-[oklch(0.95_0.00_0)] dark:bg-[oklch(0.238_0_0)] rounded-[3px] text-[oklch(0.70_0.00_0)] dark:text-[oklch(0.40_0.00_0)]">
                              Yakında
                            </span>
                          ) : cmd.shortcut ? (
                            <kbd className="text-[10px] px-1.5 py-0.5 bg-[oklch(0.99_0.00_0)] dark:bg-[oklch(0.145_0_0)] border border-[oklch(0.922_0_0)] dark:border-[oklch(0.238_0_0)] rounded-[3px] text-[oklch(0.556_0_0)] dark:text-[oklch(0.703_0_0)]">
                              {cmd.shortcut}
                            </kbd>
                          ) : null}
                        </motion.button>
                      );
                    })}
                  </motion.div>
                ))}
                
                {filteredCommands.length === 0 && (
                  <motion.div 
                    className="px-3 py-6 text-center text-[oklch(0.556_0_0)] dark:text-[oklch(0.703_0_0)] text-sm"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    Komut bulunamadı
                  </motion.div>
                )}
              </motion.div>
            </ScrollArea>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};