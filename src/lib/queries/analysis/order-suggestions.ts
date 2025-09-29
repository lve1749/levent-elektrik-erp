/**
 * Sipariş Öneri Hesaplama Sorguları
 * Stok seviyesi ve hareket durumuna göre sipariş önerileri
 */

import { param, sqlGreatest } from '../types'

/**
 * Hedef ay hesaplama
 * Devir hızına göre kaç aylık stok tutulması gerektiğini belirler
 * DÜZELTİLDİ: Daha muhafazakar ve gerçekçi hedefler
 */
export const getTargetMonthCalculation = (aySayisiParam: string) => `
  -- HEDEF AY HESAPLAMASI (Hareket durumu ve devir hızı birlikte değerlendirilir)
  CASE 
    -- Ölü stok için sipariş önerme
    WHEN DATEDIFF(DAY, sho.son_cikis_tarihi, GETDATE()) > 180 THEN 0
    
    -- Stok 0 ise hareket durumuna göre belirle
    WHEN sho.kalan_miktar = 0 OR sho.kalan_miktar IS NULL THEN
      CASE 
        WHEN sho.son_30_gun_cikis_sayisi >= 3 THEN 1.5  -- Aktif
        WHEN sho.son_60_gun_cikis_sayisi >= 2 THEN 1.0  -- Yavaş
        WHEN sho.son_180_gun_cikis_sayisi >= 1 THEN 0.5 -- Durgun
        ELSE 0.5 -- Ölü stok
      END
    
    -- ÇELİŞKİLİ DURUM: Durgun/Yavaş hareket + Hızlı devir → Hareket durumunu baz al
    WHEN (sho.son_180_gun_cikis_sayisi >= 1 AND sho.son_60_gun_cikis_sayisi < 2)  -- Durgun
      AND sho.kalan_miktar * 30 / NULLIF(sho.normal_cikis_miktari / ${aySayisiParam}, 0) <= 30
    THEN 0.5  -- Durgun hareket baz alındı
    
    WHEN (sho.son_60_gun_cikis_sayisi >= 2 AND sho.son_30_gun_cikis_sayisi < 3)  -- Yavaş
      AND sho.kalan_miktar * 30 / NULLIF(sho.normal_cikis_miktari / ${aySayisiParam}, 0) <= 30
    THEN 1.0  -- Yavaş hareket baz alındı
    
    -- NORMAL DURUMLAR: Aktif hareket varsa devir hızına göre
    WHEN sho.son_30_gun_cikis_sayisi >= 3 THEN
      CASE
        WHEN sho.kalan_miktar * 30 / NULLIF(sho.normal_cikis_miktari / ${aySayisiParam}, 0) <= 15 THEN 1.5
        WHEN sho.kalan_miktar * 30 / NULLIF(sho.normal_cikis_miktari / ${aySayisiParam}, 0) <= 30 THEN 1.2
        WHEN sho.kalan_miktar * 30 / NULLIF(sho.normal_cikis_miktari / ${aySayisiParam}, 0) <= 60 THEN 1.0
        ELSE 0.5
      END
    
    -- Yavaş hareket
    WHEN sho.son_60_gun_cikis_sayisi >= 2 THEN 1.0
    
    -- Durgun hareket  
    WHEN sho.son_180_gun_cikis_sayisi >= 1 THEN 0.5
    
    -- Diğer durumlar
    ELSE 0.5
  END AS hedefAy
`

/**
 * Önerilen sipariş hesaplama
 * Karmaşık iş kurallarını içeren ana sipariş öneri formülü
 */
