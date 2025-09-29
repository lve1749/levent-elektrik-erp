import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { SeasonalityQueries } from '@/lib/queries'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const stokKodu = searchParams.get('stokKodu')
    
    if (!stokKodu) {
      return NextResponse.json(
        { success: false, error: 'Stok kodu gerekli' },
        { status: 400 }
      )
    }

    // SQL sorgusunu modülden al
    const query = SeasonalityQueries.getStockMonthlyChartData(stokKodu, 2025)
    
    // Sorguyu çalıştır
    const result = await prisma.$queryRawUnsafe<any[]>(query, stokKodu)

    // 12 aylık veri dizisi oluştur (eksik ayları 0 ile doldur)
    const aylikHareketler = Array.from({ length: 12 }, (_, i) => {
      const ay = i + 1
      const data = result.find(r => r.ay === ay)
      
      return {
        ay,
        girisMiktari: data ? Number(data.giris_miktari) : 0,
        cikisMiktari: data ? Number(data.cikis_miktari) : 0,
        ortalamaStok: data ? Math.abs(Number(data.ortalama_stok)) : 0,
        hareketSayisi: data ? Number(data.hareket_sayisi) : 0
      }
    })

    return NextResponse.json({
      success: true,
      data: aylikHareketler
    })

  } catch (error) {
    console.error('Aylık hareket hatası:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Aylık hareket verisi alınamadı'
      },
      { status: 500 }
    )
  }
}