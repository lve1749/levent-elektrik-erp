import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { GrupBilgisi } from '@/types'
import { GroupQueries } from '@/lib/queries'

export async function GET() {
  try {
    // SQL sorgusunu modülden al
    const query = GroupQueries.getMainGroupsQuery()
    
    // Sorguyu çalıştır - $queryRawUnsafe kullan
    const gruplar = await prisma.$queryRawUnsafe<GrupBilgisi[]>(query)

    return NextResponse.json({
      success: true,
      data: gruplar
    })

  } catch (error) {
    console.error('Grup listesi hatası detay:', error)
    const errorMessage = error instanceof Error ? error.message : 'Bilinmeyen hata'
    return NextResponse.json(
      { 
        success: false, 
        error: 'Grup listesi alınamadı',
        detail: errorMessage 
      },
      { status: 500 }
    )
  }
}