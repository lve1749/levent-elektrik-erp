'use client';

import Image from 'next/image'
import { Zap } from "lucide-react"
import { LoginForm } from "@/components/login-form"
import { ModeToggle } from "@/components/mode-toggle"

export default function LoginPage() {
  return (
    <div className="relative min-h-svh bg-[oklch(0.99_0.00_0)] dark:bg-[oklch(0.14_0.00_0)]">
      {/* Theme toggle - header ile aynı konumda */}
      <div className="absolute top-0 right-0 px-6 py-4 z-50">
        <ModeToggle />
      </div>
      
      <div className="grid min-h-svh lg:grid-cols-3">
        <div className="relative flex flex-col gap-4 p-6 md:p-10 lg:col-span-2 overflow-hidden">
          {/* Grid pattern background - centered with fade */}
          <div 
            className="absolute inset-0 pointer-events-none"
          >
            {/* Light mode grid */}
            <div 
              className="absolute inset-0 opacity-[0.03] dark:hidden"
              style={{
                backgroundImage: `linear-gradient(to right, oklch(0.20 0.00 0) 1px, transparent 1px), 
                                 linear-gradient(to bottom, oklch(0.20 0.00 0) 1px, transparent 1px)`,
                backgroundSize: '50px 50px',
                mask: 'radial-gradient(circle at center, black 30%, transparent 70%)',
                WebkitMask: 'radial-gradient(circle at center, black 30%, transparent 70%)'
              }}
            />
            {/* Dark mode grid */}
            <div 
              className="absolute inset-0 opacity-[0.06] hidden dark:block"
              style={{
                backgroundImage: `linear-gradient(to right, oklch(0.72 0.00 0) 1px, transparent 1px), 
                                 linear-gradient(to bottom, oklch(0.72 0.00 0) 1px, transparent 1px)`,
                backgroundSize: '50px 50px',
                mask: 'radial-gradient(circle at center, black 30%, transparent 70%)',
                WebkitMask: 'radial-gradient(circle at center, black 30%, transparent 70%)'
              }}
            />
          </div>
          <div className="relative z-10 flex flex-1 items-center justify-center">
            <div className="w-full max-w-xs">
              <LoginForm />
            </div>
          </div>
          <div className="relative z-10 text-center text-xs text-muted-foreground">
            © 2025 Levent Elektrik. Tüm Hakları Saklıdır.
          </div>
        </div>
        <div className="relative hidden lg:block lg:col-span-1">
          <div 
            className="absolute left-0 top-0 bottom-1/2 w-px" 
            style={{ 
              bottom: 'calc(50% + 55px)',
              background: 'linear-gradient(to top, oklch(0.92 0.00 0) 0%, oklch(0.92 0.00 0) 60%, oklch(0.99 0.00 0) 100%)'
            }}
          ></div>
          <div 
            className="absolute left-0 top-0 bottom-1/2 w-px dark:block hidden" 
            style={{ 
              bottom: 'calc(50% + 55px)',
              background: 'linear-gradient(to top, oklch(0.27 0.00 0) 0%, oklch(0.27 0.00 0) 60%, oklch(0.14 0.00 0) 100%)'
            }}
          ></div>
          <div 
            className="absolute left-0 top-1/2 bottom-0 w-px" 
            style={{ 
              top: 'calc(50% + 55px)',
              background: 'linear-gradient(to bottom, oklch(0.92 0.00 0) 0%, oklch(0.92 0.00 0) 60%, oklch(0.99 0.00 0) 100%)'
            }}
          ></div>
          <div 
            className="absolute left-0 top-1/2 bottom-0 w-px dark:block hidden" 
            style={{ 
              top: 'calc(50% + 55px)',
              background: 'linear-gradient(to bottom, oklch(0.27 0.00 0) 0%, oklch(0.27 0.00 0) 60%, oklch(0.14 0.00 0) 100%)'
            }}
          ></div>
          <div className="absolute left-0 top-1/2 -translate-y-1/2 -ml-4">
            <Image 
              src="/images/logo-black.png" 
              alt="Levent Elektrik" 
              width={160} 
              height={53}
              className="dark:hidden"
            />
            <Image 
              src="/images/logo-white.png" 
              alt="Levent Elektrik" 
              width={160} 
              height={53}
              className="hidden dark:block"
            />
          </div>
        </div>
      </div>
    </div>
  )
}