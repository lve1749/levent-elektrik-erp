/**
 * Ürün Tipi Tespit Sistemi
 * 
 * Bu modül, ürünlerin hareket pattern'lerini analiz ederek
 * doğru kategorilendirme yapar ve buna göre stok önerisi sunar.
 * 
 * Ürün Tipleri:
 * - Talep Bazlı: Az sayıda büyük miktarlı satış
 * - Özel Sipariş: Giriş-çıkış dengeli, az hareket
 * - Düzensiz Satış: Düzensiz pattern
 * - Yeni Ürün: Son 60 günde ilk hareketi
 * - Sezonluk: 2-4 ay arası satış
 * - Düzenli: 5+ ay satış
 * - Ölü Stok: Hareket yok
 */

export function getProductTypeDetectionCTE(): string {
  return `
    HareketOzet AS (
      -- Temel hareket özeti
      SELECT 
        sth_stok_kod,
        COUNT(DISTINCT sth_tarih) as hareket_gun_sayisi,
        COUNT(*) as toplam_hareket_sayisi,
        SUM(CASE WHEN sth_tip = 0 THEN 1 ELSE 0 END) as giris_hareket_sayisi,
        SUM(CASE WHEN sth_tip = 1 THEN 1 ELSE 0 END) as cikis_hareket_sayisi,
        SUM(CASE WHEN sth_tip = 0 THEN sth_miktar ELSE 0 END) as toplam_giris,
        SUM(CASE WHEN sth_tip = 1 THEN sth_miktar ELSE 0 END) as toplam_cikis,
        MIN(CASE WHEN sth_tip = 0 THEN sth_miktar END) as min_giris_miktari,
        MAX(CASE WHEN sth_tip = 0 THEN sth_miktar END) as max_giris_miktari,
        AVG(CASE WHEN sth_tip = 0 THEN sth_miktar END) as ort_giris_miktari,
        MIN(CASE WHEN sth_tip = 1 THEN sth_miktar END) as min_cikis_miktari,
        MAX(CASE WHEN sth_tip = 1 THEN sth_miktar END) as max_cikis_miktari,
        AVG(CASE WHEN sth_tip = 1 THEN sth_miktar END) as ort_cikis_miktari,
        MAX(sth_tarih) as son_hareket_tarihi,
        MIN(sth_tarih) as ilk_hareket_tarihi,
        DATEDIFF(DAY, MIN(sth_tarih), MAX(sth_tarih)) + 1 as aktif_gun_sayisi
      FROM STOK_HAREKETLERI
      WHERE sth_tarih BETWEEN @baslangicTarih AND @bitisTarih
        AND sth_normal_iade = 0
      GROUP BY sth_stok_kod
    ),
    
    HareketPattern AS (
      -- Hareket pattern analizi
      SELECT 
        sth_stok_kod,
        COUNT(DISTINCT MONTH(sth_tarih)) as hareket_olan_ay_sayisi,
        COUNT(DISTINCT 
          CASE WHEN sth_tip = 1 
          THEN CAST(YEAR(sth_tarih) AS VARCHAR) + '-' + CAST(MONTH(sth_tarih) AS VARCHAR) 
          END
        ) as satis_olan_ay_sayisi
      FROM STOK_HAREKETLERI
      WHERE sth_tarih BETWEEN @baslangicTarih AND @bitisTarih
        AND sth_normal_iade = 0
        AND sth_tip = 1  -- Sadece satışlar
      GROUP BY sth_stok_kod
    ),
    
    UrunTipiAnaliz AS (
      SELECT 
        h.sth_stok_kod,
        h.hareket_gun_sayisi,
        h.toplam_hareket_sayisi,
        h.giris_hareket_sayisi,
        h.cikis_hareket_sayisi,
        h.toplam_giris,
        h.toplam_cikis,
        h.aktif_gun_sayisi,
        h.son_hareket_tarihi,
        ISNULL(p.hareket_olan_ay_sayisi, 0) as hareket_olan_ay_sayisi,
        ISNULL(p.satis_olan_ay_sayisi, 0) as satis_olan_ay_sayisi,
        
        -- Urun tipi belirleme mantigi
        CASE 
          -- Talep Bazli / Proje Urunu: Az sayida buyuk miktarli hareket
          WHEN h.cikis_hareket_sayisi <= 3 
            AND h.toplam_cikis > 0
            AND (h.max_cikis_miktari = h.min_cikis_miktari OR h.cikis_hareket_sayisi = 1)
            AND ISNULL(p.satis_olan_ay_sayisi, 0) <= 2
          THEN 'Talep Bazli'
          
          -- Ozel Siparis: Giris ve cikislar esit ve az sayida
          WHEN h.giris_hareket_sayisi <= 3 
            AND h.cikis_hareket_sayisi <= 3
            AND ABS(h.toplam_giris - h.toplam_cikis) < (h.toplam_giris * 0.1)
            AND h.toplam_cikis > 0
          THEN 'Ozel Siparis'
          
          -- Duzensiz: Hareket var ama duzensiz
          WHEN ISNULL(p.satis_olan_ay_sayisi, 0) < 3 
            AND h.toplam_cikis > 0
            AND h.aktif_gun_sayisi > 30
          THEN 'Duzensiz Satis'
          
          -- Yeni Urun: Ilk hareketi son 60 gunde
          WHEN DATEDIFF(DAY, h.ilk_hareket_tarihi, GETDATE()) <= 60
          THEN 'Yeni Urun'
          
          -- Sezonluk: Belirli aylarda yogunlasmis
          WHEN ISNULL(p.satis_olan_ay_sayisi, 0) BETWEEN 2 AND 4
            AND h.toplam_cikis > 0
          THEN 'Sezonluk'
          
          -- Duzenli: Cogu ay hareket var
          WHEN ISNULL(p.satis_olan_ay_sayisi, 0) >= 5
          THEN 'Duzenli'
          
          -- Durgun/Olu: Cok az veya hic hareket yok
          WHEN h.toplam_cikis = 0 OR h.toplam_cikis IS NULL
          THEN 'Olu Stok'
          
          ELSE 'Belirsiz'
        END as urun_tipi,
        
        -- Duzeltilmis aylik ortalama hesabi
        CASE 
          -- Talep bazli urunler icin ozel hesaplama
          WHEN h.cikis_hareket_sayisi <= 3 AND h.toplam_cikis > 0
          THEN NULL -- Aylik ortalama anlamsiz
          
          -- Normal urunler icin standart hesaplama
          WHEN ISNULL(p.satis_olan_ay_sayisi, 0) > 0
          THEN h.toplam_cikis / CAST(p.satis_olan_ay_sayisi AS FLOAT)
          
          ELSE 0
        END as duzeltilmis_aylik_ortalama,
        
        -- Onerilen siparis mantigi
        CASE 
          -- Talep bazli: Siparis onerme
          WHEN h.cikis_hareket_sayisi <= 3 
            AND h.toplam_cikis > 0
            AND ISNULL(p.satis_olan_ay_sayisi, 0) <= 2
          THEN 'Talep geldiginde tedarik'
          
          -- Stok varsa ve hareket yoksa: Stok eritilmeli
          WHEN h.toplam_cikis = 0 OR DATEDIFF(DAY, h.son_hareket_tarihi, GETDATE()) > 90
          THEN 'Stok eritilmeli'
          
          -- Normal siparis onerisi
          ELSE 'Normal degerlendirme'
        END as siparis_stratejisi
        
      FROM HareketOzet h
      LEFT JOIN HareketPattern p ON h.sth_stok_kod = p.sth_stok_kod
    )
  `;
}

