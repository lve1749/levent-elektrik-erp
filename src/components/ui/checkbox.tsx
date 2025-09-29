'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { cva, VariantProps } from 'class-variance-authority';
import { Check, Minus } from 'lucide-react';
import { Checkbox as CheckboxPrimitive } from 'radix-ui';

// Define the variants for the Checkbox using cva.
const checkboxVariants = cva(
  `
    group peer bg-background shrink-0 rounded-full border-[1.5px] border-[oklch(0.89_0.00_0)] dark:border-[oklch(0.34_0.00_0)] 
    focus:outline-none focus-visible:outline-none focus:ring-0 focus-visible:ring-0
    disabled:cursor-not-allowed disabled:opacity-50 
    transform-none !translate-y-0 active:!translate-y-0 focus:!translate-y-0
    aria-invalid:border-destructive/60 aria-invalid:ring-destructive/10 dark:aria-invalid:border-destructive dark:aria-invalid:ring-destructive/20
    [[data-invalid=true]_&]:border-destructive/60 [[data-invalid=true]_&]:ring-destructive/10  dark:[[data-invalid=true]_&]:border-destructive dark:[[data-invalid=true]_&]:ring-destructive/20,
    data-[state=checked]:bg-[oklch(0.55_0.22_263)] data-[state=checked]:border-[1.5px] data-[state=checked]:border-[oklch(0.65_0.15_263)] data-[state=checked]:text-[oklch(0.97_0.00_286)]
    data-[state=checked]:hover:bg-[oklch(0.62_0.19_260)] data-[state=checked]:hover:border-[oklch(0.72_0.12_260)]
    data-[state=indeterminate]:bg-[oklch(0.55_0.22_263)] data-[state=indeterminate]:border-[1.5px] data-[state=indeterminate]:border-[oklch(0.65_0.15_263)] data-[state=indeterminate]:text-[oklch(0.97_0.00_286)]
    data-[state=indeterminate]:hover:bg-[oklch(0.62_0.19_260)] data-[state=indeterminate]:hover:border-[oklch(0.72_0.12_260)]
    hover:border-[oklch(0.62_0.19_260)] transition-colors
    `,
  {
    variants: {
      size: {
        sm: 'size-4 [&_svg]:size-2.5',
        md: 'size-4.5 [&_svg]:size-3',
        lg: 'size-5 [&_svg]:size-3.5',
      },
    },
    defaultVariants: {
      size: 'md',
    },
  },
);

function Checkbox({
  className,
  size,
  ...props
}: React.ComponentProps<typeof CheckboxPrimitive.Root> & VariantProps<typeof checkboxVariants>) {
  return (
    <CheckboxPrimitive.Root data-slot="checkbox" className={cn(checkboxVariants({ size }), className)} {...props}>
      <CheckboxPrimitive.Indicator className={cn('flex items-center justify-center text-current')}>
        <Check className="group-data-[state=checked]:block group-data-[state=indeterminate]:hidden" strokeWidth={2.8} />
        <Minus className="hidden group-data-[state=indeterminate]:block" strokeWidth={2.8} />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  );
}

export { Checkbox };
