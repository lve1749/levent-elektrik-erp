'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download, RefreshCw } from 'lucide-react';

export function UpdateNotification() {
  const [showUpdate, setShowUpdate] = useState(true);
  
  if (!showUpdate) return null;
  
  return (
    <div className="space-y-2">
      <div className="bg-blue-100 dark:bg-blue-900/50 p-2 rounded-lg">
        <div className="text-xs font-medium mb-1">Güncelleme Mevcut</div>
        <div className="text-xs text-muted-foreground">v1.0.5 hazır</div>
        <Button 
          size="sm" 
          className="w-full mt-2"
          onClick={() => alert('Güncelleme indirilecek')}
        >
          <Download className="w-3 h-3 mr-1" />
          İndir
        </Button>
      </div>
      <Button
        size="sm"
        variant="ghost"
        className="w-full text-xs"
        onClick={() => setShowUpdate(false)}
      >
        Daha Sonra
      </Button>
    </div>
  );
}