/**
 * Gelişmiş hareket durumu hesaplama
 * Ürün tipine göre özelleştirilmiş hareket durumu döndürür
 */
export function getEnhancedMovementStatus(): string {
  return `
    CASE 
      WHEN urun_tipi IN ('Talep Bazli', 'Ozel Siparis') THEN 'Ozel'
      WHEN urun_tipi = 'Duzensiz Satis' THEN 'Duzensiz'
      WHEN DATEDIFF(DAY, son_hareket_tarihi, GETDATE()) <= 30 THEN 'Aktif'
      WHEN DATEDIFF(DAY, son_hareket_tarihi, GETDATE()) <= 60 THEN 'Yavas'
      WHEN DATEDIFF(DAY, son_hareket_tarihi, GETDATE()) <= 90 THEN 'Durgun'
      ELSE 'Olu Stok'
    END
  `;
}

/**
 * Gelişmiş sipariş önerisi hesaplama
 * Ürün tipine göre özelleştirilmiş sipariş önerisi
 */
export function getEnhancedOrderSuggestion(): string {
  return `
    CASE 
      -- Talep bazli ve ozel siparis urunleri icin oneri yok
      WHEN urun_tipi IN ('Talep Bazli', 'Ozel Siparis') THEN 0
      
      -- Stok bitmis ve duzenli urun ise 2 aylik stok oner
      WHEN kalan_miktar <= 0 
        AND duzeltilmis_aylik_ortalama > 0 
        AND urun_tipi = 'Duzenli'
      THEN duzeltilmis_aylik_ortalama * 2
      
      -- Stok azalmis ve duzenli urun ise eksik miktari tamamla
      WHEN kalan_miktar < duzeltilmis_aylik_ortalama
        AND duzeltilmis_aylik_ortalama > 0
        AND urun_tipi = 'Duzenli'
      THEN (duzeltilmis_aylik_ortalama * 2) - kalan_miktar
      
      -- Sezonluk urunler icin sezona gore oneri
      WHEN urun_tipi = 'Sezonluk'
        AND kalan_miktar < duzeltilmis_aylik_ortalama
      THEN duzeltilmis_aylik_ortalama * 3 -- Sezon icin 3 aylik stok
      
      -- Diger durumlar
      ELSE 0
    END
  `;
}

