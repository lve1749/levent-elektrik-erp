"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import {
  SidebarGroup,
  SidebarGroupContent,
} from "@/components/ui/sidebar"
import { formatDistanceToNow } from 'date-fns'
import { tr } from 'date-fns/locale'
import { cn } from "@/lib/utils"

interface NavProjectsProps {
  projects: any[]
  lastRefreshTime?: Date | null
  alertCount?: number
  refreshHistory?: Array<{ 
    time: Date; 
    success: boolean;
    groupName?: string; // Ana grup adı
  }>
}

export function NavProjects({
  projects,
  lastRefreshTime,
  alertCount = 0,
  refreshHistory = [],
}: NavProjectsProps) {
  // Son güncellemenin başarılı olup olmadığını kontrol et
  const isLastRefreshSuccessful = refreshHistory.length > 0 ? refreshHistory[0].success : true
  
  const getLastRefreshText = () => {
    if (!lastRefreshTime) return "Henüz güncellenmedi"
    
    try {
      return formatDistanceToNow(lastRefreshTime, {
        addSuffix: true,
        locale: tr
      })
    } catch {
      return "Bilinmiyor"
    }
  }

  // Zaman kısaltması fonksiyonu
  const getShortTime = (date: Date) => {
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const seconds = Math.floor(diff / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)
    const months = Math.floor(days / 30)
    const years = Math.floor(days / 365)

    if (years > 0) return `${years}y`
    if (months > 0) return `${months}ay`
    if (days > 0) return `${days}g`
    if (hours > 0) return `${hours}s`
    if (minutes > 0) return `${minutes}dk`
    return `${seconds}sn`
  }

  // Eğer lastRefreshTime undefined ise (geri bildirim sayfası gibi) hiçbir şey gösterme
  if (!lastRefreshTime && !refreshHistory.length) {
    return null
  }

  return (
    <SidebarGroup className="mt-auto">
      <SidebarGroupContent>
        <div className="px-0.5 pb-2">
          {/* Son Güncelleme Kutucuğu */}
          <div className="rounded-lg border border-[oklch(0.90_0.00_0_/_0.5)] dark:border-[oklch(0.27_0.00_0_/_0.5)] bg-[oklch(0.99_0.00_0)] dark:bg-[oklch(0.14_0.00_0)] overflow-hidden">
            {/* Başlık */}
            <div className="px-3 py-2">
              <div className="flex items-center gap-2">
                {/* Canlılık durumu göstergesi */}
                <motion.div
                  animate={{ 
                    scale: [1, 1.2, 1],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    repeatType: "loop",
                    ease: "easeInOut"
                  }}
                  className={cn(
                    "w-2 h-2 rounded-full flex-shrink-0",
                    isLastRefreshSuccessful 
                      ? "bg-green-600 dark:bg-green-500" 
                      : "bg-red-600 dark:bg-red-500"
                  )}
                />
                <div className="flex flex-col flex-1">
                  <span className="text-xs font-medium text-[oklch(0.40_0.00_0)] dark:text-[oklch(0.72_0.00_0)]">
                    Son Güncelleme
                  </span>
                </div>
              </div>
            </div>

            {/* Divider */}
            {refreshHistory.length > 0 && (
              <>
                <div className="border-t border-[oklch(0.90_0.00_0_/_0.3)] dark:border-[oklch(0.27_0.00_0_/_0.3)]" />
                
                {/* Geçmiş - Son 5 kayıt */}
                <div className="px-3 py-2 space-y-1.5">
                  {refreshHistory.slice(0, 5).map((item, index) => (
                    <motion.div
                      key={`${item.time.getTime()}-${index}`}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: index * 0.05 }}
                      className="flex items-center gap-2"
                    >
                      <div className={cn(
                        "w-1.5 h-1.5 rounded-full flex-shrink-0",
                        item.success 
                          ? "bg-green-600/60 dark:bg-green-500/60" 
                          : "bg-red-600/60 dark:bg-red-500/60"
                      )} />
                      
                      <span className="text-[10px] text-[oklch(0.50_0.00_0)] dark:text-[oklch(0.62_0.00_0)] flex-1 truncate">
                        {item.groupName || "Tüm Gruplar"}
                      </span>
                      
                      <span className="text-[10px] text-[oklch(0.60_0.00_0)] dark:text-[oklch(0.52_0.00_0)] font-medium">
                        {getShortTime(item.time)}
                      </span>
                    </motion.div>
                  ))}
                </div>
              </>
            )}

            {/* Eğer hiç güncelleme yoksa */}
            {!lastRefreshTime && refreshHistory.length === 0 && (
              <div className="px-3 pb-2">
                <p className="text-[10px] text-[oklch(0.50_0.00_0)] dark:text-[oklch(0.62_0.00_0)]">
                  Henüz güncelleme yapılmadı
                </p>
              </div>
            )}
          </div>
        </div>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}