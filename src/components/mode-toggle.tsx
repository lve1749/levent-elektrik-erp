"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

export function ModeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  // Prevent hydration mismatch
  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="relative inline-flex h-[34px] w-16 items-center rounded-full border border-[oklch(0.92_0.00_0_/_0.5)] bg-[oklch(0.97_0.00_0)] dark:border-[oklch(0.27_0.00_0_/_0.5)] dark:bg-[oklch(0.20_0.00_0)]">
        <div className="h-6 w-6 rounded-full bg-[oklch(0.94_0.00_0)] dark:bg-[oklch(0.37_0.00_0)]" />
      </div>
    )
  }

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark")
  }

  return (
    <button
      onClick={toggleTheme}
      className="relative inline-flex h-[34px] w-16 items-center rounded-full border border-[oklch(0.92_0.00_0_/_0.5)] bg-[oklch(0.97_0.00_0)] p-1 transition-colors hover:bg-[oklch(0.94_0.00_0)] dark:border-[oklch(0.27_0.00_0_/_0.5)] dark:bg-[oklch(0.20_0.00_0)] dark:hover:bg-[oklch(0.14_0.00_0)]"
      aria-label={theme === "dark" ? "Açık temaya geç" : "Koyu temaya geç"}
    >
      {/* Sliding indicator */}
      <motion.div
        className="h-6 w-6 rounded-full bg-white dark:bg-[oklch(0.37_0.00_0)] shadow-sm"
        animate={{
          x: theme === "light" ? 0 : 30
        }}
        transition={{
          type: "spring",
          stiffness: 400,
          damping: 25
        }}
      />
      
      {/* Icons */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-between px-3 z-10">
        <Sun className={cn(
          "h-4 w-4 transition-opacity -ml-1",
          theme === "light" ? "text-[oklch(0.40_0.00_0)] dark:text-[oklch(0.72_0.00_0)] opacity-100" : "text-[oklch(0.40_0.00_0)] dark:text-[oklch(0.72_0.00_0)] opacity-40"
        )} />
        <Moon className={cn(
          "h-4 w-4 transition-opacity -mr-1",
          theme === "dark" ? "text-[oklch(0.40_0.00_0)] dark:text-[oklch(0.72_0.00_0)] opacity-100" : "text-[oklch(0.40_0.00_0)] dark:text-[oklch(0.72_0.00_0)] opacity-40"
        )} />
      </div>
    </button>
  )
}