export const getSuggestedOrderCalculation = (aySayisiParam: string) => `
  -- ÖNERİLEN SİPARİŞ HESAPLAMASI
  CASE 
    -- 1. Hareket durumu kontrolü: Ölü Stok için sipariş önerme
    WHEN DATEDIFF(DAY, sho.son_cikis_tarihi, GETDATE()) > 180 OR sho.son_cikis_tarihi IS NULL THEN 0
    
    -- 2. NET STOK YÜKSEKSE KONTROL (YENİ)
    -- Net stok (mevcut + verilen - alınan) 2 aydan fazla yetiyorsa sipariş önerme
    WHEN (sho.kalan_miktar + ISNULL(so.verilen_siparis, 0) - ISNULL(so.alinan_siparis, 0)) >= 
         ((sho.normal_cikis_miktari / NULLIF(${aySayisiParam}, 0)) * 2) THEN 0
    
    -- 3. Durgun + Düşük satış kontrolü
    WHEN DATEDIFF(DAY, sho.son_cikis_tarihi, GETDATE()) > 60 
      AND (sho.normal_cikis_miktari / NULLIF(${aySayisiParam}, 0)) < 2
      AND sho.kalan_miktar >= 0.5
      THEN 0
    
    -- 4. Aylık satış yoksa sipariş önerme
    WHEN sho.normal_cikis_miktari = 0 OR ${aySayisiParam} = 0 THEN 0
    
    -- 5. ÖZEL SİPARİŞ KONTROLÜ
    -- Toplam hareket sayısı az (5'ten az) VE giriş-çıkış dengeli ise özel sipariş
    WHEN sho.hareket_gun_sayisi <= 5 
      AND ABS(sho.giris_miktari - sho.cikis_miktari) < (sho.giris_miktari * 0.1) -- %10 tolerans
      AND sho.kalan_miktar < 5 -- Stokta çok az veya hiç yok
      THEN 0
      
    -- 6. TEK SEFERLIK HAREKET KONTROLÜ
    -- Sadece 1-2 kez hareket görmüş ve stokta kalmamış ürünler
    WHEN (sho.donem_giris_sayisi + sho.donem_cikis_sayisi) <= 2 
      AND sho.kalan_miktar < 5
      THEN 0
      
    -- 7. DÜŞÜK FREKANSLI ÜRÜN KONTROLÜ (GÜNCELLENDİ)
    -- Ayda 1'den az hareket ve düşük hareket sayısı
    WHEN (sho.normal_cikis_miktari / NULLIF(${aySayisiParam}, 0)) < 1 
      AND sho.hareket_gun_sayisi < 10
      AND sho.kalan_miktar > 0
      THEN 0
    
    -- Normal hesaplama
    ELSE 
      ${getCableProductCalculation(aySayisiParam)}
  END AS onerilenSiparis
`

/**
 * Kablo ürünleri için özel hesaplama
 * Minimum sipariş miktarı ve yuvarlama kuralları
 */
export const getCableProductCalculation = (aySayisiParam: string) => {
  // Net stok hesaplaması ile kontrol
  const netStockCheck = `(sho.kalan_miktar + ISNULL(so.verilen_siparis, 0) - ISNULL(so.alinan_siparis, 0))`
  const monthlyAverage = `(sho.normal_cikis_miktari / NULLIF(${aySayisiParam}, 0))`
  const baseCalculation = getBaseOrderCalculation(aySayisiParam)
  
  return `
    -- ÖNCE NET STOK KONTROLÜ
    CASE 
      -- Net stok 2 aydan fazla yetiyorsa sipariş önerme
      WHEN ${netStockCheck} >= (${monthlyAverage} * 2) THEN 0
      
      -- KABLO KONTROLÜ VE MİNİMUM SİPARİŞ
      -- Reçber, Hes, Kablolar ana grubundaki ürünler için özel kural
      WHEN sho.sto_anagrup_kod IN ('Reçber', 'Hes', 'Kablolar')
      THEN 
        -- Önce negatif veya sıfır kontrolü yap
        CASE 
          WHEN (${baseCalculation}) <= 0
          THEN 0 -- Sipariş gerekmiyorsa 0
          -- 250 metreden az ise öneri yapma
          WHEN (${baseCalculation}) < 250
          THEN 0
          -- 250-500 arası ise 500'e yuvarla
          WHEN (${baseCalculation}) BETWEEN 250 AND 500
          THEN 500
          -- 500'den fazla ise en yakın 250'ye yuvarla
          ELSE CEILING((${baseCalculation}) / 250.0) * 250
        END
      
      -- Normal ürünler için standart hesaplama (negatif olamaz ve 1'den küçük değerler yukarı yuvarlanır)
      ELSE 
        CASE 
          WHEN (${baseCalculation}) <= 0 THEN 0
          WHEN (${baseCalculation}) > 0 AND (${baseCalculation}) < 1 THEN 1
          ELSE ${baseCalculation}
        END
    END
  `
}

