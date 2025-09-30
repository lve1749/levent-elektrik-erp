"use client"

import * as React from "react"
import { useAuth } from "@/contexts/AuthContext"
import {
  House,
  ShoppingCart,
  Archive,
  Zap,
  Wallet
} from "lucide-react"

import { NavMain } from "@/components/nav-main"
import { NavProjects } from "@/components/nav-projects"
import { NavSecondary } from "@/components/nav-secondary"
import { NavUser } from "@/components/nav-user"
import { SidebarUpdateCard } from "@/components/ui/sidebar-update-card"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

const data = {
  navMain: [
    {
      title: "Stok Analiz",
      url: "/",
      icon: House,
      items: [],
    },
    {
      title: "Siparişler",
      url: "#",
      icon: ShoppingCart,
      disabled: true,
      items: [
        {
          title: "Listeler",
          url: "#",
          disabled: true,
        },
        {
          title: "Klasörler",
          url: "#",
          disabled: true,
        },
        {
          title: "Kanban",
          url: "#",
          disabled: true,
        },
      ],
    },
    {
      title: "Arşiv",
      url: "#",
      icon: Archive,
      disabled: true,
      items: [],
    },
    {
      title: "Tahsilat",
      url: "#",
      icon: Wallet,
      disabled: true,
      items: [],
    },
  ],
  navSecondary: [],
  projects: [],
}

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  lastRefreshTime?: Date | null
  alertCount?: number
  refreshHistory?: Array<{ time: Date; success: boolean }>
}

export function AppSidebar({ lastRefreshTime, alertCount, refreshHistory = [], ...props }: AppSidebarProps) {
  const { user } = useAuth()
  
  // Debug için user objesini logla
  console.log('Current user from AuthContext:', user)
  
  const userData = {
    name: user?.username || "Kullanıcı",
    email: user?.email || "kullanici@leventelektrik.com",
    avatar: "",
  }
  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" className="cursor-default hover:bg-transparent">
              <div className="bg-[oklch(0.14_0.00_0)] flex aspect-square size-8 items-center justify-center rounded-lg">
                <img src="/logo.png" alt="Logo" className="size-6" />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">Levent Elektrik</span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        {data.navSecondary.length > 0 && (
          <NavSecondary items={data.navSecondary} className="mt-auto" />
        )}
        <NavProjects 
          projects={data.projects} 
          lastRefreshTime={lastRefreshTime}
          alertCount={alertCount}
          refreshHistory={refreshHistory}
        />
      </SidebarContent>
      <SidebarFooter>
        <SidebarUpdateCard />
        <div className="mx-2 border-t border-[oklch(0.92_0.00_0_/_0.5)] dark:border-[oklch(0.27_0.00_0_/_0.5)] my-1" />
        <NavUser user={userData} />
      </SidebarFooter>
    </Sidebar>
  )
}