/**
 * Ürün tipi açıklama metni
 */
export function getProductTypeDescription(): string {
  return `
    CASE 
      WHEN urun_tipi = 'Talep Bazli' 
      THEN 'Bu urun talep bazli tedarik edilmektedir. Toplam ' + 
           CAST(cikis_hareket_sayisi AS VARCHAR) + ' kez satis yapilmistir.'
      
      WHEN urun_tipi = 'Ozel Siparis'
      THEN 'Ozel siparis urunu. Musteri talebi ile tedarik edilir.'
      
      WHEN urun_tipi = 'Duzensiz Satis'
      THEN 'Duzensiz satis paterni. Son ' + CAST(satis_olan_ay_sayisi AS VARCHAR) + 
           ' ayda satis gerceklesmis.'
      
      WHEN urun_tipi = 'Yeni Urun'
      THEN 'Yeni urun. Ilk hareketi ' + CAST(DATEDIFF(DAY, ilk_hareket_tarihi, GETDATE()) AS VARCHAR) + 
           ' gun once.'
      
      WHEN urun_tipi = 'Sezonluk'
      THEN 'Sezonluk urun. Yilda ' + CAST(satis_olan_ay_sayisi AS VARCHAR) + 
           ' ay satis goruyor.'
      
      WHEN urun_tipi = 'Duzenli'
      THEN 'Duzenli satis. Aylik ortalama ' + CAST(CAST(duzeltilmis_aylik_ortalama AS DECIMAL(10,2)) AS VARCHAR) + 
           ' adet.'
      
      WHEN urun_tipi = 'Olu Stok'
      THEN 'Olu stok. ' + 
           CASE 
             WHEN son_hareket_tarihi IS NOT NULL 
             THEN CAST(DATEDIFF(DAY, son_hareket_tarihi, GETDATE()) AS VARCHAR) + ' gundur hareket yok.'
             ELSE 'Hic hareket yok.'
           END
      
      ELSE 'Belirsiz urun tipi.'
    END
  `;
}

/**
 * Test sorgusu - 121136 kodlu ürün için
 */
export function getProductTypeTestQuery(): string {
  return `
    WITH ${getProductTypeDetectionCTE()}
    
    SELECT 
      s.sto_kod,
      s.sto_isim,
      s.sto_anagrup_kod,
      s.sto_altgrup_kod,
      
      -- Hareket verileri
      ISNULL(u.toplam_giris, 0) as giris_miktari,
      ISNULL(u.toplam_cikis, 0) as cikis_miktari,
      ISNULL(u.toplam_giris, 0) - ISNULL(u.toplam_cikis, 0) as kalan_miktar,
      
      -- Hareket analizi
      ISNULL(u.hareket_gun_sayisi, 0) as hareket_gun_sayisi,
      ISNULL(u.giris_hareket_sayisi, 0) as giris_islem_sayisi,
      ISNULL(u.cikis_hareket_sayisi, 0) as cikis_islem_sayisi,
      ISNULL(u.satis_olan_ay_sayisi, 0) as satis_olan_ay_sayisi,
      
      -- Urun tipi ve strateji
      ISNULL(u.urun_tipi, 'Hareketsiz') as urun_tipi,
      u.siparis_stratejisi,
      u.duzeltilmis_aylik_ortalama,
      
      -- Hareket durumu
      ${getEnhancedMovementStatus()} as hareket_durumu,
      
      -- Onerilen siparis
      ${getEnhancedOrderSuggestion()} as onerilen_siparis,
      
      -- Aciklama
      ${getProductTypeDescription()} as aciklama,
      
      u.son_hareket_tarihi,
      DATEDIFF(DAY, u.son_hareket_tarihi, GETDATE()) as gun_farki
      
    FROM STOKLAR s
    LEFT JOIN UrunTipiAnaliz u ON s.sto_kod = u.sth_stok_kod
    WHERE s.sto_kod = '121136'
  `;
}