/**
 * Temel sipariş miktarı hesaplama formülü
 * (Aylık Ortalama Satış × Hedef Ay × Hareket Faktörü × Mevsimsellik) - (Kalan Miktar + Verilen Sipariş - Alınan Sipariş)
 */
export const getBaseOrderCalculation = (aySayisiParam: string) => `
  -- Önce net stoku hesapla
  CASE 
    -- Net stok zaten yeterli ise 0 döndür
    WHEN (sho.kalan_miktar + ISNULL(so.verilen_siparis, 0) - ISNULL(so.alinan_siparis, 0)) >= 
         ((sho.normal_cikis_miktari / NULLIF(${aySayisiParam}, 0)) * 1.5) 
    THEN 0
    
    -- Normal hesaplama
    ELSE
      ((sho.normal_cikis_miktari / ${aySayisiParam}) * 
        -- Hedef ay hesaplaması - Hareket durumu ve devir hızı birlikte değerlendirilir
        CASE 
          -- ÖNCE: Stok 0 mı kontrol et (devir hızı hesaplanamaz)
          WHEN sho.kalan_miktar = 0 OR sho.kalan_miktar IS NULL THEN
            CASE 
              -- Hareket durumuna göre hedef ay belirle
              WHEN sho.son_30_gun_cikis_sayisi >= 3 THEN 1.5  -- Aktif
              WHEN sho.son_60_gun_cikis_sayisi >= 2 THEN 1.0  -- Yavaş  
              WHEN sho.son_180_gun_cikis_sayisi >= 1 THEN 0.5 -- Durgun
              ELSE 0.5 -- Ölü stok
            END
          
          -- ÇELİŞKİLİ DURUM: Durgun/Yavaş hareket + Hızlı devir → Hareket durumunu baz al
          WHEN (sho.son_180_gun_cikis_sayisi >= 1 AND sho.son_60_gun_cikis_sayisi < 2)  -- Durgun
            AND (sho.kalan_miktar * 30) / NULLIF(sho.normal_cikis_miktari / ${aySayisiParam}, 0) <= 30
          THEN 0.5  -- Durgun hareket baz alındı
          
          WHEN (sho.son_60_gun_cikis_sayisi >= 2 AND sho.son_30_gun_cikis_sayisi < 3)  -- Yavaş
            AND (sho.kalan_miktar * 30) / NULLIF(sho.normal_cikis_miktari / ${aySayisiParam}, 0) <= 30
          THEN 1.0  -- Yavaş hareket baz alındı
          
          -- NORMAL DURUMLAR: Hareket aktifse devir hızına göre
          WHEN sho.son_30_gun_cikis_sayisi >= 3 THEN  -- Aktif hareket
            CASE
              WHEN (sho.kalan_miktar * 30) / NULLIF(sho.normal_cikis_miktari / ${aySayisiParam}, 0) <= 15 THEN 1.5
              WHEN (sho.kalan_miktar * 30) / NULLIF(sho.normal_cikis_miktari / ${aySayisiParam}, 0) <= 30 THEN 1.2
              WHEN (sho.kalan_miktar * 30) / NULLIF(sho.normal_cikis_miktari / ${aySayisiParam}, 0) <= 60 THEN 1.0
              ELSE 0.5
            END
          
          -- Yavaş hareket
          WHEN sho.son_60_gun_cikis_sayisi >= 2 THEN 1.0
          
          -- Durgun hareket
          WHEN sho.son_180_gun_cikis_sayisi >= 1 THEN 0.5
          
          -- Diğer durumlar
          ELSE 0.5
        END
      ) - (sho.kalan_miktar + ISNULL(so.verilen_siparis, 0) - ISNULL(so.alinan_siparis, 0))
  END
`

/**
 * Sipariş nedeni açıklaması
 * Neden sipariş önerildiğini veya önerilmediğini açıklar
 */
