import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { StokAnalizRaporu } from '@/types'
import { queries, QueryParams } from '@/lib/queries'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const baslangicTarih = searchParams.get('baslangicTarih') || '2025-01-01'
    const bitisTarih = searchParams.get('bitisTarih') || '2025-12-31'
    const anaGrup = searchParams.get('anaGrup')
    const aySayisi = parseFloat(searchParams.get('aySayisi') || '12')

    // Query parametrelerini hazırla
    const queryParams: QueryParams = {
      baslangicTarih,
      bitisTarih,
      anaGrup,
      aySayisi
    }

    // SQL sorgusunu modülden al
    const query = queries.getStockAnalysis(queryParams)

    // Parametreleri hazırla
    const params = anaGrup 
      ? [baslangicTarih, bitisTarih, anaGrup, aySayisi]
      : [baslangicTarih, bitisTarih, aySayisi]

    // Sorguyu çalıştır
    const result = await prisma.$queryRawUnsafe<any[]>(query, ...params)

    // Sonuçları TypeScript tipine dönüştür
    const formattedData: StokAnalizRaporu[] = result.map((row: any) => ({
      stokKodu: row.stokKodu,
      stokIsmi: row.stokIsmi,
      anaGrup: row.anaGrup,
      altGrup: row.altGrup,
      depo: row.depo,
      girisMiktari: Number(row.girisMiktari),
      cikisMiktari: Number(row.cikisMiktari),
      kalanMiktar: Number(row.kalanMiktar),
      verilenSiparis: Number(row.verilenSiparis),
      alinanSiparis: Number(row.alinanSiparis),
      stokBekleyen: Number(row.stokBekleyen),
      toplamEksik: Number(row.toplamEksik),
      aylikOrtalamaSatis: Number(row.aylikOrtalamaSatis),
      ortalamaAylikStok: Number(row.ortalamaAylikStok),
      
      // Önerilen Sipariş
      onerilenSiparis: Number(row.onerilenSiparis || 0),
      hedefAy: Number(row.hedefAy || 0),
      siparisNedeni: row.siparisNedeni,
      
      // Hareket bilgileri
      sonHareketTarihi: row.sonHareketTarihi ? new Date(row.sonHareketTarihi) : null,
      sonGirisTarihi: row.sonGirisTarihi ? new Date(row.sonGirisTarihi) : null,
      sonCikisTarihi: row.sonCikisTarihi ? new Date(row.sonCikisTarihi) : null,
      sonHareketGun: row.sonHareketGun !== null ? Number(row.sonHareketGun) : null,
      sonGirisGun: row.sonGirisGun !== null ? Number(row.sonGirisGun) : null,
      sonCikisGun: row.sonCikisGun !== null ? Number(row.sonCikisGun) : null,
      devirHiziGun: Number(row.devirHiziGun),
      hareketGunSayisi: Number(row.hareketGunSayisi),
      donemGirisSayisi: Number(row.donemGirisSayisi),
      donemCikisSayisi: Number(row.donemCikisSayisi),
      
      // YENİ: Dönem bazlı çıkış sayıları
      son30GunCikisSayisi: Number(row.son30GunCikisSayisi || 0),
      son60GunCikisSayisi: Number(row.son60GunCikisSayisi || 0),
      son180GunCikisSayisi: Number(row.son180GunCikisSayisi || 0),
      son365GunCikisSayisi: Number(row.son365GunCikisSayisi || 0),
      
      hareketDurumu: row.hareketDurumu as 'Aktif' | 'Yavaş' | 'Durgun' | 'Ölü Stok',
      
      // Mevsimsellik verileri
      mevsimselPattern: row.mevsimselPatternTip ? {
        tip: row.mevsimselPatternTip,
        mevsimselIndeks: [], // Bu aşamada boş, gerekirse doldurulabilir
        stdSapma: Number(row.mevsimselStdSapma || 0),
        maxAy: Number(row.mevsimselMaxAy || 0),
        minAy: Number(row.mevsimselMinAy || 0)
      } : undefined,
      mevsimselRisk: Number(row.mevsimselRisk || 0)
    }))

    return NextResponse.json({
      success: true,
      data: formattedData,
      count: formattedData.length
    })

  } catch (error) {
    console.error('Stok analiz hatası detay:', error)
    const errorMessage = error instanceof Error ? error.message : 'Bilinmeyen hata'
    return NextResponse.json(
      { 
        success: false, 
        error: 'Stok analiz hatası oluştu',
        detail: errorMessage 
      },
      { status: 500 }
    )
  }
}