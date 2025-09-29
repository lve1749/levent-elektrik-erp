'use client'

import { useState, useMemo } from 'react'
import { SidebarWrapper } from '@/components/layout/sidebar-wrapper'
import Header from '@/components/layout/header'
import HelpHeader from '@/components/help/help-header'
import HelpTreeMenu from '@/components/help/help-tree-menu'
import HelpContent from '@/components/help/help-content'
import { helpTreeData, HelpTreeItem } from '@/components/help/help-data'

export default function YardimPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedItem, setSelectedItem] = useState<string>('getting-started')
  const [expandedItems, setExpandedItems] = useState<string[]>(['getting-started', 'stock-analysis'])

  const toggleExpand = (itemId: string) => {
    setExpandedItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    )
  }

  // Arama sorgusuna göre tree data'yı filtrele
  const filteredTreeData = useMemo(() => {
    if (!searchQuery.trim()) return helpTreeData

    const query = searchQuery.toLowerCase()
    const filtered: HelpTreeItem[] = []

    helpTreeData.forEach(parent => {
      // Parent'ı kontrol et
      const parentMatches = parent.name.toLowerCase().includes(query)
      
      // Children'ları kontrol et
      const matchingChildren = parent.children?.filter(child => 
        child.name.toLowerCase().includes(query)
      ) || []

      // Parent veya en az bir child eşleşiyorsa ekle
      if (parentMatches || matchingChildren.length > 0) {
        filtered.push({
          ...parent,
          children: matchingChildren.length > 0 ? matchingChildren : parent.children
        })
      }
    })

    // Arama varsa tüm kategorileri aç
    if (filtered.length > 0) {
      const allIds = filtered.map(item => item.id)
      setExpandedItems(prev => {
        const newExpanded = [...prev]
        allIds.forEach(id => {
          if (!newExpanded.includes(id)) {
            newExpanded.push(id)
          }
        })
        return newExpanded
      })
    }

    return filtered
  }, [searchQuery])

  return (
    <SidebarWrapper hideLastUpdate={true}>
      <div className="h-screen flex flex-col bg-[oklch(0.99_0.00_0)] dark:bg-[oklch(0.14_0.00_0)] overflow-hidden">
        <Header currentPage="Yardım" />
        
        <main className="flex-1 p-4 overflow-hidden">
          <div className="flex flex-col h-full gap-4 max-w-[1920px] mx-auto">
            {/* Üst Bölüm - Başlık ve Arama */}
            <HelpHeader 
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
            />

            {/* Ana İçerik - Grid Layout */}
            <div className="flex-1 grid grid-cols-5 gap-4 overflow-hidden">
              {/* Sol Panel - Tree Menu (1/5) */}
              <HelpTreeMenu
                treeData={filteredTreeData}
                selectedItem={selectedItem}
                expandedItems={expandedItems}
                onSelectItem={setSelectedItem}
                onToggleExpand={toggleExpand}
              />

              {/* Sağ Panel - İçerik (4/5) */}
              <HelpContent selectedItem={selectedItem} />
            </div>
          </div>
        </main>
      </div>
    </SidebarWrapper>
  )
}