export const getOrderReasonCalculation = (aySayisiParam: string) => `
  -- Sipariş nedeni açıklaması
  CASE 
    WHEN DATEDIFF(DAY, sho.son_cikis_tarihi, GETDATE()) > 365 OR sho.son_cikis_tarihi IS NULL 
      THEN 'Ölü stok - Sipariş önerilmez'
    WHEN DATEDIFF(DAY, sho.son_cikis_tarihi, GETDATE()) > 180 
      THEN 'Ölü stok - Sipariş önerilmez'
      
    -- YENİ: Durgun + Düşük satış kontrolü
    WHEN DATEDIFF(DAY, sho.son_cikis_tarihi, GETDATE()) > 60 
      AND (sho.normal_cikis_miktari / NULLIF(${aySayisiParam}, 0)) < 2
      AND sho.kalan_miktar >= 0.5
      THEN 'Durgun ürün - Düşük talep, mevcut stok yeterli'
      
    WHEN sho.normal_cikis_miktari = 0 THEN 'Satış hareketi yok'
    
    -- Özel sipariş durumları
    WHEN sho.hareket_gun_sayisi <= 5 
      AND ABS(sho.giris_miktari - sho.cikis_miktari) < (sho.giris_miktari * 0.1)
      AND sho.kalan_miktar < 5 
      THEN 'Özel sipariş ürünü - Sipariş önerilmez'
      
    WHEN (sho.donem_giris_sayisi + sho.donem_cikis_sayisi) <= 2 
      AND sho.kalan_miktar < 5
      THEN 'Tek seferlik hareket - Sipariş önerilmez'
      
    -- GÜNCELLENDİ: Düşük frekanslı ürün kontrolü
    WHEN (sho.normal_cikis_miktari / NULLIF(${aySayisiParam}, 0)) < 1 
      AND sho.hareket_gun_sayisi < 10
      AND sho.kalan_miktar > 0
      THEN 'Özel sipariş ürünü - Talep üzerine tedarik edilmeli'
      
    -- Kablo minimum metraj kontrolü
    WHEN sho.sto_anagrup_kod IN ('Reçber', 'Hes', 'Kablolar')
      AND ((sho.normal_cikis_miktari / ${aySayisiParam}) * 
        CASE 
          WHEN sho.kalan_miktar * 30 / NULLIF(sho.normal_cikis_miktari / ${aySayisiParam}, 0) < 15 THEN 1.5
          WHEN sho.kalan_miktar * 30 / NULLIF(sho.normal_cikis_miktari / ${aySayisiParam}, 0) < 30 THEN 1.2
          WHEN sho.kalan_miktar * 30 / NULLIF(sho.normal_cikis_miktari / ${aySayisiParam}, 0) < 60 THEN 1
          ELSE 0.5
        END
      ) - (sho.kalan_miktar + ISNULL(so.verilen_siparis, 0) - ISNULL(so.alinan_siparis, 0)) < 250
      THEN 'Minimum kablo siparişi altında'
    
    -- Stok durumu açıklamaları
    WHEN sho.kalan_miktar / NULLIF(sho.normal_cikis_miktari / ${aySayisiParam}, 0) < 0.5 THEN 'Kritik stok seviyesi'
    WHEN sho.kalan_miktar / NULLIF(sho.normal_cikis_miktari / ${aySayisiParam}, 0) < 1 THEN 'Düşük stok seviyesi'
    WHEN mo.degiskenlik_katsayisi > 0.5 AND MONTH(GETDATE()) IN (mo.max_ay - 1, mo.max_ay) THEN 'Mevsimsel pik dönemi yaklaşıyor'
    ELSE 'Normal stok yenileme'
  END AS siparisNedeni
`

/**
 * Sipariş öneri özeti
 * Toplam önerilen sipariş miktarı ve değeri
 */
export const getOrderSuggestionSummary = () => `
  SELECT 
    COUNT(CASE WHEN onerilenSiparis > 0 THEN 1 END) as oneriVerilenUrunSayisi,
    SUM(onerilenSiparis) as toplamOnerilenMiktar,
    COUNT(CASE WHEN siparisNedeni LIKE '%önerilmez%' THEN 1 END) as oneriVerilmeyenUrunSayisi,
    COUNT(CASE WHEN siparisNedeni = 'Kritik stok seviyesi' THEN 1 END) as kritikSeviyedekiUrunler,
    COUNT(CASE WHEN siparisNedeni LIKE '%Mevsimsel%' THEN 1 END) as mevsimselUrunler
  FROM AnalysisResult
`