"use client"

import {
  User,
  Bell,
  ChevronsUpDown,
  Settings,
  LogOut,
  HelpCircle,
  MessageSquare,
} from "lucide-react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"

export function NavUser({
  user,
}: {
  user: {
    name: string
    email: string
    avatar: string
  }
}) {
  const { isMobile } = useSidebar()
  const router = useRouter()
  
  const handleLogout = async () => {
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      })
      
      if (response.ok) {
        toast.success('Çıkış başarılı')
        
        // Önce localStorage'ı temizle
        localStorage.removeItem('session-token')
        localStorage.removeItem('user-info')
        localStorage.removeItem('lastRefreshTime')
        localStorage.removeItem('refreshHistory')
        
        // Router'ı temizle ve login sayfasına yönlendir
        await router.push('/login')
        
        // Sayfayı tamamen yenile
        window.location.href = '/login'
      } else {
        toast.error('Çıkış yapılırken hata oluştu')
      }
    } catch (error) {
      console.error('Logout error:', error)
      toast.error('Çıkış yapılırken hata oluştu')
    }
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Avatar className="h-8 w-8 rounded-lg">
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback className="rounded-lg bg-[oklch(0.92_0.00_0)] dark:bg-[oklch(0.14_0.00_0)]">
                  <User className="h-4 w-4 text-[oklch(0.27_0.00_0)] dark:text-[oklch(0.97_0.00_0)]" strokeWidth={1.5} />
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium text-[14px]">{user.name}</span>
              </div>
              <ChevronsUpDown className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarImage src={user.avatar} alt={user.name} />
                  <AvatarFallback className="rounded-lg bg-[oklch(0.94_0.00_0)] dark:bg-[oklch(0.17_0.00_0)]">
                    <User className="h-4 w-4 text-[oklch(0.40_0.00_0)] dark:text-[oklch(0.72_0.00_0)]" />
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium text-[14px]">{user.name}</span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem className="text-[14px]">
                <Settings className="mr-2 h-4 w-4" />
                Ayarlar
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem onClick={() => router.push('/yardim')} className="text-[14px]">
                <HelpCircle className="mr-2 h-4 w-4" />
                Yardım
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push('/geri-bildirim')} className="text-[14px]">
                <MessageSquare className="mr-2 h-4 w-4" />
                Geri Bildirim
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="text-[14px] text-red-600 dark:text-red-500 hover:text-red-600 dark:hover:text-red-500 focus:text-red-600 dark:focus:text-red-500">
              <LogOut className="mr-2 h-4 w-4 text-red-600 dark:text-red-500" />
              Çıkış Yap
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
