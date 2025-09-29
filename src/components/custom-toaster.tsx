"use client"

import { Toaster } from "@/components/ui/sonner"

export function CustomToaster() {
  return (
    <Toaster 
      position="bottom-right"
      duration={5000}
      richColors
    />
  )
}