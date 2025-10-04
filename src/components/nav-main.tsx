"use client"

import { ChevronRight, type LucideIcon } from "lucide-react"
import { usePathname } from "next/navigation"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"
import { useState } from "react"

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar"

export function NavMain({
  items,
}: {
  items: {
    title: string
    url: string
    icon: LucideIcon
    isActive?: boolean
    disabled?: boolean
    items?: {
      title: string
      url: string
      disabled?: boolean
    }[]
  }[]
}) {
  const pathname = usePathname()
  return (
    <SidebarGroup>
      <SidebarGroupLabel>Menü</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => {
          const isItemActive = pathname === item.url || 
                              (item.items && item.items.some(subItem => pathname === subItem.url))
          const [isOpen, setIsOpen] = useState(isItemActive)
          
          return (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton 
                asChild={!item.disabled}
                tooltip={item.title}
                className={cn(
                  "relative",
                  !item.disabled && "hover:bg-[oklch(0.94_0.00_0)] dark:hover:bg-[oklch(0.14_0.00_0)]",
                  isItemActive && !item.disabled && "bg-[oklch(0.94_0.00_0)] dark:bg-[oklch(0.14_0.00_0)] font-medium",
                  item.disabled && "cursor-not-allowed"
                )}
                onClick={item.disabled ? (e: any) => e.preventDefault() : undefined}
              >
                {item.disabled ? (
                  <div className="flex items-center gap-3 w-full">
                    <item.icon className="w-4 h-4 text-[oklch(0.70_0.00_0)] dark:text-[oklch(0.40_0.00_0)]" />
                    <span className="text-[14px] text-[oklch(0.70_0.00_0)] dark:text-[oklch(0.40_0.00_0)]">{item.title}</span>
                  </div>
                ) : (
                  <Link href={item.url} className="flex items-center gap-3 w-full">
                    <item.icon className={`w-4 h-4 ${isItemActive ? "text-[oklch(0.20_0.00_0)] dark:text-[oklch(0.92_0.00_0)]" : "text-[oklch(0.56_0.00_0)] dark:text-[oklch(0.56_0.00_0)]"}`} />
                    <span className="text-[14px]">{item.title}</span>
                  </Link>
                )}
              </SidebarMenuButton>
              {item.items?.length ? (
                <>
                  <SidebarMenuAction 
                    onClick={item.disabled ? undefined : () => setIsOpen(!isOpen)}
                    className={item.disabled ? "cursor-not-allowed text-[oklch(0.70_0.00_0)] dark:text-[oklch(0.40_0.00_0)]" : "cursor-pointer"}
                  >
                    <motion.div
                      animate={{ rotate: isOpen ? 90 : 0 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                      className="w-4 h-4 flex items-center justify-center"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </motion.div>
                    <span className="sr-only">Toggle</span>
                  </SidebarMenuAction>
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{
                          height: {
                            duration: 0.3,
                            ease: "easeInOut"
                          },
                          opacity: {
                            duration: 0.2,
                            ease: "easeInOut"
                          }
                        }}
                        className="overflow-hidden"
                      >
                        <SidebarMenuSub>
                          {item.items?.map((subItem) => {
                            const isSubItemActive = pathname === subItem.url
                            
                            return (
                              <motion.div
                                key={subItem.title}
                                initial={{ x: -10, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                transition={{ 
                                  delay: 0.05,
                                  duration: 0.2,
                                  ease: "easeOut"
                                }}
                              >
                                <SidebarMenuSubItem>
                                  <SidebarMenuSubButton 
                                    asChild={!subItem.disabled}
                                    className={cn(
                                      "relative",
                                      !subItem.disabled && "hover:bg-[oklch(0.94_0.00_0)] dark:hover:bg-[oklch(0.14_0.00_0)]",
                                      isSubItemActive && !subItem.disabled && "bg-[oklch(0.94_0.00_0)] dark:bg-[oklch(0.14_0.00_0)] text-[oklch(0.20_0.00_0)] dark:text-[oklch(0.92_0.00_0)] font-medium",
                                      subItem.disabled && "cursor-not-allowed"
                                    )}
                                    onClick={subItem.disabled ? (e: any) => e.preventDefault() : undefined}
                                  >
                                    {subItem.disabled ? (
                                      <div className="flex items-center">
                                        <span className="text-[14px] ml-1 text-[oklch(0.70_0.00_0)] dark:text-[oklch(0.40_0.00_0)]">{subItem.title}</span>
                                      </div>
                                    ) : (
                                      <Link href={subItem.url} className="flex items-center">
                                        <span className="text-[14px] ml-1">{subItem.title}</span>
                                      </Link>
                                    )}
                                  </SidebarMenuSubButton>
                                </SidebarMenuSubItem>
                              </motion.div>
                            )
                          })}
                        </SidebarMenuSub>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </>
              ) : null}
            </SidebarMenuItem>
          )
        })}
      </SidebarMenu>
    </SidebarGroup>
  )
}
