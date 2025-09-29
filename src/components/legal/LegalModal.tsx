'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion';
import { Shield, FileText, Lock } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

// Import içerik bileşenleri
import GizlilikSozlesmesi from './GizlilikSozlesmesi';
import KullanimKosullari from './KullanimKosullari';
import KVKK from './KVKK';

interface LegalModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: 'gizlilik' | 'kullanim' | 'kvkk';
}

interface TabData {
  id: 'gizlilik' | 'kullanim' | 'kvkk';
  label: string;
  icon: JSX.Element;
}

const tabs: TabData[] = [
  { id: 'gizlilik', label: 'Gizlilik Sözleşmesi', icon: <Shield className="w-4 h-4" /> },
  { id: 'kullanim', label: 'Kullanım Koşulları', icon: <FileText className="w-4 h-4" /> },
  { id: 'kvkk', label: 'KVKK Aydınlatma Metni', icon: <Lock className="w-4 h-4" /> }
];

// Spring animation configs
const springConfig = {
  type: "spring",
  stiffness: 500,
  damping: 30
};

const contentVariants = {
  enter: {
    opacity: 0,
    y: 10,
    transition: {
      duration: 0.3,
      ease: "easeOut"
    }
  },
  center: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3,
      ease: "easeOut"
    }
  },
  exit: {
    opacity: 0,
    y: -10,
    transition: {
      duration: 0.2,
      ease: "easeIn"
    }
  }
};

export default function LegalModal({ isOpen, onClose, defaultTab = 'gizlilik' }: LegalModalProps) {
  const [activeTab, setActiveTab] = useState<'gizlilik' | 'kullanim' | 'kvkk'>(defaultTab);

  // Sync activeTab with defaultTab when modal opens
  useEffect(() => {
    if (isOpen) {
      setActiveTab(defaultTab);
    }
  }, [defaultTab, isOpen]);

  const renderContent = () => {
    switch(activeTab) {
      case 'gizlilik':
        return <GizlilikSozlesmesi />;
      case 'kullanim':
        return <KullanimKosullari />;
      case 'kvkk':
        return <KVKK />;
      default:
        return <GizlilikSozlesmesi />;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[85vh] flex flex-col bg-[oklch(0.97_0.00_0)] dark:bg-[oklch(0.20_0.00_0)] border-[oklch(0.92_0.00_0)] dark:border-[oklch(0.27_0.00_0)] rounded-lg">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="text-xl font-semibold text-center">
            Yasal Metinler
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex-1 flex flex-col min-h-0">
          {/* Custom Tab Navigation with Framer Motion */}
          <LayoutGroup>
            <div className="border-b border-border flex-shrink-0">
              <div className="flex w-full gap-1 p-1 justify-center">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`
                      relative flex items-center gap-2 px-4 py-2.5 text-sm font-medium
                      transition-colors duration-200 rounded-lg
                      ${activeTab !== tab.id && 'hover:text-foreground/80'
                      }
                    `}
                  >
                    {/* Tab Content */}
                    <motion.span 
                      className={`relative z-10 flex items-center gap-2 ${
                        activeTab === tab.id 
                          ? 'text-[oklch(0.55_0.22_263)] dark:text-[oklch(0.62_0.19_260)]' 
                          : 'text-muted-foreground'
                      }`}
                      transition={{ duration: 0.2 }}
                    >
                      {tab.icon}
                      <span className="hidden sm:inline">{tab.label}</span>
                      <span className="sm:hidden">{tab.label.split(' ')[0]}</span>
                    </motion.span>

                    {/* Underline Indicator */}
                    {activeTab === tab.id && (
                      <motion.div
                        layoutId="underline"
                        className="absolute bottom-0 left-4 right-4 h-0.5 bg-[oklch(0.55_0.22_263)] dark:bg-[oklch(0.62_0.19_260)]"
                        transition={springConfig}
                      />
                    )}
                  </button>
                ))}
              </div>
            </div>
          </LayoutGroup>

          {/* Animated Content Area */}
          <ScrollArea className="flex-1 mt-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                variants={contentVariants}
                initial="enter"
                animate="center"
                exit="exit"
                className="px-6 pb-6"
              >
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.1, duration: 0.3 }}
                >
                  {renderContent()}
                </motion.div>
              </motion.div>
            </AnimatePresence>
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
}