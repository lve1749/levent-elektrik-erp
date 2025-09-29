import React from 'react'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

export const helpContents: { [key: string]: JSX.Element } = {
  'getting-started': (
    <div className="space-y-4">
      <p className="text-[14px] text-[oklch(0.40_0.00_0)] dark:text-[oklch(0.72_0.00_0)]">
        Stok Yönetim ve Analiz Sistemi, işletmenizin stok hareketlerini takip etmenizi ve analiz etmenizi sağlayan kapsamlı bir yönetim aracıdır. Bu sistem, özellikle kablo ve elektrik malzemeleri sektörü için özel olarak tasarlanmıştır.
      </p>
      
      <div>
        <h3 className="text-[14px] font-medium text-[oklch(0.27_0.00_0)] dark:text-[oklch(0.92_0.00_0)] mb-2">Neler Yapabilirsiniz?</h3>
        <p className="text-[14px] text-[oklch(0.40_0.00_0)] dark:text-[oklch(0.72_0.00_0)]">
          Bu sistem ile stok hareketlerinizi detaylı olarak takip edebilir, kritik stok seviyelerini anında görebilir ve stoklarınız hakkında detaylı analizler yapabilirsiniz.
        </p>
        <p className="text-[14px] text-[oklch(0.40_0.00_0)] dark:text-[oklch(0.72_0.00_0)] mt-2">
          Sistem, Mikro ERP veritabanınızla entegre çalışarak gerçek zamanlı veriler sunar. Tüm analizler ve raporlamalar güncel verileriniz üzerinden yapılır.
        </p>
      </div>
      
      <div>
        <h3 className="text-[14px] font-medium text-[oklch(0.27_0.00_0)] dark:text-[oklch(0.92_0.00_0)] mb-2">Hızlı Başlangıç</h3>
        <p className="text-[14px] text-[oklch(0.40_0.00_0)] dark:text-[oklch(0.72_0.00_0)] mb-2">
          Sistemi kullanmaya başlamak için:
        </p>
        <ol className="list-decimal list-inside space-y-1 ml-4 text-[14px] text-[oklch(0.40_0.00_0)] dark:text-[oklch(0.72_0.00_0)]">
          <li>Stok Analiz sayfasına girin,</li>
          <li>Ana ekrandan tarih aralığını seçin,</li>
          <li>Analiz etmek istediğiniz Ana Grup'u seçin,</li>
          <li>Analiz Et butonuna tıklayın,</li>
          <li>Verileriniz yüklendikten sonra tabloda stoklarınızı inceleyebilirsiniz.</li>
        </ol>
      </div>
      
      <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
        <p className="text-[13px] text-green-700 dark:text-green-400">
          <strong>İpucu:</strong> Yardım menüsündeki diğer bölümlerden detaylı kullanım bilgilerine ulaşabilirsiniz.
        </p>
      </div>
    </div>
  ),
  'first-login': (
    <div className="space-y-4">
      <div>
        <h3 className="text-[14px] font-medium text-[oklch(0.27_0.00_0)] dark:text-[oklch(0.92_0.00_0)] mb-2">Giriş Bilgileri</h3>
        <p className="text-[14px] text-[oklch(0.40_0.00_0)] dark:text-[oklch(0.72_0.00_0)]">
          Stok Yönetim ve Analiz Sistemi'ne giriş yapmak için Mikro ERP programında kullandığınız mevcut kullanıcı adı ve şifrenizi kullanmanız yeterlidir.
        </p>
      </div>

      <div>
        <h3 className="text-[14px] font-medium text-[oklch(0.27_0.00_0)] dark:text-[oklch(0.92_0.00_0)] mb-2">Nasıl Giriş Yapılır?</h3>
        <ol className="list-decimal list-inside space-y-1 ml-4 text-[14px] text-[oklch(0.40_0.00_0)] dark:text-[oklch(0.72_0.00_0)]">
          <li>Giriş ekranında Kullanıcı Adı alanına Mikro ERP kullanıcı adınızı girin</li>
          <li>Şifre alanına Mikro ERP şifrenizi girin</li>
          <li>Giriş Yap butonuna tıklayın</li>
        </ol>
      </div>

      <div>
        <h3 className="text-[14px] font-medium text-[oklch(0.27_0.00_0)] dark:text-[oklch(0.92_0.00_0)] mb-2">Giriş Yapamıyorsanız</h3>
        <p className="text-[14px] text-[oklch(0.40_0.00_0)] dark:text-[oklch(0.72_0.00_0)] mb-2">
          Eğer giriş yaparken sorun yaşıyorsanız:
        </p>
        <ul className="list-disc list-inside space-y-1 ml-4 text-[14px] text-[oklch(0.40_0.00_0)] dark:text-[oklch(0.72_0.00_0)]">
          <li>Kullanıcı adı ve şifrenizi Mikro ERP'de test edin</li>
          <li>Büyük/küçük harf duyarlılığına dikkat edin</li>
          <li>Mikro ERP'ye erişiminizin olduğundan emin olun</li>
        </ul>
      </div>

      <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
        <h3 className="text-[14px] font-medium text-blue-700 dark:text-blue-400 mb-2">Önemli Bilgiler</h3>
        <ul className="list-disc list-inside space-y-1 ml-4 text-[13px] text-blue-700 dark:text-blue-400">
          <li>Sistem, Mikro ERP ile tam entegre çalışmaktadır</li>
          <li>Ek bir kayıt veya şifre oluşturmanıza gerek yoktur</li>
          <li>Mikro ERP'deki yetki ve kısıtlamalarınız bu sistemde de geçerlidir</li>
          <li>Giriş bilgileriniz doğrudan Mikro veritabanından kontrol edilir</li>
        </ul>
      </div>
    </div>
  ),
  'profile-settings': (
    <div className="space-y-3 text-[14px] text-[oklch(0.40_0.00_0)] dark:text-[oklch(0.72_0.00_0)]">
        <p>Profil ayarlarınıza erişmek için:</p>
        <ol className="list-decimal list-inside space-y-2 ml-4">
          <li>Sol alttaki profil resminize tıklayın</li>
          <li>Açılan menüden "Ayarlar" seçeneğini seçin</li>
          <li>Profil bilgilerinizi güncelleyebilirsiniz</li>
        </ol>
        <div className="mt-4 space-y-2">
          <h3 className="font-medium text-[oklch(0.27_0.00_0)] dark:text-[oklch(0.92_0.00_0)]">Düzenleyebileceğiniz Bilgiler:</h3>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>Ad Soyad</li>
            <li>E-posta adresi</li>
            <li>Telefon numarası</li>
            <li>Profil fotoğrafı</li>
            <li>Bildirim tercihleri</li>
          </ul>
        </div>
    </div>
  ),
  'theme-change': (
    <div className="space-y-4">
      <div>
        <h3 className="text-[14px] font-medium text-[oklch(0.27_0.00_0)] dark:text-[oklch(0.92_0.00_0)] mb-2">Görünüm Modları</h3>
        <p className="text-[14px] text-[oklch(0.40_0.00_0)] dark:text-[oklch(0.72_0.00_0)] mb-2">
          Sistem, göz yorgunluğunu azaltmak ve kullanım konforunu artırmak için iki farklı tema seçeneği sunar:
        </p>
        <ul className="list-disc list-inside space-y-1 ml-4 text-[14px] text-[oklch(0.40_0.00_0)] dark:text-[oklch(0.72_0.00_0)]">
          <li><strong>Açık Tema (Light Mode):</strong> Gündüz kullanımı ve aydınlık ortamlar için ideal</li>
          <li><strong>Koyu Tema (Dark Mode):</strong> Gece kullanımı ve loş ortamlar için göz yormayan tasarım</li>
        </ul>
      </div>

      <div>
        <h3 className="text-[14px] font-medium text-[oklch(0.27_0.00_0)] dark:text-[oklch(0.92_0.00_0)] mb-2">Tema Nasıl Değiştirilir?</h3>
        
        <div className="space-y-3 ml-4">
          <div>
            <p className="text-[13px] font-medium text-[oklch(0.27_0.00_0)] dark:text-[oklch(0.92_0.00_0)] mb-1">Header Menüsünden:</p>
            <ul className="list-disc list-inside space-y-1 ml-2 text-[14px] text-[oklch(0.40_0.00_0)] dark:text-[oklch(0.72_0.00_0)]">
              <li>Sağ üst köşedeki tema değiştirme ikonuna tıklayın</li>
              <li>Güneş ikonu açık tema, ay ikonu koyu tema içindir</li>
            </ul>
          </div>
          
          <div>
            <p className="text-[13px] font-medium text-[oklch(0.27_0.00_0)] dark:text-[oklch(0.92_0.00_0)] mb-1">Komut Paleti ile:</p>
            <ul className="list-disc list-inside space-y-1 ml-2 text-[14px] text-[oklch(0.40_0.00_0)] dark:text-[oklch(0.72_0.00_0)]">
              <li>Komut paletini açın <kbd className="ml-1 px-2 py-0.5 text-xs bg-[oklch(0.92_0.00_0)] dark:bg-[oklch(0.27_0.00_0)] rounded">Ctrl+K</kbd></li>
              <li>"tema" yazın</li>
              <li>İstediğiniz temayı seçin</li>
            </ul>
          </div>
          
          <div>
            <p className="text-[13px] font-medium text-[oklch(0.27_0.00_0)] dark:text-[oklch(0.92_0.00_0)] mb-1">Klavye Kısayolu:</p>
            <ul className="list-disc list-inside space-y-1 ml-2 text-[14px] text-[oklch(0.40_0.00_0)] dark:text-[oklch(0.72_0.00_0)]">
              <li><kbd className="mr-1 px-2 py-0.5 text-xs bg-[oklch(0.92_0.00_0)] dark:bg-[oklch(0.27_0.00_0)] rounded">Alt+Shift+T</kbd> tuş kombinasyonu ile temalar arasında hızlıca geçiş yapın</li>
            </ul>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-[14px] font-medium text-[oklch(0.27_0.00_0)] dark:text-[oklch(0.92_0.00_0)] mb-2">Tema Özellikleri</h3>
        
        <div className="space-y-3">
          <div className="p-3 bg-[oklch(0.99_0.00_0)] dark:bg-[oklch(0.14_0.00_0)] border border-[oklch(0.92_0.00_0)] dark:border-[oklch(0.27_0.00_0)] rounded-lg">
            <p className="text-[13px] font-medium text-[oklch(0.27_0.00_0)] dark:text-[oklch(0.92_0.00_0)] mb-1">Açık Tema:</p>
            <ul className="list-disc list-inside space-y-1 ml-2 text-[13px] text-[oklch(0.40_0.00_0)] dark:text-[oklch(0.72_0.00_0)]">
              <li>Beyaz arka plan</li>
              <li>Yüksek kontrast</li>
              <li>Yazdırma için optimize edilmiş</li>
              <li>Gündüz çalışma ortamlarına uygun</li>
            </ul>
          </div>
          
          <div className="p-3 bg-[oklch(0.99_0.00_0)] dark:bg-[oklch(0.14_0.00_0)] border border-[oklch(0.92_0.00_0)] dark:border-[oklch(0.27_0.00_0)] rounded-lg">
            <p className="text-[13px] font-medium text-[oklch(0.27_0.00_0)] dark:text-[oklch(0.92_0.00_0)] mb-1">Koyu Tema:</p>
            <ul className="list-disc list-inside space-y-1 ml-2 text-[13px] text-[oklch(0.40_0.00_0)] dark:text-[oklch(0.72_0.00_0)]">
              <li>Koyu gri/siyah arka plan</li>
              <li>Göz yorgunluğunu azaltan renkler</li>
              <li>Düşük ışıklı ortamlarda konforlu kullanım</li>
              <li>Enerji tasarrufu (OLED ekranlarda)</li>
            </ul>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-[14px] font-medium text-[oklch(0.27_0.00_0)] dark:text-[oklch(0.92_0.00_0)] mb-2">Sistem Uyumu</h3>
        <p className="text-[14px] text-[oklch(0.40_0.00_0)] dark:text-[oklch(0.72_0.00_0)] mb-2">
          Tema değişikliği sistemin tüm modüllerini kapsar:
        </p>
        <ul className="list-disc list-inside space-y-1 ml-4 text-[14px] text-[oklch(0.40_0.00_0)] dark:text-[oklch(0.72_0.00_0)]">
          <li>Ana ekran ve tablolar</li>
          <li>Grafikler ve raporlar</li>
          <li>Pop-up ve dialog pencereleri</li>
          <li>Form alanları ve butonlar</li>
        </ul>
      </div>

      <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
        <p className="text-[13px] text-green-700 dark:text-green-400">
          <strong>Not:</strong> Tema tercihiniz otomatik olarak kaydedilir ve bir sonraki girişinizde hatırlanır.
        </p>
      </div>
    </div>
  ),
  'basic-navigation': (
    <div className="space-y-4">
      <div>
        <h3 className="text-[14px] font-medium text-[oklch(0.27_0.00_0)] dark:text-[oklch(0.92_0.00_0)] mb-2">Komut Paleti (Command Palette)</h3>
        <p className="text-[14px] text-[oklch(0.40_0.00_0)] dark:text-[oklch(0.72_0.00_0)]">
          Sistemin en güçlü navigasyon özelliği olan Komut Paleti, header bölümünde yer alır ve tüm sistem özelliklerine hızlıca erişmenizi sağlar.
        </p>
      </div>

      <div>
        <h3 className="text-[14px] font-medium text-[oklch(0.27_0.00_0)] dark:text-[oklch(0.92_0.00_0)] mb-2">Nasıl Kullanılır?</h3>
        
        <div className="space-y-3 ml-4">
          <div>
            <p className="text-[13px] font-medium text-[oklch(0.27_0.00_0)] dark:text-[oklch(0.92_0.00_0)] mb-1">Açma Yöntemi:</p>
            <ul className="list-disc list-inside space-y-1 ml-2 text-[14px] text-[oklch(0.40_0.00_0)] dark:text-[oklch(0.72_0.00_0)]">
              <li>Header'daki arama kutusuna tıklayın</li>
              <li>Veya klavyeden Ctrl+K (Mac: Cmd+K) kısayolunu kullanın</li>
            </ul>
          </div>
          
          <div>
            <p className="text-[13px] font-medium text-[oklch(0.27_0.00_0)] dark:text-[oklch(0.92_0.00_0)] mb-1">Arama Yapma:</p>
            <ul className="list-disc list-inside space-y-1 ml-2 text-[14px] text-[oklch(0.40_0.00_0)] dark:text-[oklch(0.72_0.00_0)]">
              <li>Açılan pencerede yazmaya başlayın</li>
              <li>Sistem otomatik olarak eşleşen komutları ve sayfaları listeleyecektir</li>
              <li>Türkçe karakterlere duyarlıdır</li>
            </ul>
          </div>
          
          <div>
            <p className="text-[13px] font-medium text-[oklch(0.27_0.00_0)] dark:text-[oklch(0.92_0.00_0)] mb-1">Hızlı Erişim:</p>
            <ul className="list-disc list-inside space-y-1 ml-2 text-[14px] text-[oklch(0.40_0.00_0)] dark:text-[oklch(0.72_0.00_0)]">
              <li>Enter tuşu ile seçili öğeye gidin</li>
              <li>ESC tuşu ile pencereyi kapatın</li>
            </ul>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-[14px] font-medium text-[oklch(0.27_0.00_0)] dark:text-[oklch(0.92_0.00_0)] mb-2">Örnek Kullanımlar</h3>
        
        <div className="space-y-3 ml-4">
          <div>
            <p className="text-[13px] font-medium text-[oklch(0.27_0.00_0)] dark:text-[oklch(0.92_0.00_0)] mb-1">Sayfa Navigasyonu:</p>
            <ul className="list-disc list-inside space-y-1 ml-2 text-[14px] text-[oklch(0.40_0.00_0)] dark:text-[oklch(0.72_0.00_0)]">
              <li>"stok" yazarak &gt; Stok Analizi sayfasına git</li>
              <li>"sipariş" yazarak &gt; Siparişler sayfasına git</li>
              <li>"yardım" yazarak &gt; Yardım sayfasına git</li>
            </ul>
          </div>
          
          <div>
            <p className="text-[13px] font-medium text-[oklch(0.27_0.00_0)] dark:text-[oklch(0.92_0.00_0)] mb-1">Hızlı İşlemler:</p>
            <ul className="list-disc list-inside space-y-1 ml-2 text-[14px] text-[oklch(0.40_0.00_0)] dark:text-[oklch(0.72_0.00_0)]">
              <li>"klasör ekle" &gt; Direkt klasör oluşturma sayfasına git</li>
              <li>"yeni sipariş" &gt; Sipariş oluşturma formuna git</li>
              <li>"tahsilat" &gt; Tahsilat sayfasına git</li>
            </ul>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-[14px] font-medium text-[oklch(0.27_0.00_0)] dark:text-[oklch(0.92_0.00_0)] mb-2">Klavye Kısayolları</h3>
        <p className="text-[14px] text-[oklch(0.40_0.00_0)] dark:text-[oklch(0.72_0.00_0)] mb-3">
          Sistemde kullanabileceğiniz klavye kısayolları:
        </p>
        
        <div className="space-y-3">
          <div className="p-3 bg-[oklch(0.99_0.00_0)] dark:bg-[oklch(0.14_0.00_0)] border border-[oklch(0.92_0.00_0)] dark:border-[oklch(0.27_0.00_0)] rounded-lg">
            <p className="text-[13px] font-medium text-[oklch(0.27_0.00_0)] dark:text-[oklch(0.92_0.00_0)] mb-2">Navigasyon</p>
            <div className="space-y-1 text-[13px] text-[oklch(0.40_0.00_0)] dark:text-[oklch(0.72_0.00_0)]">
              <div className="flex items-center gap-2">
                <kbd className="px-2 py-0.5 text-xs bg-[oklch(0.92_0.00_0)] dark:bg-[oklch(0.27_0.00_0)] rounded min-w-[50px] text-center">Alt+D</kbd>
                <span>Stok Analiz sayfasına git</span>
              </div>
              <div className="flex items-center gap-2">
                <kbd className="px-2 py-0.5 text-xs bg-[oklch(0.92_0.00_0)] dark:bg-[oklch(0.27_0.00_0)] rounded min-w-[50px] text-center">Alt+L</kbd>
                <span>Listelere git</span>
              </div>
              <div className="flex items-center gap-2">
                <kbd className="px-2 py-0.5 text-xs bg-[oklch(0.92_0.00_0)] dark:bg-[oklch(0.27_0.00_0)] rounded min-w-[50px] text-center">Alt+A</kbd>
                <span>Arşive git</span>
              </div>
              <div className="flex items-center gap-2">
                <kbd className="px-2 py-0.5 text-xs bg-[oklch(0.92_0.00_0)] dark:bg-[oklch(0.27_0.00_0)] rounded min-w-[50px] text-center">Alt+S</kbd>
                <span>Siparişlere git</span>
              </div>
            </div>
          </div>
          
          <div className="p-3 bg-[oklch(0.99_0.00_0)] dark:bg-[oklch(0.14_0.00_0)] border border-[oklch(0.92_0.00_0)] dark:border-[oklch(0.27_0.00_0)] rounded-lg">
            <p className="text-[13px] font-medium text-[oklch(0.27_0.00_0)] dark:text-[oklch(0.92_0.00_0)] mb-2">İşlemler</p>
            <div className="space-y-1 text-[13px] text-[oklch(0.40_0.00_0)] dark:text-[oklch(0.72_0.00_0)]">
              <div className="flex items-center gap-2">
                <kbd className="px-2 py-0.5 text-xs bg-[oklch(0.92_0.00_0)] dark:bg-[oklch(0.27_0.00_0)] rounded min-w-[50px] text-center">Ctrl+N</kbd>
                <span>Yeni öğe ekle</span>
              </div>
              <div className="flex items-center gap-2">
                <kbd className="px-2 py-0.5 text-xs bg-[oklch(0.92_0.00_0)] dark:bg-[oklch(0.27_0.00_0)] rounded min-w-[50px] text-center">Ctrl+E</kbd>
                <span>Düzenle</span>
              </div>
              <div className="flex items-center gap-2">
                <kbd className="px-2 py-0.5 text-xs bg-[oklch(0.92_0.00_0)] dark:bg-[oklch(0.27_0.00_0)] rounded min-w-[50px] text-center">Delete</kbd>
                <span>Sil</span>
              </div>
              <div className="flex items-center gap-2">
                <kbd className="px-2 py-0.5 text-xs bg-[oklch(0.92_0.00_0)] dark:bg-[oklch(0.27_0.00_0)] rounded min-w-[50px] text-center">Ctrl+R</kbd>
                <span>Yenile</span>
              </div>
              <div className="flex items-center gap-2">
                <kbd className="px-2 py-0.5 text-xs bg-[oklch(0.92_0.00_0)] dark:bg-[oklch(0.27_0.00_0)] rounded min-w-[50px] text-center">Ctrl+F</kbd>
                <span>Ara</span>
              </div>
            </div>
          </div>
          
          <div className="p-3 bg-[oklch(0.99_0.00_0)] dark:bg-[oklch(0.14_0.00_0)] border border-[oklch(0.92_0.00_0)] dark:border-[oklch(0.27_0.00_0)] rounded-lg">
            <p className="text-[13px] font-medium text-[oklch(0.27_0.00_0)] dark:text-[oklch(0.92_0.00_0)] mb-2">Görünüm</p>
            <div className="space-y-1 text-[13px] text-[oklch(0.40_0.00_0)] dark:text-[oklch(0.72_0.00_0)]">
              <div className="flex items-center gap-2">
                <kbd className="px-2 py-0.5 text-xs bg-[oklch(0.92_0.00_0)] dark:bg-[oklch(0.27_0.00_0)] rounded min-w-[70px] text-center">Alt+Shift+T</kbd>
                <span>Tema değiştir (Koyu/Açık)</span>
              </div>
              <div className="flex items-center gap-2">
                <kbd className="px-2 py-0.5 text-xs bg-[oklch(0.92_0.00_0)] dark:bg-[oklch(0.27_0.00_0)] rounded min-w-[70px] text-center">Alt+Shift+S</kbd>
                <span>Sidebar aç/kapat</span>
              </div>
            </div>
          </div>
          
          <div className="p-3 bg-[oklch(0.99_0.00_0)] dark:bg-[oklch(0.14_0.00_0)] border border-[oklch(0.92_0.00_0)] dark:border-[oklch(0.27_0.00_0)] rounded-lg">
            <p className="text-[13px] font-medium text-[oklch(0.27_0.00_0)] dark:text-[oklch(0.92_0.00_0)] mb-2">Genel</p>
            <div className="space-y-1 text-[13px] text-[oklch(0.40_0.00_0)] dark:text-[oklch(0.72_0.00_0)]">
              <div className="flex items-center gap-2">
                <kbd className="px-2 py-0.5 text-xs bg-[oklch(0.92_0.00_0)] dark:bg-[oklch(0.27_0.00_0)] rounded min-w-[70px] text-center">Ctrl+K</kbd>
                <span>Komut paleti</span>
              </div>
              <div className="flex items-center gap-2">
                <kbd className="px-2 py-0.5 text-xs bg-[oklch(0.92_0.00_0)] dark:bg-[oklch(0.27_0.00_0)] rounded min-w-[70px] text-center">Ctrl+Shift+E</kbd>
                <span>Excel'e aktar</span>
              </div>
              <div className="flex items-center gap-2">
                <kbd className="px-2 py-0.5 text-xs bg-[oklch(0.92_0.00_0)] dark:bg-[oklch(0.27_0.00_0)] rounded min-w-[70px] text-center">Esc</kbd>
                <span>İptal/Kapat</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  ),
  'stock-analysis': (
    <div className="space-y-4">
      <div>
        <h3 className="text-[14px] font-medium text-[oklch(0.27_0.00_0)] dark:text-[oklch(0.92_0.00_0)] mb-2">Stok Analiz Nedir?</h3>
        <p className="text-[14px] text-[oklch(0.40_0.00_0)] dark:text-[oklch(0.72_0.00_0)]">
          Stok Analiz modülü, işletmenizin stok hareketlerini detaylı olarak incelemenizi ve analiz etmenizi sağlayan güçlü bir araçtır. 
          Mikro ERP veritabanınızdan gerçek zamanlı olarak çekilen verilerle çalışır.
        </p>
      </div>

      <div>
        <h3 className="text-[14px] font-medium text-[oklch(0.27_0.00_0)] dark:text-[oklch(0.92_0.00_0)] mb-2">Analiz Başlatma</h3>
        <ol className="list-decimal list-inside space-y-1 ml-4 text-[14px] text-[oklch(0.40_0.00_0)] dark:text-[oklch(0.72_0.00_0)]">
          <li>Tarih aralığını seçin (varsayılan: yılın tamamı)</li>
          <li>İsteğe bağlı olarak Ana Grup filtresi uygulayın</li>
          <li>Hedef ay sayısını belirleyin (sipariş önerileri için)</li>
          <li>"Analiz Et" butonuna tıklayın</li>
        </ol>
      </div>

      <div>
        <h3 className="text-[14px] font-medium text-[oklch(0.27_0.00_0)] dark:text-[oklch(0.92_0.00_0)] mb-2">Takip Edebileceğiniz Veriler</h3>
        
        <div className="space-y-3">
          <div className="p-3 bg-[oklch(0.99_0.00_0)] dark:bg-[oklch(0.14_0.00_0)] border border-[oklch(0.92_0.00_0)] dark:border-[oklch(0.27_0.00_0)] rounded-lg">
            <p className="text-[13px] font-medium text-[oklch(0.27_0.00_0)] dark:text-[oklch(0.92_0.00_0)] mb-1">Stok Miktarları:</p>
            <ul className="list-disc list-inside space-y-1 ml-2 text-[13px] text-[oklch(0.40_0.00_0)] dark:text-[oklch(0.72_0.00_0)]">
              <li>Giriş ve çıkış miktarları</li>
              <li>Kalan miktar (mevcut stok)</li>
              <li>Verilen ve alınan siparişler</li>
              <li>Stok + Bekleyen sipariş toplamı</li>
            </ul>
          </div>

          <div className="p-3 bg-[oklch(0.99_0.00_0)] dark:bg-[oklch(0.14_0.00_0)] border border-[oklch(0.92_0.00_0)] dark:border-[oklch(0.27_0.00_0)] rounded-lg">
            <p className="text-[13px] font-medium text-[oklch(0.27_0.00_0)] dark:text-[oklch(0.92_0.00_0)] mb-1">Performans Metrikleri:</p>
            <ul className="list-disc list-inside space-y-1 ml-2 text-[13px] text-[oklch(0.40_0.00_0)] dark:text-[oklch(0.72_0.00_0)]">
              <li>Aylık ortalama satış</li>
              <li>Ortalama aylık stok seviyesi</li>
              <li>Devir hızı (stok kaç günde bitiyor)</li>
              <li>Hareket durumu (Aktif/Yavaş/Durgun/Ölü)</li>
            </ul>
          </div>

          <div className="p-3 bg-[oklch(0.99_0.00_0)] dark:bg-[oklch(0.14_0.00_0)] border border-[oklch(0.92_0.00_0)] dark:border-[oklch(0.27_0.00_0)] rounded-lg">
            <p className="text-[13px] font-medium text-[oklch(0.27_0.00_0)] dark:text-[oklch(0.92_0.00_0)] mb-1">Zaman Analizleri:</p>
            <ul className="list-disc list-inside space-y-1 ml-2 text-[13px] text-[oklch(0.40_0.00_0)] dark:text-[oklch(0.72_0.00_0)]">
              <li>Son hareket tarihleri (giriş/çıkış)</li>
              <li>Son 30-60-180-365 gün hareketleri</li>
              <li>Mevsimsellik analizi</li>
              <li>Trend analizi ve tahminleme</li>
            </ul>
          </div>

          <div className="p-3 bg-[oklch(0.99_0.00_0)] dark:bg-[oklch(0.14_0.00_0)] border border-[oklch(0.92_0.00_0)] dark:border-[oklch(0.27_0.00_0)] rounded-lg">
            <p className="text-[13px] font-medium text-[oklch(0.27_0.00_0)] dark:text-[oklch(0.92_0.00_0)] mb-1">Sipariş Yönetimi:</p>
            <ul className="list-disc list-inside space-y-1 ml-2 text-[13px] text-[oklch(0.40_0.00_0)] dark:text-[oklch(0.72_0.00_0)]">
              <li>Otomatik sipariş önerileri</li>
              <li>Eksik miktar hesaplaması</li>
              <li>Hedef ay bazlı planlama</li>
              <li>Kritik stok uyarıları</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  ),
  'table-usage': (
    <div className="space-y-4">
      <div>
        <h3 className="text-[14px] font-medium text-[oklch(0.27_0.00_0)] dark:text-[oklch(0.92_0.00_0)] mb-2">Tablo Özellikleri</h3>
        <p className="text-[14px] text-[oklch(0.40_0.00_0)] dark:text-[oklch(0.72_0.00_0)]">
          Stok analiz tablosu, verilerinizi detaylı görüntülemenizi ve yönetmenizi sağlayan güçlü bir araçtır.
        </p>
      </div>

      <div>
        <h3 className="text-[14px] font-medium text-[oklch(0.27_0.00_0)] dark:text-[oklch(0.92_0.00_0)] mb-2">Temel Özellikler</h3>
        <ul className="list-disc list-inside space-y-1 ml-4 text-[14px] text-[oklch(0.40_0.00_0)] dark:text-[oklch(0.72_0.00_0)]">
          <li><strong>Sıralama:</strong> Kolon başlıklarına tıklayarak artan/azalan sıralama yapabilirsiniz</li>
          <li><strong>Çoklu Seçim:</strong> Checkbox ile birden fazla satır seçebilirsiniz</li>
          <li><strong>Sayfalama:</strong> Alt kısımda sayfa başına gösterilecek kayıt sayısını ayarlayabilirsiniz (10, 25, 50, 100)</li>
          <li><strong>Hızlı Arama:</strong> Tablo içinde arama yaparak istediğiniz kayda ulaşabilirsiniz</li>
        </ul>
      </div>

      <div>
        <h3 className="text-[14px] font-medium text-[oklch(0.27_0.00_0)] dark:text-[oklch(0.92_0.00_0)] mb-2">Tablo Kolonları</h3>
        <p className="text-[14px] text-[oklch(0.40_0.00_0)] dark:text-[oklch(0.72_0.00_0)] mb-2">
          Tabloda 18 farklı kolon bulunur. Her kolon farklı bir veri tipini gösterir:
        </p>
        <div className="space-y-2 ml-4">
          <div className="p-2 bg-[oklch(0.99_0.00_0)] dark:bg-[oklch(0.14_0.00_0)] border border-[oklch(0.92_0.00_0)] dark:border-[oklch(0.27_0.00_0)] rounded-lg">
            <p className="text-[13px] text-[oklch(0.40_0.00_0)] dark:text-[oklch(0.72_0.00_0)]">
              <strong>Tanımlayıcı Bilgiler:</strong> Stok kodu, stok ismi, ana grup, alt grup
            </p>
          </div>
          <div className="p-2 bg-[oklch(0.99_0.00_0)] dark:bg-[oklch(0.14_0.00_0)] border border-[oklch(0.92_0.00_0)] dark:border-[oklch(0.27_0.00_0)] rounded-lg">
            <p className="text-[13px] text-[oklch(0.40_0.00_0)] dark:text-[oklch(0.72_0.00_0)]">
              <strong>Miktar Bilgileri:</strong> Giriş, çıkış, kalan miktar
            </p>
          </div>
          <div className="p-2 bg-[oklch(0.99_0.00_0)] dark:bg-[oklch(0.14_0.00_0)] border border-[oklch(0.92_0.00_0)] dark:border-[oklch(0.27_0.00_0)] rounded-lg">
            <p className="text-[13px] text-[oklch(0.40_0.00_0)] dark:text-[oklch(0.72_0.00_0)]">
              <strong>Sipariş Bilgileri:</strong> Verilen/alınan siparişler, önerilen sipariş
            </p>
          </div>
          <div className="p-2 bg-[oklch(0.99_0.00_0)] dark:bg-[oklch(0.14_0.00_0)] border border-[oklch(0.92_0.00_0)] dark:border-[oklch(0.27_0.00_0)] rounded-lg">
            <p className="text-[13px] text-[oklch(0.40_0.00_0)] dark:text-[oklch(0.72_0.00_0)]">
              <strong>Analiz Verileri:</strong> Aylık ortalamalar, devir hızı, hareket durumu
            </p>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-[14px] font-medium text-[oklch(0.27_0.00_0)] dark:text-[oklch(0.92_0.00_0)] mb-2">Görsel İşaretler</h3>
        <ul className="list-disc list-inside space-y-1 ml-4 text-[14px] text-[oklch(0.40_0.00_0)] dark:text-[oklch(0.72_0.00_0)]">
          <li><strong>Durum Renkleri:</strong> Kritik (kırmızı), düşük (sarı), yeterli (yeşil) stok durumları renklerle gösterilir</li>
          <li><strong>Hareket Durumu Etiketleri:</strong> Aktif, Yavaş, Durgun, Ölü Stok şeklinde etiketlenir</li>
          <li><strong>Mevsimsellik Göstergesi:</strong> Stabil, Mevsimsel, Trend, Düzensiz şeklinde kategorize edilir</li>
        </ul>
      </div>

      <div>
        <h3 className="text-[14px] font-medium text-[oklch(0.27_0.00_0)] dark:text-[oklch(0.92_0.00_0)] mb-2">Performans İpuçları</h3>
        <ul className="list-disc list-inside space-y-1 ml-4 text-[14px] text-[oklch(0.40_0.00_0)] dark:text-[oklch(0.72_0.00_0)]">
          <li>Büyük veri setlerinde sayfalama kullanarak daha hızlı gezinebilirsiniz</li>
          <li>Gereksiz kolonları gizleyerek tablo performansını artırabilirsiniz</li>
          <li>Filtreler kullanarak veri setini daraltabilirsiniz</li>
        </ul>
      </div>

      <div>
        <h3 className="text-[14px] font-medium text-[oklch(0.27_0.00_0)] dark:text-[oklch(0.92_0.00_0)] mb-2">Veri Yenileme</h3>
        <ul className="list-disc list-inside space-y-1 ml-4 text-[14px] text-[oklch(0.40_0.00_0)] dark:text-[oklch(0.72_0.00_0)]">
          <li>Veriler Mikro ERP'den gerçek zamanlı çekilir</li>
          <li>"Analiz Et" butonu ile veriler yeniden yüklenir</li>
          <li>Tarih aralığı değiştirildiğinde otomatik yenileme yapılmaz, manuel tetikleme gerekir</li>
        </ul>
      </div>
    </div>
  ),
  'filter-usage': (
    <div className="space-y-4">
      <div>
        <h3 className="text-[14px] font-medium text-[oklch(0.27_0.00_0)] dark:text-[oklch(0.92_0.00_0)] mb-2">Gelişmiş Filtreleme Sistemi</h3>
        <p className="text-[14px] text-[oklch(0.40_0.00_0)] dark:text-[oklch(0.72_0.00_0)]">
          Stok analiz tablosunda verilerinizi detaylı filtrelerle daraltabilir ve ihtiyacınız olan bilgilere hızlıca ulaşabilirsiniz. Tüm filtreler çoklu seçimi destekler ve birlikte kullanılabilir.
        </p>
      </div>

      <div>
        <h3 className="text-[14px] font-medium text-[oklch(0.27_0.00_0)] dark:text-[oklch(0.92_0.00_0)] mb-2">Mevcut Filtreler</h3>
        
        <div className="space-y-3">
          <div className="p-3 bg-[oklch(0.99_0.00_0)] dark:bg-[oklch(0.14_0.00_0)] border border-[oklch(0.92_0.00_0)] dark:border-[oklch(0.27_0.00_0)] rounded-lg">
            <p className="text-[13px] font-medium text-[oklch(0.27_0.00_0)] dark:text-[oklch(0.92_0.00_0)] mb-1">1. Stok Durumu Filtresi:</p>
            <p className="text-[12px] text-[oklch(0.50_0.00_0)] dark:text-[oklch(0.60_0.00_0)] mb-2">Ortalama aylık stok miktarına göre filtreleme yapar:</p>
            <ul className="list-disc list-inside space-y-1 ml-2 text-[13px] text-[oklch(0.40_0.00_0)] dark:text-[oklch(0.72_0.00_0)]">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 dark:bg-red-400"></span>
                <span><strong>Kritik (0-1 ay):</strong> Ortalama aylık stok ≤ 1 ay olan ürünler</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-orange-500 dark:bg-orange-400"></span>
                <span><strong>Az (1.1-2 ay):</strong> Ortalama aylık stok 1.01 - 2 ay arası olan ürünler</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 dark:bg-green-400"></span>
                <span><strong>Yeterli (2.1+ ay):</strong> Ortalama aylık stok &gt; 2 ay olan ürünler</span>
              </li>
            </ul>
            <p className="text-[12px] text-[oklch(0.50_0.00_0)] dark:text-[oklch(0.60_0.00_0)] mt-2 italic">
              Not: Ortalama aylık stok, kalan miktarın aylık ortalama satışa bölünmesiyle hesaplanır.
            </p>
          </div>

          <div className="p-3 bg-[oklch(0.99_0.00_0)] dark:bg-[oklch(0.14_0.00_0)] border border-[oklch(0.92_0.00_0)] dark:border-[oklch(0.27_0.00_0)] rounded-lg">
            <p className="text-[13px] font-medium text-[oklch(0.27_0.00_0)] dark:text-[oklch(0.92_0.00_0)] mb-1">2. Gelişmiş Miktar Filtresi:</p>
            <p className="text-[12px] text-[oklch(0.50_0.00_0)] dark:text-[oklch(0.60_0.00_0)] mb-2">Kalan miktar aralıklarına göre filtreleme:</p>
            <ul className="list-disc list-inside space-y-1 ml-2 text-[13px] text-[oklch(0.40_0.00_0)] dark:text-[oklch(0.72_0.00_0)]">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 dark:bg-red-400"></span>
                <span><strong>Çok Düşük (0-50):</strong> 0-50 adet arası stok</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-gray-500 dark:bg-gray-400"></span>
                <span><strong>Düşük (50-100):</strong> 50-100 adet arası stok</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 dark:bg-blue-400"></span>
                <span><strong>Orta (100-500):</strong> 100-500 adet arası stok</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 dark:bg-indigo-400"></span>
                <span><strong>Yüksek (500-1.000):</strong> 500-1.000 adet arası stok</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 dark:bg-green-400"></span>
                <span><strong>Çok Yüksek (1.000-5.000):</strong> 1.000-5.000 adet arası stok</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-orange-500 dark:bg-orange-400"></span>
                <span><strong>Aşırı Yüksek (5.000+):</strong> 5.000'den fazla stok</span>
              </li>
            </ul>
          </div>

          <div className="p-3 bg-[oklch(0.99_0.00_0)] dark:bg-[oklch(0.14_0.00_0)] border border-[oklch(0.92_0.00_0)] dark:border-[oklch(0.27_0.00_0)] rounded-lg">
            <p className="text-[13px] font-medium text-[oklch(0.27_0.00_0)] dark:text-[oklch(0.92_0.00_0)] mb-1">3. Hareket Durumu Filtresi:</p>
            <p className="text-[12px] text-[oklch(0.50_0.00_0)] dark:text-[oklch(0.60_0.00_0)] mb-2">Ürünlerin hareket sıklığına göre kategorize eder:</p>
            <ul className="list-disc list-inside space-y-1 ml-2 text-[13px] text-[oklch(0.40_0.00_0)] dark:text-[oklch(0.72_0.00_0)]">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 dark:bg-green-400"></span>
                <span><strong>Aktif:</strong> Son 30 günde en az 3 hareket yapmış düzenli ürünler</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-yellow-500 dark:bg-yellow-400"></span>
                <span><strong>Yavaş:</strong> Son 60 günde en az 2 hareket yapmış ancak düzensiz ürünler</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-orange-500 dark:bg-orange-400"></span>
                <span><strong>Durgun:</strong> Son 180 günde sadece 1-2 hareket görmüş, nadiren satılan ürünler</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 dark:bg-red-400"></span>
                <span><strong>Ölü Stok:</strong> 180 günden uzun süredir hiç satılmamış veya hareket görmemiş ürünler</span>
              </li>
            </ul>
            <p className="text-[12px] text-[oklch(0.50_0.00_0)] dark:text-[oklch(0.60_0.00_0)] mt-2 italic">
              Not: Ölü stoklar kritik risk taşır ve acil tasfiye değerlendirilmelidir.
            </p>
          </div>

          <div className="p-3 bg-[oklch(0.99_0.00_0)] dark:bg-[oklch(0.14_0.00_0)] border border-[oklch(0.92_0.00_0)] dark:border-[oklch(0.27_0.00_0)] rounded-lg">
            <p className="text-[13px] font-medium text-[oklch(0.27_0.00_0)] dark:text-[oklch(0.92_0.00_0)] mb-1">4. Devir Hızı Filtresi:</p>
            <p className="text-[12px] text-[oklch(0.50_0.00_0)] dark:text-[oklch(0.60_0.00_0)] mb-2">Stokun kaç günde tükeneceğine göre filtreleme:</p>
            <ul className="list-disc list-inside space-y-1 ml-2 text-[13px] text-[oklch(0.40_0.00_0)] dark:text-[oklch(0.72_0.00_0)]">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 dark:bg-green-400"></span>
                <span><strong>Hızlı (1-15 gün):</strong> Stok 15 günde veya daha kısa sürede tükeniyor</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 dark:bg-blue-400"></span>
                <span><strong>Normal (16-30 gün):</strong> Stok 16-30 gün arası tükeniyor</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-orange-500 dark:bg-orange-400"></span>
                <span><strong>Yavaş (31-60 gün):</strong> Stok 31-60 gün arası tükeniyor</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 dark:bg-red-400"></span>
                <span><strong>Çok Yavaş (60+ gün):</strong> Stok 60 günden uzun sürede tükeniyor</span>
              </li>
            </ul>
            <p className="text-[12px] text-[oklch(0.50_0.00_0)] dark:text-[oklch(0.60_0.00_0)] mt-2 italic">
              Formül: (Mevcut Stok × 30) / Aylık Satış
            </p>
          </div>

          <div className="p-3 bg-[oklch(0.99_0.00_0)] dark:bg-[oklch(0.14_0.00_0)] border border-[oklch(0.92_0.00_0)] dark:border-[oklch(0.27_0.00_0)] rounded-lg">
            <p className="text-[13px] font-medium text-[oklch(0.27_0.00_0)] dark:text-[oklch(0.92_0.00_0)] mb-1">5. Sipariş Öneri Filtresi:</p>
            <p className="text-[12px] text-[oklch(0.50_0.00_0)] dark:text-[oklch(0.60_0.00_0)] mb-2">Sistem tarafından hesaplanan sipariş önerilerine göre ürünleri filtreler:</p>
            <ul className="list-disc list-inside space-y-1 ml-2 text-[13px] text-[oklch(0.40_0.00_0)] dark:text-[oklch(0.72_0.00_0)]">
              <li><strong className="text-red-600 dark:text-red-400">Acil:</strong> Kritik seviyedeki stoklar - Stok tükenme riski olan, hemen sipariş verilmesi gereken ürünler (Kalan stok &lt; 0.5 ay ve aktif hareket)</li>
              <li><strong className="text-orange-600 dark:text-orange-400">Kritik:</strong> Düşük stok seviyesindeki ürünler - En kısa sürede sipariş verilmesi önerilen ürünler (Kalan stok 0.5-1 ay arası)</li>
              <li><strong className="text-gray-600 dark:text-gray-400">Düşük Öncelik:</strong> Durgun veya yavaş hareket eden ürünler için sipariş önerisi - Minimum güvenlik stoğu seviyesinde tutulabilir</li>
              <li><strong className="text-green-600 dark:text-green-400">Sipariş Verildi:</strong> Tedarikçiye sipariş verilmiş, teslim bekleyen ürünler - Verilen sipariş miktarı yeterli</li>
              <li><strong className="text-yellow-600 dark:text-yellow-400">Kısmi Sipariş:</strong> Tedarikçiye sipariş verilmiş ama yetersiz - Ek sipariş önerisi olan ürünler</li>
              <li><strong className="text-blue-600 dark:text-blue-400">Yeterli Stok:</strong> Mevcut stok ihtiyacı karşılayan ürünler - Hedef stok süresini karşılayan ürünler</li>
              <li><strong className="text-gray-600 dark:text-gray-400">Öneri Yok:</strong> Sipariş önerilmeyen ürünler - Ölü stok, durgun ürün veya özel sipariş ürünleri</li>
            </ul>
            
            <div className="mt-3 p-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md">
              <p className="text-[12px] font-medium text-blue-700 dark:text-blue-400 mb-1">Hesaplama Mantığı:</p>
              <p className="text-[12px] text-blue-600 dark:text-blue-300">
                Sistem, ürünün <strong>hareket durumu</strong>, <strong>devir hızı</strong>, <strong>aylık ortalama satış</strong> ve <strong>mevcut stok</strong> verilerini analiz ederek otomatik sipariş önerisi hesaplar.
              </p>
              <p className="text-[12px] text-blue-600 dark:text-blue-300 mt-1">
                <strong>Formül:</strong> (Hedef Ay × Aylık Satış) - Net Stok = Önerilen Sipariş
              </p>
              <p className="text-[12px] text-blue-500 dark:text-blue-400 mt-1 italic">
                Hedef Ay Hesaplama Mantığı:
              </p>
              <ul className="text-[12px] text-blue-500 dark:text-blue-400 ml-3 mt-1 space-y-0.5">
                <li>Aktif hareket + Hızlı devir (≤15 gün) → 1.5 ay</li>
                <li>Aktif hareket + Normal devir (≤30 gün) → 1.2 ay</li>
                <li>Aktif hareket + Yavaş devir (≤60 gün) → 1.0 ay</li>
                <li>Yavaş hareket → 1.0 ay</li>
                <li>Durgun hareket → 0.5 ay</li>
                <li>Ölü stok → 0 (sipariş önerilmez)</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-[14px] font-medium text-[oklch(0.27_0.00_0)] dark:text-[oklch(0.92_0.00_0)] mb-2">Örnek Kullanım Senaryoları</h3>
        <ul className="list-disc list-inside space-y-1 ml-4 text-[14px] text-[oklch(0.40_0.00_0)] dark:text-[oklch(0.72_0.00_0)]">
          <li><strong>Acil sipariş verilecekler:</strong> Stok Durumu = "Kritik" + Sipariş Öneri = "Öneri Var"</li>
          <li><strong>Ölü stokları tespit:</strong> Hareket Durumu = "Ölü Stok" + Devir Hızı = "Çok Yavaş"</li>
          <li><strong>Hızlı tükenenler:</strong> Miktar = "Çok Düşük" + Devir Hızı = "Hızlı"</li>
          <li><strong>Risk altındaki stoklar:</strong> Hareket Durumu = "Durgun" veya "Ölü Stok"</li>
        </ul>
      </div>

      <div>
        <h3 className="text-[14px] font-medium text-[oklch(0.27_0.00_0)] dark:text-[oklch(0.92_0.00_0)] mb-2">Filtreleme İpuçları</h3>
        <ul className="list-disc list-inside space-y-1 ml-4 text-[14px] text-[oklch(0.40_0.00_0)] dark:text-[oklch(0.72_0.00_0)]">
          <li>Tüm filtreler otomatik olarak uygulanır</li>
          <li>"Temizle" butonu ile filtreyi sıfırlayabilirsiniz</li>
          <li>"Tümünü Seç" ile tüm seçenekleri işaretleyebilirsiniz</li>
          <li>Farklı filtre kombinasyonları kullanarak detaylı analizler yapabilirsiniz</li>
          <li>Uygulanan filtreler tablo altındaki sayaçta görünür</li>
        </ul>
      </div>

      <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
        <p className="text-[13px] text-green-700 dark:text-green-400">
          <strong>Not:</strong> Uygulanan filtreler tablo üzerindeki toplam kayıt sayısını etkiler. Alt kısımdaki sayaçtan filtrelenmiş kayıt sayısını görebilirsiniz.
        </p>
      </div>
    </div>
  ),
  'data-export': (
    <div className="space-y-4">
      <div>
        <h3 className="text-[14px] font-medium text-[oklch(0.27_0.00_0)] dark:text-[oklch(0.92_0.00_0)] mb-2">Veri Dışa Aktarma</h3>
        <p className="text-[14px] text-[oklch(0.40_0.00_0)] dark:text-[oklch(0.72_0.00_0)]">
          Stok analiz verilerinizi Excel formatında dışa aktararak offline analizler yapabilir veya raporlama sistemlerinizde kullanabilirsiniz.
        </p>
      </div>

      <div>
        <h3 className="text-[14px] font-medium text-[oklch(0.27_0.00_0)] dark:text-[oklch(0.92_0.00_0)] mb-2">Excel'e Aktarma</h3>
        <ol className="list-decimal list-inside space-y-1 ml-4 text-[14px] text-[oklch(0.40_0.00_0)] dark:text-[oklch(0.72_0.00_0)]">
          <li>İstediğiniz filtreleri uygulayın</li>
          <li>Sağ üst köşedeki "Excel'e Aktar" butonuna tıklayın</li>
          <li>Veya klavyeden <kbd className="ml-1 px-2 py-0.5 text-xs bg-[oklch(0.92_0.00_0)] dark:bg-[oklch(0.27_0.00_0)] rounded">Ctrl+Shift+E</kbd> kısayolunu kullanın</li>
          <li>Dosya otomatik olarak indirilecektir</li>
        </ol>
      </div>

      <div>
        <h3 className="text-[14px] font-medium text-[oklch(0.27_0.00_0)] dark:text-[oklch(0.92_0.00_0)] mb-2">Aktarılan Veriler</h3>
        <p className="text-[14px] text-[oklch(0.40_0.00_0)] dark:text-[oklch(0.72_0.00_0)] mb-2">
          Excel dosyası aşağıdaki bilgileri içerir:
        </p>
        <ul className="list-disc list-inside space-y-1 ml-4 text-[14px] text-[oklch(0.40_0.00_0)] dark:text-[oklch(0.72_0.00_0)]">
          <li>Sadece görünür kolonlar aktarılır</li>
          <li>Uygulanan filtreler dikkate alınır</li>
          <li>Sıralama düzeni korunur</li>
          <li>Tarih ve saat bilgisi ile kaydedilir</li>
          <li>Otomatik formatlanmış tablo olarak gelir</li>
        </ul>
      </div>

      <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
        <p className="text-[13px] text-blue-700 dark:text-blue-400">
          <strong>Dosya Adı Formatı:</strong> StokAnalizi_YYYYAAGG_HHMMSS.xlsx şeklinde otomatik isimlendirilir.
        </p>
      </div>
    </div>
  ),
  'customize-columns': (
    <div className="space-y-4">
      <div>
        <h3 className="text-[14px] font-medium text-[oklch(0.27_0.00_0)] dark:text-[oklch(0.92_0.00_0)] mb-2">Tablo Kolonları</h3>
        <p className="text-[14px] text-[oklch(0.40_0.00_0)] dark:text-[oklch(0.72_0.00_0)]">
          Stok analiz tablosu, işletmenizin stok hareketlerini detaylı olarak görüntülemenizi sağlayan 18 farklı kolon içerir. 
          Her kolon, stok yönetimi ve analizi için kritik bilgiler sunar. Kolonları ihtiyacınıza göre gösterebilir veya gizleyebilirsiniz.
        </p>
      </div>

      <div>
        <h3 className="text-[14px] font-medium text-[oklch(0.27_0.00_0)] dark:text-[oklch(0.92_0.00_0)] mb-2">Kolon Detayları</h3>
        <p className="text-[14px] text-[oklch(0.40_0.00_0)] dark:text-[oklch(0.72_0.00_0)] mb-3">
          Her kolonun işlevini öğrenmek için aşağıdaki listeden ilgili kolona tıklayın:
        </p>
        
        <div className="px-4 py-4 bg-[oklch(0.99_0.00_0)] dark:bg-[oklch(0.14_0.00_0)] border border-[oklch(0.92_0.00_0)] dark:border-[oklch(0.27_0.00_0)] rounded-lg">
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="stok-kodu" className="border-b-0 relative after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[1px] after:bg-gradient-to-r after:from-[oklch(0.88_0.00_0)] after:to-[oklch(0.97_0.00_0)] dark:after:from-[oklch(0.32_0.00_0)] dark:after:to-[oklch(0.20_0.00_0)] last:after:hidden">
            <AccordionTrigger className="text-[13px] hover:no-underline py-2.5">
              <span className="text-[oklch(0.27_0.00_0)] dark:text-[oklch(0.92_0.00_0)]">1. Stok Kodu</span>
            </AccordionTrigger>
            <AccordionContent className="text-[12px] text-[oklch(0.40_0.00_0)] dark:text-[oklch(0.72_0.00_0)] pb-3">
              Ürünün benzersiz kimlik kodu. Mikro ERP sisteminde tanımlı stok kodudur. Bu kod ile ürünler tekil olarak tanımlanır ve tüm işlemlerde kullanılır.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="stok-ismi" className="border-b-0 relative after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[1px] after:bg-gradient-to-r after:from-[oklch(0.88_0.00_0)] after:to-[oklch(0.97_0.00_0)] dark:after:from-[oklch(0.32_0.00_0)] dark:after:to-[oklch(0.20_0.00_0)] last:after:hidden">
            <AccordionTrigger className="text-[13px] hover:no-underline py-2.5">
              <span className="text-[oklch(0.27_0.00_0)] dark:text-[oklch(0.92_0.00_0)]">2. Stok İsmi</span>
            </AccordionTrigger>
            <AccordionContent className="text-[12px] text-[oklch(0.40_0.00_0)] dark:text-[oklch(0.72_0.00_0)] pb-3">
              Ürünün açıklayıcı adı. Stok koduna karşılık gelen ürün tanımıdır. Genellikle ürünün markası, modeli ve özelliklerini içerir.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="ana-grup" className="border-b-0 relative after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[1px] after:bg-gradient-to-r after:from-[oklch(0.88_0.00_0)] after:to-[oklch(0.97_0.00_0)] dark:after:from-[oklch(0.32_0.00_0)] dark:after:to-[oklch(0.20_0.00_0)] last:after:hidden">
            <AccordionTrigger className="text-[13px] hover:no-underline py-2.5">
              <span className="text-[oklch(0.27_0.00_0)] dark:text-[oklch(0.92_0.00_0)]">3. Ana Grup</span>
            </AccordionTrigger>
            <AccordionContent className="text-[12px] text-[oklch(0.40_0.00_0)] dark:text-[oklch(0.72_0.00_0)] pb-3">
              Ürünün dahil olduğu ana kategori. Örneğin: Kablolar, Anahtarlar, Prizler gibi üst düzey ürün gruplarını gösterir.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="alt-grup" className="border-b-0 relative after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[1px] after:bg-gradient-to-r after:from-[oklch(0.88_0.00_0)] after:to-[oklch(0.97_0.00_0)] dark:after:from-[oklch(0.32_0.00_0)] dark:after:to-[oklch(0.20_0.00_0)] last:after:hidden">
            <AccordionTrigger className="text-[13px] hover:no-underline py-2.5">
              <span className="text-[oklch(0.27_0.00_0)] dark:text-[oklch(0.92_0.00_0)]">4. Alt Grup</span>
            </AccordionTrigger>
            <AccordionContent className="text-[12px] text-[oklch(0.40_0.00_0)] dark:text-[oklch(0.72_0.00_0)] pb-3">
              Ana grubun altındaki detaylı kategori. Örneğin: NYY Kablo, NHXMH Kablo gibi daha spesifik ürün gruplarını gösterir.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="depo" className="border-b-0 relative after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[1px] after:bg-gradient-to-r after:from-[oklch(0.88_0.00_0)] after:to-[oklch(0.97_0.00_0)] dark:after:from-[oklch(0.32_0.00_0)] dark:after:to-[oklch(0.20_0.00_0)] last:after:hidden">
            <AccordionTrigger className="text-[13px] hover:no-underline py-2.5">
              <span className="text-[oklch(0.27_0.00_0)] dark:text-[oklch(0.92_0.00_0)]">5. Depo</span>
            </AccordionTrigger>
            <AccordionContent className="text-[12px] text-[oklch(0.40_0.00_0)] dark:text-[oklch(0.72_0.00_0)] pb-3">
              Ürünün bulunduğu depo lokasyonu. Birden fazla depo kullanıyorsanız, hangi depoda ne kadar stok olduğunu gösterir. Varsayılan olarak gizlidir.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="giris-miktari" className="border-b-0 relative after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[1px] after:bg-gradient-to-r after:from-[oklch(0.88_0.00_0)] after:to-[oklch(0.97_0.00_0)] dark:after:from-[oklch(0.32_0.00_0)] dark:after:to-[oklch(0.20_0.00_0)] last:after:hidden">
            <AccordionTrigger className="text-[13px] hover:no-underline py-2.5">
              <span className="text-[oklch(0.27_0.00_0)] dark:text-[oklch(0.92_0.00_0)]">6. Giriş Miktarı</span>
            </AccordionTrigger>
            <AccordionContent className="text-[12px] text-[oklch(0.40_0.00_0)] dark:text-[oklch(0.72_0.00_0)] pb-3">
              <div className="space-y-2">
                <p>Seçilen tarih aralığında depoya giren toplam ürün miktarı. Alımlar, iadeler ve transferler dahildir.</p>
                <div className="p-2 bg-[oklch(0.97_0.00_0)] dark:bg-[oklch(0.18_0.00_0)] border border-[oklch(0.92_0.00_0)] dark:border-[oklch(0.27_0.00_0)] rounded-lg">
                  <p className="font-mono text-[11px] mb-1 text-[oklch(0.27_0.00_0)] dark:text-[oklch(0.92_0.00_0)]">SQL Formülü:</p>
                  <code className="text-[11px] text-[oklch(0.40_0.00_0)] dark:text-[oklch(0.72_0.00_0)] block">
                    SUM(CASE<br/>
                    &nbsp;&nbsp;-- Normal girişler<br/>
                    &nbsp;&nbsp;WHEN sth_tip = 0 AND sth_cins != 9 AND ISNULL(sth_normal_iade, 0) = 0<br/>
                    &nbsp;&nbsp;THEN sth_miktar<br/>
                    &nbsp;&nbsp;-- Satın alma iadeleri (girişlerden düşülür)<br/>
                    &nbsp;&nbsp;WHEN sth_tip = 1 AND sth_cins = 0 AND sth_normal_iade = 1<br/>
                    &nbsp;&nbsp;THEN -sth_miktar<br/>
                    &nbsp;&nbsp;ELSE 0<br/>
                    END)
                  </code>
                </div>
                <div className="text-[11px] space-y-1">
                  <p><strong>İade Mantığı:</strong> Satın alma iadeleri negatif değer olarak girişlerden düşülür.</p>
                  <p><strong>Hariç Tutulan:</strong> Fiyat farkı hareketleri (sth_cins = 9) dahil edilmez.</p>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="cikis-miktari" className="border-b-0 relative after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[1px] after:bg-gradient-to-r after:from-[oklch(0.88_0.00_0)] after:to-[oklch(0.97_0.00_0)] dark:after:from-[oklch(0.32_0.00_0)] dark:after:to-[oklch(0.20_0.00_0)] last:after:hidden">
            <AccordionTrigger className="text-[13px] hover:no-underline py-2.5">
              <span className="text-[oklch(0.27_0.00_0)] dark:text-[oklch(0.92_0.00_0)]">7. Çıkış Miktarı</span>
            </AccordionTrigger>
            <AccordionContent className="text-[12px] text-[oklch(0.40_0.00_0)] dark:text-[oklch(0.72_0.00_0)] pb-3">
              <div className="space-y-2">
                <p>Seçilen tarih aralığında depodan çıkan toplam ürün miktarı. Satışlar, iadeler ve transferler dahildir.</p>
                <div className="p-2 bg-[oklch(0.97_0.00_0)] dark:bg-[oklch(0.18_0.00_0)] border border-[oklch(0.92_0.00_0)] dark:border-[oklch(0.27_0.00_0)] rounded-lg">
                  <p className="font-mono text-[11px] mb-1 text-[oklch(0.27_0.00_0)] dark:text-[oklch(0.92_0.00_0)]">SQL Formülü:</p>
                  <code className="text-[11px] text-[oklch(0.40_0.00_0)] dark:text-[oklch(0.72_0.00_0)] block">
                    SUM(CASE<br/>
                    &nbsp;&nbsp;-- Normal çıkışlar<br/>
                    &nbsp;&nbsp;WHEN sth_tip = 1 AND sth_cins != 9 AND ISNULL(sth_normal_iade, 0) = 0<br/>
                    &nbsp;&nbsp;THEN sth_miktar<br/>
                    &nbsp;&nbsp;-- Satış iadeleri (çıkışlardan düşülür)<br/>
                    &nbsp;&nbsp;WHEN sth_tip = 0 AND sth_cins = 0 AND sth_normal_iade = 1<br/>
                    &nbsp;&nbsp;THEN -sth_miktar<br/>
                    &nbsp;&nbsp;ELSE 0<br/>
                    END)
                  </code>
                </div>
                <div className="text-[11px] space-y-1">
                  <p><strong>İade Mantığı:</strong> Satış iadeleri müşteriden dönen ürünler olup, çıkışlardan düşülür.</p>
                  <p><strong>Mikro ERP Tip Kodları:</strong> sth_tip=0 (Giriş), sth_tip=1 (Çıkış)</p>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="kalan-miktar" className="border-b-0 relative after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[1px] after:bg-gradient-to-r after:from-[oklch(0.88_0.00_0)] after:to-[oklch(0.97_0.00_0)] dark:after:from-[oklch(0.32_0.00_0)] dark:after:to-[oklch(0.20_0.00_0)] last:after:hidden">
            <AccordionTrigger className="text-[13px] hover:no-underline py-2.5">
              <span className="text-[oklch(0.27_0.00_0)] dark:text-[oklch(0.92_0.00_0)]">8. Kalan Miktar</span>
            </AccordionTrigger>
            <AccordionContent className="text-[12px] text-[oklch(0.40_0.00_0)] dark:text-[oklch(0.72_0.00_0)] pb-3">
              Depoda mevcut bulunan güncel stok miktarı. En kritik kolon olup, anlık stok durumunu gösterir.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="verilen-siparis" className="border-b-0 relative after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[1px] after:bg-gradient-to-r after:from-[oklch(0.88_0.00_0)] after:to-[oklch(0.97_0.00_0)] dark:after:from-[oklch(0.32_0.00_0)] dark:after:to-[oklch(0.20_0.00_0)] last:after:hidden">
            <AccordionTrigger className="text-[13px] hover:no-underline py-2.5">
              <span className="text-[oklch(0.27_0.00_0)] dark:text-[oklch(0.92_0.00_0)]">9. Verilen Sipariş</span>
            </AccordionTrigger>
            <AccordionContent className="text-[12px] text-[oklch(0.40_0.00_0)] dark:text-[oklch(0.72_0.00_0)] pb-3">
              <div className="space-y-2">
                <p>Tedarikçilere verilmiş ancak henüz teslim alınmamış sipariş miktarı. Yakın zamanda stoğa eklenecek miktarı gösterir.</p>
                <div className="p-2 bg-[oklch(0.97_0.00_0)] dark:bg-[oklch(0.18_0.00_0)] border border-[oklch(0.92_0.00_0)] dark:border-[oklch(0.27_0.00_0)] rounded-lg">
                  <p className="font-mono text-[11px] mb-1 text-[oklch(0.27_0.00_0)] dark:text-[oklch(0.92_0.00_0)]">SQL Formülü:</p>
                  <code className="text-[11px] text-[oklch(0.40_0.00_0)] dark:text-[oklch(0.72_0.00_0)] block">
                    SUM(CASE<br/>
                    &nbsp;&nbsp;WHEN sip_tip = 1  -- Satış tipi = Tedarikçi siparişi<br/>
                    &nbsp;&nbsp;THEN sip_miktar - sip_teslim_miktar<br/>
                    &nbsp;&nbsp;ELSE 0<br/>
                    END)
                  </code>
                </div>
                <div className="text-[11px] space-y-1">
                  <p><strong>Koşullar:</strong></p>
                  <ul className="list-disc list-inside ml-2">
                    <li>Son 1 yıllık siparişler</li>
                    <li>Kapatılmamış siparişler (sip_kapat_fl = 0)</li>
                    <li>İptal edilmemiş siparişler (sip_iptal = 0)</li>
                    <li>Açık bakiye olanlar (miktar &gt; teslim)</li>
                  </ul>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="alinan-siparis" className="border-b-0 relative after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[1px] after:bg-gradient-to-r after:from-[oklch(0.88_0.00_0)] after:to-[oklch(0.97_0.00_0)] dark:after:from-[oklch(0.32_0.00_0)] dark:after:to-[oklch(0.20_0.00_0)] last:after:hidden">
            <AccordionTrigger className="text-[13px] hover:no-underline py-2.5">
              <span className="text-[oklch(0.27_0.00_0)] dark:text-[oklch(0.92_0.00_0)]">10. Alınan Sipariş</span>
            </AccordionTrigger>
            <AccordionContent className="text-[12px] text-[oklch(0.40_0.00_0)] dark:text-[oklch(0.72_0.00_0)] pb-3">
              <div className="space-y-2">
                <p>Müşterilerden alınmış ancak henüz sevk edilmemiş sipariş miktarı. Yakın zamanda stoktan düşecek miktarı gösterir.</p>
                <div className="p-2 bg-[oklch(0.97_0.00_0)] dark:bg-[oklch(0.18_0.00_0)] border border-[oklch(0.92_0.00_0)] dark:border-[oklch(0.27_0.00_0)] rounded-lg">
                  <p className="font-mono text-[11px] mb-1 text-[oklch(0.27_0.00_0)] dark:text-[oklch(0.92_0.00_0)]">SQL Formülü:</p>
                  <code className="text-[11px] text-[oklch(0.40_0.00_0)] dark:text-[oklch(0.72_0.00_0)] block">
                    SUM(CASE<br/>
                    &nbsp;&nbsp;WHEN sip_tip = 0  -- Alış tipi = Müşteri siparişi<br/>
                    &nbsp;&nbsp;THEN sip_miktar - sip_teslim_miktar<br/>
                    &nbsp;&nbsp;ELSE 0<br/>
                    END)
                  </code>
                </div>
                <div className="text-[11px] space-y-1">
                  <p><strong>Dikkat:</strong> Mikro ERP'de tip kodları ters mantıktadır:</p>
                  <ul className="list-disc list-inside ml-2">
                    <li>sip_tip=0: Müşteri siparişi (satış)</li>
                    <li>sip_tip=1: Tedarikçi siparişi (alım)</li>
                  </ul>
                  <p className="mt-1">Bu değer yüksekse stok yetersizliği riski var demektir.</p>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="stok-bekleyen" className="border-b-0 relative after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[1px] after:bg-gradient-to-r after:from-[oklch(0.88_0.00_0)] after:to-[oklch(0.97_0.00_0)] dark:after:from-[oklch(0.32_0.00_0)] dark:after:to-[oklch(0.20_0.00_0)] last:after:hidden">
            <AccordionTrigger className="text-[13px] hover:no-underline py-2.5">
              <span className="text-[oklch(0.27_0.00_0)] dark:text-[oklch(0.92_0.00_0)]">11. Stok + Bekleyen</span>
            </AccordionTrigger>
            <AccordionContent className="text-[12px] text-[oklch(0.40_0.00_0)] dark:text-[oklch(0.72_0.00_0)] pb-3">
              <div className="space-y-2">
                <p>Gelecekteki toplam kullanılabilir stoğu gösterir. Varsayılan olarak gizlidir.</p>
                <div className="p-2 bg-[oklch(0.97_0.00_0)] dark:bg-[oklch(0.18_0.00_0)] border border-[oklch(0.92_0.00_0)] dark:border-[oklch(0.27_0.00_0)] rounded-lg">
                  <p className="font-mono text-[11px] mb-1 text-[oklch(0.27_0.00_0)] dark:text-[oklch(0.92_0.00_0)]">Formül:</p>
                  <code className="text-[11px] text-[oklch(0.40_0.00_0)] dark:text-[oklch(0.72_0.00_0)]">Kalan Miktar + Verilen Sipariş</code>
                </div>
                <div className="text-[11px] space-y-1">
                  <p><strong>Açıklama:</strong> Mevcut stok ile tedarikçilere verilen ancak henüz teslim alınmamış siparişlerin toplamıdır.</p>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="toplam-eksik" className="border-b-0 relative after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[1px] after:bg-gradient-to-r after:from-[oklch(0.88_0.00_0)] after:to-[oklch(0.97_0.00_0)] dark:after:from-[oklch(0.32_0.00_0)] dark:after:to-[oklch(0.20_0.00_0)] last:after:hidden">
            <AccordionTrigger className="text-[13px] hover:no-underline py-2.5">
              <span className="text-[oklch(0.27_0.00_0)] dark:text-[oklch(0.92_0.00_0)]">12. Toplam Eksik</span>
            </AccordionTrigger>
            <AccordionContent className="text-[12px] text-[oklch(0.40_0.00_0)] dark:text-[oklch(0.72_0.00_0)] pb-3">
              <div className="space-y-2">
                <p>Net kullanılabilir stoku gösterir. Varsayılan olarak gizlidir.</p>
                <div className="p-2 bg-[oklch(0.97_0.00_0)] dark:bg-[oklch(0.18_0.00_0)] border border-[oklch(0.92_0.00_0)] dark:border-[oklch(0.27_0.00_0)] rounded-lg">
                  <p className="font-mono text-[11px] mb-1 text-[oklch(0.27_0.00_0)] dark:text-[oklch(0.92_0.00_0)]">Formül:</p>
                  <code className="text-[11px] text-[oklch(0.40_0.00_0)] dark:text-[oklch(0.72_0.00_0)]">(Kalan + Verilen Sipariş) - Alınan Sipariş</code>
                </div>
                <div className="text-[11px] space-y-1">
                  <p><strong>Yorumlama:</strong></p>
                  <ul className="list-disc list-inside ml-2">
                    <li>Pozitif değer: Stok fazlası var</li>
                    <li>Negatif değer: Stok eksikliği var</li>
                    <li>Sıfır: Tam dengededir</li>
                  </ul>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="aylik-satis" className="border-b-0 relative after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[1px] after:bg-gradient-to-r after:from-[oklch(0.88_0.00_0)] after:to-[oklch(0.97_0.00_0)] dark:after:from-[oklch(0.32_0.00_0)] dark:after:to-[oklch(0.20_0.00_0)] last:after:hidden">
            <AccordionTrigger className="text-[13px] hover:no-underline py-2.5">
              <span className="text-[oklch(0.27_0.00_0)] dark:text-[oklch(0.92_0.00_0)]">13. Aylık Ort. Satış</span>
            </AccordionTrigger>
            <AccordionContent className="text-[12px] text-[oklch(0.40_0.00_0)] dark:text-[oklch(0.72_0.00_0)] pb-3">
              <div className="space-y-2">
                <p>Seçilen dönemdeki toplam satışın aylık ortalaması. Sipariş planlaması ve stok seviyesi belirleme için kritik veridir.</p>
                <div className="p-2 bg-[oklch(0.97_0.00_0)] dark:bg-[oklch(0.18_0.00_0)] border border-[oklch(0.92_0.00_0)] dark:border-[oklch(0.27_0.00_0)] rounded-lg">
                  <p className="font-mono text-[11px] mb-1 text-[oklch(0.27_0.00_0)] dark:text-[oklch(0.92_0.00_0)]">Formül:</p>
                  <code className="text-[11px] text-[oklch(0.40_0.00_0)] dark:text-[oklch(0.72_0.00_0)]">Normal Çıkış Miktarı / Ay Sayısı</code>
                </div>
                <div className="text-[11px] space-y-1">
                  <p><strong>Anormal Hareket Tespiti (3-Sigma Kuralı):</strong></p>
                  <ul className="list-disc list-inside ml-2">
                    <li>Eşik değer = Ortalama + (3 × Standart Sapma)</li>
                    <li>Bu eşiği aşan hareketler anormal kabul edilir</li>
                    <li>Sadece son 1 yıllık veri analiz edilir</li>
                    <li>Toplu transferler, büyük iadeler filtrelenir</li>
                  </ul>
                  <p className="mt-2"><strong>Normal Çıkış Formülü:</strong></p>
                  <code className="text-[11px] block ml-2">
                    IF çıkış_miktarı &gt; (ortalama + 3×std_sapma)<br/>
                    THEN hariç_tut<br/>
                    ELSE dahil_et
                  </code>
                  <p className="mt-2"><strong>Kullanım:</strong> Devir hızı, ortalama aylık stok ve sipariş önerisi hesaplamalarında kullanılır.</p>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="aylik-stok" className="border-b-0 relative after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[1px] after:bg-gradient-to-r after:from-[oklch(0.88_0.00_0)] after:to-[oklch(0.97_0.00_0)] dark:after:from-[oklch(0.32_0.00_0)] dark:after:to-[oklch(0.20_0.00_0)] last:after:hidden">
            <AccordionTrigger className="text-[13px] hover:no-underline py-2.5">
              <span className="text-[oklch(0.27_0.00_0)] dark:text-[oklch(0.92_0.00_0)]">14. Ort. Aylık Stok</span>
            </AccordionTrigger>
            <AccordionContent className="text-[12px] text-[oklch(0.40_0.00_0)] dark:text-[oklch(0.72_0.00_0)] pb-3">
              <div className="space-y-2">
                <p>Net stokun kaç aylık satışa yeteceğini gösterir. Stok durumu filtresinin temelidir.</p>
                <div className="p-2 bg-[oklch(0.97_0.00_0)] dark:bg-[oklch(0.18_0.00_0)] border border-[oklch(0.92_0.00_0)] dark:border-[oklch(0.27_0.00_0)] rounded-lg">
                  <p className="font-mono text-[11px] mb-1 text-[oklch(0.27_0.00_0)] dark:text-[oklch(0.92_0.00_0)]">Formül:</p>
                  <code className="text-[11px] text-[oklch(0.40_0.00_0)] dark:text-[oklch(0.72_0.00_0)]">((Kalan + Verilen Sipariş) - Alınan Sipariş) / Aylık Ort. Satış</code>
                </div>
                <div className="text-[11px] space-y-1">
                  <p><strong>Kategoriler:</strong></p>
                  <ul className="list-disc list-inside ml-2">
                    <li>≤ 1 ay: Kritik (Kırmızı)</li>
                    <li>1.01 - 2 ay: Az (Turuncu)</li>
                    <li>&gt; 2 ay: Yeterli (Yeşil)</li>
                  </ul>
                  <p className="mt-2"><strong>Not:</strong> Aylık ortalama satış değeri anormal hareketlerden arındırılmış veri kullanılarak hesaplandığı için bu değer de dolaylı olarak anormal hareket tespitinden etkilenir.</p>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="onerilen-siparis" className="border-b-0 relative after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[1px] after:bg-gradient-to-r after:from-[oklch(0.88_0.00_0)] after:to-[oklch(0.97_0.00_0)] dark:after:from-[oklch(0.32_0.00_0)] dark:after:to-[oklch(0.20_0.00_0)] last:after:hidden">
            <AccordionTrigger className="text-[13px] hover:no-underline py-2.5">
              <span className="text-[oklch(0.27_0.00_0)] dark:text-[oklch(0.92_0.00_0)]">15. Önerilen Sipariş</span>
            </AccordionTrigger>
            <AccordionContent className="text-[12px] text-[oklch(0.40_0.00_0)] dark:text-[oklch(0.72_0.00_0)] pb-3">
              <div className="space-y-2">
                <p>Sistem tarafından otomatik hesaplanan sipariş miktarı önerisi.</p>
                <div className="p-2 bg-[oklch(0.97_0.00_0)] dark:bg-[oklch(0.18_0.00_0)] border border-[oklch(0.92_0.00_0)] dark:border-[oklch(0.27_0.00_0)] rounded-lg">
                  <p className="font-mono text-[11px] mb-1 text-[oklch(0.27_0.00_0)] dark:text-[oklch(0.92_0.00_0)]">Temel Formül:</p>
                  <code className="text-[11px] text-[oklch(0.40_0.00_0)] dark:text-[oklch(0.72_0.00_0)]">(Hedef Ay × Aylık Satış) - Net Stok</code>
                  <p className="font-mono text-[11px] mt-2 mb-1 text-[oklch(0.27_0.00_0)] dark:text-[oklch(0.92_0.00_0)]">Net Stok:</p>
                  <code className="text-[11px] text-[oklch(0.40_0.00_0)] dark:text-[oklch(0.72_0.00_0)]">Kalan + Verilen Sipariş - Alınan Sipariş</code>
                </div>
                <div className="text-[11px] space-y-1">
                  <p><strong>Sipariş Önerilmez (0 döner) Eğer:</strong></p>
                  <ul className="list-disc list-inside ml-2">
                    <li>180+ gün hareket yoksa (Ölü stok)</li>
                    <li>Net stok 2+ aylık ihtiyacı karşılıyorsa</li>
                    <li>Düşük frekanslı ürün (ayda 1'den az satış)</li>
                    <li>Tek seferlik/özel sipariş ürünü</li>
                  </ul>
                  <p className="mt-2"><strong>Kablo Ürünleri İçin Özel Kural:</strong></p>
                  <ul className="list-disc list-inside ml-2">
                    <li>Minimum sipariş: 250 metre</li>
                    <li>250-500 arası → 500'e yuvarla</li>
                    <li>500+ → En yakın 250'ye yuvarla</li>
                  </ul>
                  <p className="mt-2"><strong>Hedef Ay Hesaplama Mantığı:</strong></p>
                  <ul className="list-disc list-inside ml-2 text-[11px]">
                    <li>Aktif hareket + Hızlı devir (≤15 gün) → 1.5 ay</li>
                    <li>Aktif hareket + Normal devir (≤30 gün) → 1.2 ay</li>
                    <li>Aktif hareket + Yavaş devir (≤60 gün) → 1.0 ay</li>
                    <li>Yavaş hareket → 1.0 ay</li>
                    <li>Durgun hareket → 0.5 ay</li>
                    <li>Ölü stok → 0 (sipariş önerilmez)</li>
                  </ul>
                  <p className="mt-2"><strong>Çelişki Çözümü:</strong> Durgun hareket + Hızlı devir durumunda hareket durumu baz alınır.</p>
                  <p className="mt-2"><strong>Özel Ürün Kontrolleri:</strong></p>
                  <ul className="list-disc list-inside ml-2 text-[11px]">
                    <li>Hareket sayısı ≤5 ve giriş≈çıkış → Özel sipariş</li>
                    <li>Toplam hareket ≤2 ve stok &lt;5 → Tek seferlik</li>
                    <li>Aylık satış &lt;1 ve hareket &lt;10 gün → Düşük frekans</li>
                    <li>60+ gün hareketsiz ve satış &lt;2/ay → Durgun ürün</li>
                  </ul>
                  <p className="mt-2"><strong>Anormal Hareket Etkisi:</strong> Hesaplamada kullanılan aylık satış değeri, 3-Sigma kuralıyla tespit edilen anormal hareketlerden arındırılmıştır.</p>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="hareket-durumu" className="border-b-0 relative after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[1px] after:bg-gradient-to-r after:from-[oklch(0.88_0.00_0)] after:to-[oklch(0.97_0.00_0)] dark:after:from-[oklch(0.32_0.00_0)] dark:after:to-[oklch(0.20_0.00_0)] last:after:hidden">
            <AccordionTrigger className="text-[13px] hover:no-underline py-2.5">
              <span className="text-[oklch(0.27_0.00_0)] dark:text-[oklch(0.92_0.00_0)]">16. Hareket Durumu</span>
            </AccordionTrigger>
            <AccordionContent className="text-[12px] text-[oklch(0.40_0.00_0)] dark:text-[oklch(0.72_0.00_0)] pb-3">
              <div className="space-y-2">
                <p>Ürünün hareket sıklığına göre otomatik kategorilendirme.</p>
                <div className="p-2 bg-[oklch(0.97_0.00_0)] dark:bg-[oklch(0.18_0.00_0)] border border-[oklch(0.92_0.00_0)] dark:border-[oklch(0.27_0.00_0)] rounded-lg">
                  <div className="text-[11px] space-y-1">
                    <p className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500 dark:bg-green-400"></span>
                      <strong>Aktif:</strong> Son 30 günde ≥ 3 hareket
                    </p>
                    <p className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-yellow-500 dark:bg-yellow-400"></span>
                      <strong>Yavaş:</strong> Son 60 günde ≥ 2 hareket
                    </p>
                    <p className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-orange-500 dark:bg-orange-400"></span>
                      <strong>Durgun:</strong> Son 180 günde ≥ 1 hareket
                    </p>
                    <p className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-500 dark:bg-red-400"></span>
                      <strong>Ölü Stok:</strong> 180+ gün hareket yok
                    </p>
                  </div>
                </div>
                <div className="text-[11px] space-y-1">
                  <p><strong>Hesaplama Mantığı:</strong></p>
                  <ul className="list-disc list-inside ml-2">
                    <li>SQL sorgusu ile son 30/60/180/365 gün hareketleri sayılır</li>
                    <li>En yüksek aktivite seviyesi baz alınır</li>
                    <li>Sadece çıkış hareketleri (satışlar) dikkate alınır</li>
                  </ul>
                  <p className="mt-2"><strong>SQL Koşulları:</strong></p>
                  <code className="text-[11px] block ml-2">
                    son_30_gun = COUNT(CASE<br/>
                    &nbsp;&nbsp;WHEN sth_tip = 1 AND sth_cins != 9<br/>
                    &nbsp;&nbsp;&nbsp;&nbsp;AND sth_tarih &gt;= DATEADD(DAY, -30, GETDATE())<br/>
                    &nbsp;&nbsp;THEN 1 ELSE 0 END)
                  </code>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="devir-hizi" className="border-b-0 relative after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[1px] after:bg-gradient-to-r after:from-[oklch(0.88_0.00_0)] after:to-[oklch(0.97_0.00_0)] dark:after:from-[oklch(0.32_0.00_0)] dark:after:to-[oklch(0.20_0.00_0)] last:after:hidden">
            <AccordionTrigger className="text-[13px] hover:no-underline py-2.5">
              <span className="text-[oklch(0.27_0.00_0)] dark:text-[oklch(0.92_0.00_0)]">17. Devir Hızı</span>
            </AccordionTrigger>
            <AccordionContent className="text-[12px] text-[oklch(0.40_0.00_0)] dark:text-[oklch(0.72_0.00_0)] pb-3">
              <div className="space-y-2">
                <p>Mevcut stokun günlük satış hızına göre kaç günde tükeneceğini gösterir.</p>
                <div className="p-2 bg-[oklch(0.97_0.00_0)] dark:bg-[oklch(0.18_0.00_0)] border border-[oklch(0.92_0.00_0)] dark:border-[oklch(0.27_0.00_0)] rounded-lg">
                  <p className="font-mono text-[11px] mb-1 text-[oklch(0.27_0.00_0)] dark:text-[oklch(0.92_0.00_0)]">Formül:</p>
                  <code className="text-[11px] text-[oklch(0.40_0.00_0)] dark:text-[oklch(0.72_0.00_0)]">(Kalan Miktar × 30) / (Normal Çıkış / Ay Sayısı)</code>
                </div>
                <div className="text-[11px] space-y-1">
                  <p><strong>Kategoriler:</strong></p>
                  <ul className="list-disc list-inside ml-2">
                    <li>1-15 gün: Hızlı (Yeşil) - Sık sipariş riski</li>
                    <li>16-30 gün: Normal (Mavi) - İdeal seviye</li>
                    <li>31-60 gün: Yavaş (Turuncu) - Fazla stok</li>
                    <li>60+ gün: Çok Yavaş (Kırmızı) - Ölü stok riski</li>
                  </ul>
                  <p className="mt-2"><strong>Özel Durumlar:</strong></p>
                  <ul className="list-disc list-inside ml-2">
                    <li>Satış yoksa ama stok varsa: "Hareketsiz" gösterilir</li>
                    <li>Hem stok hem satış 0 ise: 0 gün döner</li>
                  </ul>
                  <p className="mt-2"><strong>Anormal Hareket Etkisi:</strong> Devir hızı hesaplamasında normal çıkış miktarı kullanılır. Bu değer anormal hareketlerden (toplu transferler, iadeler) arındırılmış olduğu için gerçek devir hızını yansıtır.</p>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="mevsimsellik" className="border-b-0 relative after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[1px] after:bg-gradient-to-r after:from-[oklch(0.88_0.00_0)] after:to-[oklch(0.97_0.00_0)] dark:after:from-[oklch(0.32_0.00_0)] dark:after:to-[oklch(0.20_0.00_0)] last:after:hidden">
            <AccordionTrigger className="text-[13px] hover:no-underline py-2.5">
              <span className="text-[oklch(0.27_0.00_0)] dark:text-[oklch(0.92_0.00_0)]">18. Mevsimsellik</span>
            </AccordionTrigger>
            <AccordionContent className="text-[12px] text-[oklch(0.40_0.00_0)] dark:text-[oklch(0.72_0.00_0)] pb-3">
              <div className="space-y-2">
                <p>Ürünün satış desenini gösterir. Değişkenlik katsayısına göre kategorize edilir.</p>
                <div className="p-2 bg-[oklch(0.97_0.00_0)] dark:bg-[oklch(0.18_0.00_0)] border border-[oklch(0.92_0.00_0)] dark:border-[oklch(0.27_0.00_0)] rounded-lg">
                  <p className="font-mono text-[11px] mb-1 text-[oklch(0.27_0.00_0)] dark:text-[oklch(0.92_0.00_0)]">Değişkenlik Katsayısı:</p>
                  <code className="text-[11px] text-[oklch(0.40_0.00_0)] dark:text-[oklch(0.72_0.00_0)]">STDEV(aylık_satış) / AVG(aylık_satış)</code>
                </div>
                <div className="text-[11px] space-y-1">
                  <p><strong>Kategoriler:</strong></p>
                  <ul className="list-disc list-inside ml-2">
                    <li>Stabil: Katsayı ≤ 0.3</li>
                    <li>Düzensiz: Katsayı 0.3-0.5</li>
                    <li>Mevsimsel: Katsayı &gt; 0.5</li>
                  </ul>
                  <p className="mt-2"><strong>Risk Skoru (0-100):</strong></p>
                  <ul className="list-disc list-inside ml-2">
                    <li>90 puan: Çok mevsimsel (&gt;0.7) + Az stok (&lt;2 ay)</li>
                    <li>70 puan: Mevsimsel (&gt;0.5) + Az stok (&lt;2 ay)</li>
                    <li>50 puan: Düzensiz (&gt;0.3) + Orta stok (&lt;3 ay)</li>
                  </ul>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
        </div>
      </div>

      <div>
        <h3 className="text-[14px] font-medium text-[oklch(0.27_0.00_0)] dark:text-[oklch(0.92_0.00_0)] mb-2">Kolon Yönetimi</h3>
        <ul className="list-disc list-inside space-y-1 ml-4 text-[14px] text-[oklch(0.40_0.00_0)] dark:text-[oklch(0.72_0.00_0)]">
          <li>"Kolonlar" butonuna tıklayarak kolonları gösterip gizleyebilirsiniz</li>
          <li>Kolon başlıklarına tıklayarak sıralama yapabilirsiniz</li>
          <li>Kolon genişliklerini sürükleyerek ayarlayabilirsiniz</li>
          <li>Varsayılan olarak bazı kolonlar (Depo, Stok+Bekleyen, Toplam Eksik) gizlidir</li>
        </ul>
      </div>

      <div>
        <h3 className="text-[14px] font-medium text-[oklch(0.27_0.00_0)] dark:text-[oklch(0.92_0.00_0)] mb-2">Anormal Hareket Tespiti</h3>
        <p className="text-[13px] text-[oklch(0.40_0.00_0)] dark:text-[oklch(0.72_0.00_0)] mb-3">
          Sistem, istatistiksel yöntemlerle olağandışı stok hareketlerini tespit eder ve hesaplamalara dahil etmez. Bu sayede toplu transferler, büyük iadeler veya hatalı girişler satış ortalamalarınızı bozmaz.
        </p>
        
        <div className="space-y-3">
          <div className="p-3 bg-[oklch(0.99_0.00_0)] dark:bg-[oklch(0.14_0.00_0)] border border-[oklch(0.92_0.00_0)] dark:border-[oklch(0.27_0.00_0)] rounded-lg">
            <p className="text-[13px] font-medium text-[oklch(0.27_0.00_0)] dark:text-[oklch(0.92_0.00_0)] mb-2">3-Sigma Kuralı Nedir?</p>
            <p className="text-[12px] text-[oklch(0.40_0.00_0)] dark:text-[oklch(0.72_0.00_0)] mb-2">
              İstatistikte normal dağılıma sahip verilerin %99.7'si ortalamadan ±3 standart sapma içinde yer alır. Bu sınırın dışındaki veriler anormal kabul edilir.
            </p>
          </div>

          <div className="p-3 bg-[oklch(0.99_0.00_0)] dark:bg-[oklch(0.14_0.00_0)] border border-[oklch(0.92_0.00_0)] dark:border-[oklch(0.27_0.00_0)] rounded-lg">
            <p className="text-[13px] font-medium text-[oklch(0.27_0.00_0)] dark:text-[oklch(0.92_0.00_0)] mb-2">Hesaplama Adımları:</p>
            <ol className="list-decimal list-inside space-y-2 text-[12px] text-[oklch(0.40_0.00_0)] dark:text-[oklch(0.72_0.00_0)]">
              <li>
                <strong>Ortalama Hesaplama:</strong>
                <code className="block mt-1 ml-4 text-[11px] p-2 bg-[oklch(0.97_0.00_0)] dark:bg-[oklch(0.18_0.00_0)] border border-[oklch(0.92_0.00_0)] dark:border-[oklch(0.27_0.00_0)] rounded-lg">
                  Ortalama = Toplam Çıkış Miktarı / Hareket Sayısı
                </code>
              </li>
              <li>
                <strong>Standart Sapma Hesaplama:</strong>
                <code className="block mt-1 ml-4 text-[11px] p-2 bg-[oklch(0.97_0.00_0)] dark:bg-[oklch(0.18_0.00_0)] border border-[oklch(0.92_0.00_0)] dark:border-[oklch(0.27_0.00_0)] rounded-lg">
                  σ = √(Σ(xi - ortalama)² / n)
                </code>
                <span className="text-[11px] ml-4 text-[oklch(0.50_0.00_0)] dark:text-[oklch(0.60_0.00_0)]">
                  Her değerin ortalamadan farkının karesinin ortalamasının karekökü
                </span>
              </li>
              <li>
                <strong>Üst Sınır Belirleme:</strong>
                <code className="block mt-1 ml-4 text-[11px] p-2 bg-[oklch(0.97_0.00_0)] dark:bg-[oklch(0.18_0.00_0)] border border-[oklch(0.92_0.00_0)] dark:border-[oklch(0.27_0.00_0)] rounded-lg">
                  Üst Sınır = Ortalama + (3 × Standart Sapma)
                </code>
              </li>
              <li>
                <strong>Anormal Hareket Tespiti:</strong>
                <code className="block mt-1 ml-4 text-[11px] p-2 bg-[oklch(0.97_0.00_0)] dark:bg-[oklch(0.18_0.00_0)] border border-[oklch(0.92_0.00_0)] dark:border-[oklch(0.27_0.00_0)] rounded-lg">
                  EĞER hareket_miktarı &gt; üst_sınır<br/>
                  &nbsp;&nbsp;O ZAMAN "ANORMAL"<br/>
                  DEĞİLSE "NORMAL"
                </code>
              </li>
            </ol>
          </div>

          <div className="p-3 bg-[oklch(0.99_0.00_0)] dark:bg-[oklch(0.14_0.00_0)] border border-[oklch(0.92_0.00_0)] dark:border-[oklch(0.27_0.00_0)] rounded-lg">
            <p className="text-[13px] font-medium text-[oklch(0.27_0.00_0)] dark:text-[oklch(0.92_0.00_0)] mb-2">Örnek Senaryo:</p>
            <div className="text-[12px] text-[oklch(0.40_0.00_0)] dark:text-[oklch(0.72_0.00_0)]">
              <p className="mb-2">Bir ürünün seçilen tarih aralığındaki (örn: 01.01.2025 - 31.12.2025) satış hareketleri:</p>
              <ul className="list-disc list-inside ml-2 space-y-1">
                <li>Ortalama satış: 50 adet/hareket</li>
                <li>Standart sapma: 15 adet</li>
                <li>Üst sınır: 50 + (3 × 15) = 95 adet</li>
                <li><strong>Sonuç:</strong> 95 adetten fazla olan satışlar anormal kabul edilir</li>
              </ul>
              <p className="mt-3 p-2 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg text-[11px]">
                <strong>Örnek:</strong> Normalde 40-60 adet arası satılan bir üründe, bir gün 300 adetlik toplu transfer yapılırsa, bu hareket anormal olarak işaretlenir ve aylık ortalama hesabına dahil edilmez.
              </p>
            </div>
          </div>

          <div className="p-3 bg-[oklch(0.99_0.00_0)] dark:bg-[oklch(0.14_0.00_0)] border border-[oklch(0.92_0.00_0)] dark:border-[oklch(0.27_0.00_0)] rounded-lg">
            <p className="text-[13px] font-medium text-[oklch(0.27_0.00_0)] dark:text-[oklch(0.92_0.00_0)] mb-2">Hangi Verilere Uygulanır?</p>
            <ul className="list-disc list-inside space-y-1 text-[12px] text-[oklch(0.40_0.00_0)] dark:text-[oklch(0.72_0.00_0)]">
              <li>✓ Çıkış hareketleri (sth_tip = 1)</li>
              <li>✓ Filtre çubuğunda seçilen tarih aralığındaki veriler</li>
              <li>✗ Fiyat farkı hareketleri hariç (sth_cins != 9)</li>
              <li>✗ İade hareketleri hariç</li>
            </ul>
            <p className="text-[11px] text-[oklch(0.50_0.00_0)] dark:text-[oklch(0.60_0.00_0)] mt-2 italic">
              Not: Hesaplama, her zaman üst filtre çubuğunda seçtiğiniz tarih aralığına göre yapılır.
            </p>
          </div>

          <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
            <p className="text-[12px] text-green-700 dark:text-green-400">
              <strong>Sonuç:</strong> Bu sistem sayesinde, bir kerelik büyük siparişler veya toplu transferler aylık satış ortalamanızı bozmaz. Gerçek satış deseninize uygun stok önerileri alırsınız.
            </p>
          </div>
        </div>
      </div>
    </div>
  ),
  'data-export': (
    <div className="space-y-4">
      <div>
        <h3 className="text-[14px] font-medium text-[oklch(0.27_0.00_0)] dark:text-[oklch(0.92_0.00_0)] mb-2">Veri Dışa Aktarma</h3>
        <p className="text-[14px] text-[oklch(0.40_0.00_0)] dark:text-[oklch(0.72_0.00_0)]">
          Stok analiz verilerinizi farklı formatlarda dışa aktararak, raporlama ve paylaşım ihtiyaçlarınızı karşılayabilirsiniz. Sistem, tabloda görüntülediğiniz verileri Excel, CSV veya PDF formatlarında kaydetmenize olanak tanır.
        </p>
      </div>

      <div>
        <h3 className="text-[14px] font-medium text-[oklch(0.27_0.00_0)] dark:text-[oklch(0.92_0.00_0)] mb-2">Dışa Aktarma Modalı</h3>
        <p className="text-[13px] text-[oklch(0.40_0.00_0)] dark:text-[oklch(0.72_0.00_0)] mb-3">
          Tablonun sağ üst köşesindeki "Dışa Aktar" butonuna tıkladığınızda açılan pencerede üç ana seçim alanı bulunur:
        </p>
        
        <div className="space-y-3">
          <div className="p-3 bg-[oklch(0.99_0.00_0)] dark:bg-[oklch(0.14_0.00_0)] border border-[oklch(0.92_0.00_0)] dark:border-[oklch(0.27_0.00_0)] rounded-lg">
            <p className="text-[13px] font-medium text-[oklch(0.27_0.00_0)] dark:text-[oklch(0.92_0.00_0)] mb-2">1. Veri Kapsamı</p>
            <p className="text-[12px] text-[oklch(0.50_0.00_0)] dark:text-[oklch(0.60_0.00_0)] mb-2">Eğer tabloda ürünler seçtiyseniz:</p>
            <ul className="list-disc list-inside space-y-1 ml-2 text-[13px] text-[oklch(0.40_0.00_0)] dark:text-[oklch(0.72_0.00_0)]">
              <li><strong>Seçili Ürünler:</strong> Sadece işaretlediğiniz ürünleri aktarır</li>
              <li><strong>Tüm Ürünler:</strong> Filtrelenmiş listedeki tüm ürünleri aktarır</li>
            </ul>
          </div>

          <div className="p-3 bg-[oklch(0.99_0.00_0)] dark:bg-[oklch(0.14_0.00_0)] border border-[oklch(0.92_0.00_0)] dark:border-[oklch(0.27_0.00_0)] rounded-lg">
            <p className="text-[13px] font-medium text-[oklch(0.27_0.00_0)] dark:text-[oklch(0.92_0.00_0)] mb-2">2. Format Seçimi</p>
            <p className="text-[12px] text-[oklch(0.50_0.00_0)] dark:text-[oklch(0.60_0.00_0)] mb-2">Üç farklı format arasından seçim yapabilirsiniz:</p>
            <ul className="list-disc list-inside space-y-1 ml-2 text-[13px] text-[oklch(0.40_0.00_0)] dark:text-[oklch(0.72_0.00_0)]">
              <li><strong>Excel:</strong> Detaylı analiz ve hesaplama yapabileceğiniz format</li>
              <li><strong>CSV:</strong> Diğer programlarla uyumlu hafif format</li>
              <li><strong>PDF:</strong> Yazdırma ve sunum için ideal format</li>
            </ul>
          </div>

          <div className="p-3 bg-[oklch(0.99_0.00_0)] dark:bg-[oklch(0.14_0.00_0)] border border-[oklch(0.92_0.00_0)] dark:border-[oklch(0.27_0.00_0)] rounded-lg">
            <p className="text-[13px] font-medium text-[oklch(0.27_0.00_0)] dark:text-[oklch(0.92_0.00_0)] mb-2">3. Kolon Seçimi</p>
            <p className="text-[12px] text-[oklch(0.50_0.00_0)] dark:text-[oklch(0.60_0.00_0)] mb-2">Hangi bilgilerin dışa aktarılacağını belirleyebilirsiniz:</p>
            <ul className="list-disc list-inside space-y-1 ml-2 text-[13px] text-[oklch(0.40_0.00_0)] dark:text-[oklch(0.72_0.00_0)]">
              <li>Görünecek kolonları işaretleyerek seçin</li>
              <li>"Tümünü Seç" ile hızlıca tüm kolonları ekleyin</li>
              <li>"Tümünü Kaldır" ile sıfırdan başlayın</li>
              <li>Üstteki sayaç seçili kolon sayısını gösterir (örn: 12/18)</li>
            </ul>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-[14px] font-medium text-[oklch(0.27_0.00_0)] dark:text-[oklch(0.92_0.00_0)] mb-2">Format Özellikleri</h3>
        
        <div className="space-y-3">
          <div className="p-3 bg-[oklch(0.99_0.00_0)] dark:bg-[oklch(0.14_0.00_0)] border border-[oklch(0.92_0.00_0)] dark:border-[oklch(0.27_0.00_0)] rounded-lg">
            <p className="text-[13px] font-medium text-[oklch(0.27_0.00_0)] dark:text-[oklch(0.92_0.00_0)] mb-1">Excel Formatı (.xlsx)</p>
            <ul className="list-disc list-inside space-y-1 ml-2 text-[12px] text-[oklch(0.40_0.00_0)] dark:text-[oklch(0.72_0.00_0)]">
              <li>Modern Excel dosyası olarak kaydedilir</li>
              <li>Kolonlar otomatik genişlikte ayarlanır</li>
              <li>Sayısal değerler virgüllü formatta gösterilir</li>
              <li>Formül ekleyebilir, pivot tablo oluşturabilirsiniz</li>
            </ul>
          </div>

          <div className="p-3 bg-[oklch(0.99_0.00_0)] dark:bg-[oklch(0.14_0.00_0)] border border-[oklch(0.92_0.00_0)] dark:border-[oklch(0.27_0.00_0)] rounded-lg">
            <p className="text-[13px] font-medium text-[oklch(0.27_0.00_0)] dark:text-[oklch(0.92_0.00_0)] mb-1">CSV Formatı (.csv)</p>
            <ul className="list-disc list-inside space-y-1 ml-2 text-[12px] text-[oklch(0.40_0.00_0)] dark:text-[oklch(0.72_0.00_0)]">
              <li>Evrensel metin formatında kaydedilir</li>
              <li>Tüm tablo programlarında açılabilir</li>
              <li>Veritabanlarına kolayca aktarılabilir</li>
              <li>Dosya boyutu çok küçüktür</li>
            </ul>
          </div>

          <div className="p-3 bg-[oklch(0.99_0.00_0)] dark:bg-[oklch(0.14_0.00_0)] border border-[oklch(0.92_0.00_0)] dark:border-[oklch(0.27_0.00_0)] rounded-lg">
            <p className="text-[13px] font-medium text-[oklch(0.27_0.00_0)] dark:text-[oklch(0.92_0.00_0)] mb-1">PDF Formatı (.pdf)</p>
            <ul className="list-disc list-inside space-y-1 ml-2 text-[12px] text-[oklch(0.40_0.00_0)] dark:text-[oklch(0.72_0.00_0)]">
              <li>Profesyonel rapor görünümünde oluşturulur</li>
              <li>Başlık, tarih ve sayfa numaraları otomatik eklenir</li>
              <li>6'dan fazla kolon varsa yatay sayfa düzeni kullanılır</li>
              <li>Yazdırmaya hazır formattadır</li>
            </ul>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-[14px] font-medium text-[oklch(0.27_0.00_0)] dark:text-[oklch(0.92_0.00_0)] mb-2">Dosya İsimlendirme</h3>
        <p className="text-[13px] text-[oklch(0.40_0.00_0)] dark:text-[oklch(0.72_0.00_0)] mb-2">
          Dışa aktarılan dosyalar otomatik olarak isimlendirilir:
        </p>
        <div className="p-2 bg-[oklch(0.99_0.00_0)] dark:bg-[oklch(0.18_0.00_0)] border border-[oklch(0.92_0.00_0)] dark:border-[oklch(0.27_0.00_0)] rounded-lg">
          <code className="text-[12px] text-[oklch(0.40_0.00_0)] dark:text-[oklch(0.72_0.00_0)]">
            stok_analiz_raporu_2025-01-22.xlsx
          </code>
        </div>
        <ul className="list-disc list-inside space-y-1 ml-4 mt-2 text-[12px] text-[oklch(0.50_0.00_0)] dark:text-[oklch(0.60_0.00_0)]">
          <li>İsim: stok_analiz_raporu</li>
          <li>Tarih: Otomatik bugünün tarihi</li>
          <li>Uzantı: Seçtiğiniz formata göre</li>
        </ul>
      </div>


      <div>
        <h3 className="text-[14px] font-medium text-[oklch(0.27_0.00_0)] dark:text-[oklch(0.92_0.00_0)] mb-2">Kullanım Adımları</h3>
        <ol className="list-decimal list-inside space-y-1 ml-4 text-[14px] text-[oklch(0.40_0.00_0)] dark:text-[oklch(0.72_0.00_0)]">
          <li>Tabloda istediğiniz filtreleri uygulayın</li>
          <li>İsterseniz belirli ürünleri checkbox ile seçin</li>
          <li>"Dışa Aktar" butonuna tıklayın</li>
          <li>Format seçin (Excel, CSV veya PDF)</li>
          <li>Veri kapsamını belirleyin (seçili/tümü)</li>
          <li>Kolonları seçin veya kaldırın</li>
          <li>"Excel'e Aktar" / "CSV'ye Aktar" / "PDF'e Aktar" butonuna tıklayın</li>
          <li>Dosya otomatik olarak indirilir</li>
        </ol>
      </div>

      <div>
        <h3 className="text-[14px] font-medium text-[oklch(0.27_0.00_0)] dark:text-[oklch(0.92_0.00_0)] mb-2">Önemli Noktalar</h3>
        
        <div className="space-y-3">
          <div className="p-3 bg-[oklch(0.99_0.00_0)] dark:bg-[oklch(0.14_0.00_0)] border border-[oklch(0.92_0.00_0)] dark:border-[oklch(0.27_0.00_0)] rounded-lg">
            <p className="text-[12px] font-medium text-[oklch(0.27_0.00_0)] dark:text-[oklch(0.92_0.00_0)] mb-1">Veri Formatları</p>
            <ul className="list-disc list-inside space-y-1 ml-2 text-[12px] text-[oklch(0.40_0.00_0)] dark:text-[oklch(0.72_0.00_0)]">
              <li>Boş değerler boş hücre olarak gösterilir</li>
              <li>Devir hızı olmayan ürünlerde "Satış yok" yazar</li>
              <li>Sayılar binlik ayraçla formatlanır (1,234)</li>
            </ul>
          </div>

          <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
            <p className="text-[12px] font-medium text-yellow-700 dark:text-yellow-400 mb-1">PDF Türkçe Karakterler</p>
            <p className="text-[12px] text-yellow-700 dark:text-yellow-400">
              PDF'de bazı Türkçe karakterler dönüştürülür:
            </p>
            <p className="text-[11px] text-yellow-600 dark:text-yellow-500 mt-1">
              ı → i, ğ → g, ü → u, ş → s, ö → o, ç → c
            </p>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-[14px] font-medium text-[oklch(0.27_0.00_0)] dark:text-[oklch(0.92_0.00_0)] mb-2">Kullanım Önerileri</h3>
        <ul className="list-disc list-inside space-y-1 ml-4 text-[14px] text-[oklch(0.40_0.00_0)] dark:text-[oklch(0.72_0.00_0)]">
          <li><strong>Detaylı analiz için:</strong> Excel formatını tercih edin</li>
          <li><strong>Hızlı paylaşım için:</strong> PDF formatı kullanın</li>
          <li><strong>Veri aktarımı için:</strong> CSV formatını seçin</li>
          <li><strong>Büyük veriler için:</strong> Önce filtreleyin, sonra dışa aktarın</li>
          <li><strong>Temiz rapor için:</strong> Gereksiz kolonları kaldırın</li>
        </ul>
      </div>

      <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
        <p className="text-[13px] text-green-700 dark:text-green-400">
          <strong>İpucu:</strong> Bu özellik sayesinde stok verilerinizi istediğiniz formatta saklayabilir, paylaşabilir ve üzerinde detaylı analizler yapabilirsiniz.
        </p>
      </div>
    </div>
  )
}