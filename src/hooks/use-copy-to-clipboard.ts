'use client';

import * as React from 'react';
import { toast } from 'sonner';

export function useCopyToClipboard({
  timeout = 2000,
  onCopy,
}: {
  timeout?: number;
  onCopy?: () => void;
} = {}) {
  const [copied, setCopied] = React.useState(false);

  const copy = (value: string) => {
    if (typeof window === 'undefined' || !navigator.clipboard.writeText) {
      return;
    }

    if (!value) return;

    navigator.clipboard.writeText(value).then(() => {
      setCopied(true);
      
      // Toast bildirimi
      toast.success('Kopyalandı', {
        description: value.length > 50 ? value.substring(0, 50) + '...' : value
      });

      if (onCopy) {
        onCopy();
      }

      setTimeout(() => {
        setCopied(false);
      }, timeout);
    }, (error) => {
      console.error(error);
      toast.error('Kopyalama başarısız');
    });
  };

  return { copied, copy };
}
