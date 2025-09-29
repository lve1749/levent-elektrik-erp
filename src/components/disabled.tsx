'use client';

import { useId } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

export default function CheckboxDemo() {
  const id = useId();

  return (
    <div className="flex items-center space-x-2">
      <Checkbox id={id} disabled />
      <Label htmlFor={id}>Disabled state</Label>
    </div>
  );
}
