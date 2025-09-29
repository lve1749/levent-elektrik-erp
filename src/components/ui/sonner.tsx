"use client"

import { useTheme } from "next-themes"
import { Toaster as Sonner } from "sonner"

type ToasterProps = React.ComponentProps<typeof Sonner>

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      toastOptions={{
        style: {
          borderRadius: '8px',
        },
        classNames: {
          toast: 'rounded-lg',
          title: 'text-sm',
          description: 'text-xs',
        }
      }}
      {...props}
    />
  )
}

export { Toaster }
