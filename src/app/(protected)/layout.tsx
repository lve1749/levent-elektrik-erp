import { SidebarWrapper } from "@/components/layout/sidebar-wrapper"
import { RefreshProvider } from "@/contexts/RefreshContext"

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <RefreshProvider>
      <SidebarWrapper>
        {children}
      </SidebarWrapper>
    </RefreshProvider>
  )
}