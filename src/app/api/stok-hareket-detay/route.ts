import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const stokKodu = searchParams.get('stokKodu')
    const baslangicTarih = searchParams.get('baslangicTarih') || '2025-01-01'
    const bitisTarih = searchParams.get('bitisTarih') || '2025-12-31'
    
    if (!stokKodu) {
      return NextResponse.json(
        { success: false, error: 'Stok kodu gerekli' },
        { status: 400 }
      )
    }

    // Özet bilgileri getir
    const ozetQuery = `
      SELECT 
        @P1 AS stokKodu,
        (SELECT TOP 1 sto_isim FROM [MikroDB_V16_LEVENT2025].[dbo].[STOKLAR] WHERE sto_kod = @P1) AS stokIsmi,
        
        -- GİRİŞ MİKTARI = Normal Girişler - Alış İadeleri
        SUM(CASE 
          WHEN sth_tip = 0 AND sth_normal_iade = 0 AND sth_cins != 9 THEN sth_miktar
          WHEN sth_tip = 1 AND sth_normal_iade = 1 AND sth_cins = 0 THEN -sth_miktar
          ELSE 0 
        END) AS netGirisMiktari,
        
        -- ÇIKIŞ MİKTARI = Normal Çıkışlar - Satış İadeleri
        SUM(CASE 
          WHEN sth_tip = 1 AND sth_normal_iade = 0 AND sth_cins != 9 THEN sth_miktar
          WHEN sth_tip = 0 AND sth_normal_iade = 1 AND sth_cins = 0 THEN -sth_miktar
          ELSE 0 
        END) AS netCikisMiktari,
        
        -- KALAN MİKTAR
        SUM(CASE 
          WHEN sth_tip = 0 AND sth_normal_iade = 0 AND sth_cins != 9 THEN sth_miktar
          WHEN sth_tip = 0 AND sth_normal_iade = 1 AND sth_cins = 0 THEN sth_miktar
          WHEN sth_tip = 1 AND sth_normal_iade = 0 AND sth_cins != 9 THEN -sth_miktar
          WHEN sth_tip = 1 AND sth_normal_iade = 1 AND sth_cins = 0 THEN -sth_miktar
          ELSE 0 
        END) AS kalanMiktar,
        
        COUNT(*) AS toplamHareket,
        SUM(CASE WHEN sth_tip = 0 AND sth_normal_iade = 0 THEN 1 ELSE 0 END) AS normalGirisSayisi,
        SUM(CASE WHEN sth_tip = 1 AND sth_normal_iade = 0 THEN 1 ELSE 0 END) AS normalCikisSayisi,
        SUM(CASE WHEN sth_tip = 0 AND sth_normal_iade = 1 THEN 1 ELSE 0 END) AS satisIadesiSayisi,
        SUM(CASE WHEN sth_tip = 1 AND sth_normal_iade = 1 THEN 1 ELSE 0 END) AS alisIadesiSayisi,
        SUM(CASE WHEN sth_proje_kodu = 'P' THEN 1 ELSE 0 END) AS projeHareketi,
        SUM(CASE WHEN sth_cins = 3 THEN 1 ELSE 0 END) AS degisim,
        SUM(CASE WHEN sth_cins IN (10, 11) THEN 1 ELSE 0 END) AS sayim,
        
        -- YENİ İSTATİSTİK ALANLARI
        AVG(CASE 
          WHEN sth_tip = 0 AND sth_normal_iade = 0 AND sth_cins NOT IN (3, 9, 10, 11)
          THEN sth_miktar 
        END) AS ortNormalGiris,
        
        (SELECT AVG(CAST(sth_miktar AS FLOAT))
         FROM [MikroDB_V16_LEVENT2025].[dbo].[STOK_HAREKETLERI]
         WHERE sth_tip = 1 
           AND sth_cins NOT IN (6, 9)
           AND sth_stok_kod = @P1
           AND sth_tarih BETWEEN @P2 AND @P3
           AND sth_normal_iade = 0
           AND (sth_proje_kodu IS NULL OR sth_proje_kodu != 'P')
        ) AS ortNormalSatis,
        
        (SELECT STDEV(sth_miktar)
         FROM [MikroDB_V16_LEVENT2025].[dbo].[STOK_HAREKETLERI]
         WHERE sth_tip = 1 
           AND sth_cins NOT IN (6, 9)
           AND sth_stok_kod = @P1
           AND sth_tarih BETWEEN @P2 AND @P3
           AND sth_normal_iade = 0
           AND (sth_proje_kodu IS NULL OR sth_proje_kodu != 'P')
        ) AS standartSapma
        
      FROM [MikroDB_V16_LEVENT2025].[dbo].[STOK_HAREKETLERI]
      WHERE sth_stok_kod = @P1
        AND sth_tarih BETWEEN @P2 AND @P3
        AND sth_cins NOT IN (6, 9)
    `

    // Hareket detaylarını getir
    const detayQuery = `
      WITH HareketIstatistik AS (
        SELECT 
          sth_stok_kod,
          AVG(CAST(sth_miktar AS FLOAT)) as ortalama,
          STDEV(sth_miktar) as standart_sapma
        FROM [MikroDB_V16_LEVENT2025].[dbo].[STOK_HAREKETLERI]
        WHERE sth_tip = 1
          AND sth_cins NOT IN (6, 9)
          AND sth_stok_kod = @P1
          AND sth_tarih BETWEEN @P2 AND @P3
          AND sth_normal_iade = 0
          AND (sth_proje_kodu IS NULL OR sth_proje_kodu != 'P')
        GROUP BY sth_stok_kod
      ),
      StokBilgi AS (
        SELECT TOP 1
          sto_kod,
          sto_isim
        FROM [MikroDB_V16_LEVENT2025].[dbo].[STOKLAR]
        WHERE sto_kod = @P1
      )
      SELECT 
        sh.sth_stok_kod AS stokKodu,
        ISNULL(sb.sto_isim, 'Tanımsız') AS stokIsmi,
        
        -- GİRİŞ MİKTARI
        CASE 
          WHEN sh.sth_tip = 0 AND sh.sth_normal_iade = 0 AND sh.sth_cins != 9
            THEN sh.sth_miktar
          WHEN sh.sth_tip = 0 AND sh.sth_normal_iade = 1 AND sh.sth_cins = 0
            THEN sh.sth_miktar
          ELSE 0 
        END AS girisMiktari,
        
        -- ÇIKIŞ MİKTARI
        CASE 
          WHEN sh.sth_tip = 1 AND sh.sth_normal_iade = 0 AND sh.sth_cins != 9
            THEN sh.sth_miktar
          WHEN sh.sth_tip = 1 AND sh.sth_normal_iade = 1 AND sh.sth_cins = 0
            THEN sh.sth_miktar
          ELSE 0 
        END AS cikisMiktari,
        
        sh.sth_tarih AS hareketTarihi,
        
        -- HAREKET TİPİ
        CASE 
          WHEN sh.sth_proje_kodu = 'P' THEN 'PROJE'
          WHEN sh.sth_tip = 0 AND sh.sth_normal_iade = 1 AND sh.sth_cins = 0
            THEN 'SATIŞ İADESİ'
          WHEN sh.sth_tip = 1 AND sh.sth_normal_iade = 1 AND sh.sth_cins = 0
            THEN 'ALIŞ İADESİ'
          WHEN sh.sth_tip = 0 AND sh.sth_normal_iade = 0 THEN
            CASE
              WHEN sh.sth_evraktip = 13 THEN 'STOK ALIMI'
              WHEN sh.sth_evraktip = 3 AND sh.sth_cins = 0 THEN 'SATIN ALMA'
              WHEN sh.sth_evraktip = 6 AND sh.sth_cins = 3 THEN 'DEĞİŞİM (Alınan)'
              WHEN sh.sth_evraktip = 12 AND sh.sth_cins IN (10, 11) THEN 'SAYIM FAZLASI'
              ELSE 'GİRİŞ'
            END
          WHEN sh.sth_tip = 1 AND sh.sth_normal_iade = 0 THEN
            CASE
              WHEN sh.sth_evraktip = 1 AND sh.sth_cins = 0 THEN
                CASE 
                  WHEN hi.ortalama IS NOT NULL 
                    AND sh.sth_miktar > (hi.ortalama + (3 * hi.standart_sapma))
                  THEN 'ANORMAL SATIŞ'
                  ELSE 'NORMAL SATIŞ'
                END
              WHEN sh.sth_evraktip = 6 AND sh.sth_cins = 3 THEN 'DEĞİŞİM (Verilen)'
              WHEN sh.sth_evraktip = 4 AND sh.sth_cins = 0 THEN
                CASE 
                  WHEN hi.ortalama IS NOT NULL 
                    AND sh.sth_miktar > (hi.ortalama + (3 * hi.standart_sapma))
                  THEN 'ANORMAL SATIŞ'
                  ELSE 'SATIŞ'
                END
              ELSE 'ÇIKIŞ'
            END
          ELSE 'DİĞER'
        END AS hareketTipi,
        
        -- STOK ETKİSİ
        CASE 
          WHEN (sh.sth_tip = 0 AND sh.sth_normal_iade = 0 AND sh.sth_cins != 9)
            OR (sh.sth_tip = 0 AND sh.sth_normal_iade = 1 AND sh.sth_cins = 0)
          THEN '+' + CAST(sh.sth_miktar AS VARCHAR)
          WHEN (sh.sth_tip = 1 AND sh.sth_normal_iade = 0 AND sh.sth_cins != 9)
            OR (sh.sth_tip = 1 AND sh.sth_normal_iade = 1 AND sh.sth_cins = 0)
          THEN '-' + CAST(sh.sth_miktar AS VARCHAR)
          ELSE '0'
        END AS stokEtkisi,
        
        sh.sth_evrakno_seri + '-' + CAST(sh.sth_evrakno_sira AS VARCHAR) AS evrakNo,
        sh.sth_cari_kodu AS cariKodu,
        sh.sth_aciklama AS aciklama,
        
        -- Anormallik derecesi
        CASE 
          WHEN sh.sth_tip = 1 
            AND sh.sth_normal_iade = 0 
            AND sh.sth_cins = 0
            AND sh.sth_evraktip IN (1, 4)
            AND hi.ortalama IS NOT NULL 
            AND hi.ortalama > 0
          THEN ROUND(sh.sth_miktar / hi.ortalama, 2)
          ELSE NULL
        END AS normalKati,
        
        -- Renk kodlaması
        CASE 
          WHEN sh.sth_proje_kodu = 'P' THEN 'success'
          WHEN sh.sth_tip = 0 AND sh.sth_normal_iade = 1 THEN 'warning'
          WHEN sh.sth_tip = 1 AND sh.sth_normal_iade = 1 THEN 'orange'
          WHEN sh.sth_cins = 3 THEN 'info'
          WHEN sh.sth_cins IN (10, 11) THEN 'secondary'
          WHEN sh.sth_tip = 1 
            AND sh.sth_normal_iade = 0
            AND hi.ortalama IS NOT NULL 
            AND sh.sth_miktar > (hi.ortalama + (3 * hi.standart_sapma)) 
          THEN 'error'
          WHEN sh.sth_tip = 0 AND sh.sth_normal_iade = 0 THEN 'primary'
          ELSE 'default'
        END AS renkKodu,
        
        sh.sth_evraktip AS evrakTip,
        sh.sth_tip AS tip,
        sh.sth_cins AS cins,
        sh.sth_normal_iade AS iadeFlag
        
      FROM [MikroDB_V16_LEVENT2025].[dbo].[STOK_HAREKETLERI] sh
      LEFT JOIN HareketIstatistik hi ON sh.sth_stok_kod = hi.sth_stok_kod
      CROSS JOIN StokBilgi sb
      WHERE sh.sth_stok_kod = @P1
        AND sh.sth_tarih BETWEEN @P2 AND @P3
        AND sh.sth_cins NOT IN (6, 9)
      ORDER BY sh.sth_tarih DESC, sh.sth_evrakno_sira DESC
    `

    const [ozetResult, detayResult] = await Promise.all([
      prisma.$queryRawUnsafe<any[]>(ozetQuery, stokKodu, baslangicTarih, bitisTarih),
      prisma.$queryRawUnsafe<any[]>(detayQuery, stokKodu, baslangicTarih, bitisTarih)
    ])

    const ozet = {
      ...ozetResult[0],
      netGirisMiktari: ozetResult[0]?.netGirisMiktari || 0,
      netCikisMiktari: ozetResult[0]?.netCikisMiktari || 0,
      kalanMiktar: ozetResult[0]?.kalanMiktar || 0,
      toplamHareket: ozetResult[0]?.toplamHareket || 0,
      normalGirisSayisi: ozetResult[0]?.normalGirisSayisi || 0,
      normalCikisSayisi: ozetResult[0]?.normalCikisSayisi || 0,
      satisIadesiSayisi: ozetResult[0]?.satisIadesiSayisi || 0,
      alisIadesiSayisi: ozetResult[0]?.alisIadesiSayisi || 0,
      projeHareketi: ozetResult[0]?.projeHareketi || 0,
      degisim: ozetResult[0]?.degisim || 0,
      sayim: ozetResult[0]?.sayim || 0,
      ortNormalGiris: ozetResult[0]?.ortNormalGiris || 0,
      ortNormalSatis: ozetResult[0]?.ortNormalSatis || 0,
      standartSapma: ozetResult[0]?.standartSapma || 0,
      ustSinir: ozetResult[0]?.ortNormalSatis && ozetResult[0]?.standartSapma
        ? ozetResult[0].ortNormalSatis + (3 * ozetResult[0].standartSapma)
        : 0
    }

    return NextResponse.json({
      success: true,
      ozet,
      data: detayResult,
      count: detayResult.length
    })

  } catch (error) {
    console.error('Hareket detay hatası:', error)
    const errorMessage = error instanceof Error ? error.message : 'Bilinmeyen hata'
    return NextResponse.json(
      { 
        success: false, 
        error: 'Hareket detayları alınamadı',
        detail: errorMessage 
      },
      { status: 500 }
    )
  }
}