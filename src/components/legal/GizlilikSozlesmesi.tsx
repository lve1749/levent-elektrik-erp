export default function GizlilikSozlesmesi() {
  return (
    <div className="space-y-5">
      <div className="flex justify-between text-sm text-muted-foreground mb-4">
        <span>Yürürlük tarihi: 23.09.2025</span>
        <span>Son güncelleme: 24.09.2025</span>
      </div>
      
      <section>
        <h3 className="font-semibold text-base mb-3">1. Giriş ve Kapsam</h3>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Bu gizlilik sözleşmesi, şirketimizin kurumsal yönetim uygulamasını kullanırken toplanan, işlenen ve 
          saklanan kişisel verilerinizin nasıl korunduğunu açıklamaktadır. Uygulama, yalnızca şirket personelimizin 
          kullanımına sunulmuştur.
        </p>
      </section>

      <section>
        <h3 className="font-semibold text-base mb-3">2. Veri Sorumlusu Bilgileri</h3>
        <p className="text-sm text-muted-foreground leading-relaxed mb-2">
          6698 sayılı Kişisel Verilerin Korunması Kanunu ("KVKK") kapsamında veri sorumlusu:
        </p>
        <div className="text-sm text-muted-foreground leading-relaxed pl-4">
          <strong>Şirket:</strong> Levent Aydınlatma ve Elektrik Malzemeleri İnşaat ve Ticaret Limited Şirketi<br />
          <strong>Adres:</strong> Muratpaşa Mah. 605 Sk. No:6A Muratpaşa/ANTALYA<br />
          <strong>E-posta:</strong> bilgiislem@leventelektrik.biz
        </div>
      </section>

      <section>
        <h3 className="font-semibold text-base mb-3">3. Toplanan Kişisel Veriler ve Kategorileri</h3>
        <p className="text-sm text-muted-foreground leading-relaxed mb-2">
          Uygulamamız kapsamında iki farklı kategoride veri işlenmektedir:
        </p>
        
        <div className="space-y-4">
          <div className="p-3 bg-[oklch(0.99_0.00_0)] dark:bg-[oklch(0.14_0.00_0)] border border-[oklch(0.92_0.00_0)] dark:border-[oklch(0.27_0.00_0)] rounded-lg">
            <p className="text-sm font-medium text-[oklch(0.27_0.00_0)] dark:text-[oklch(0.92_0.00_0)] mb-2">
              A. Sizden (Şirket Personeli) Toplanan Veriler:
            </p>
            
            <div className="space-y-3">
              <div>
                <p className="text-sm font-medium mb-1">A.1. Kimlik Doğrulama Verileri:</p>
                <ul className="list-disc list-inside space-y-1 text-sm text-[oklch(0.40_0.00_0)] dark:text-[oklch(0.72_0.00_0)] ml-2">
                  <li>Kullanıcı adı</li>
                  <li>Hashlenmiş şifre bilgisi</li>
                  <li>Oturum açma bilgileri (tarih, saat)</li>
                  <li>Kullanıcı yetki ve rol bilgileri</li>
                </ul>
              </div>

              <div>
                <p className="text-sm font-medium mb-1">A.2. Sistem Kullanım Verileri:</p>
                <ul className="list-disc list-inside space-y-1 text-sm text-[oklch(0.40_0.00_0)] dark:text-[oklch(0.72_0.00_0)] ml-2">
                  <li>IP adresi ve konum bilgisi (il bazında)</li>
                  <li>Tarayıcı ve cihaz bilgileri</li>
                  <li>Sistem içi işlem logları (yapılan işlemler, değişiklikler)</li>
                  <li>Erişim zamanları ve süreleri</li>
                  <li>Kullanılan modüller ve özellikler</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="p-3 bg-[oklch(0.99_0.00_0)] dark:bg-[oklch(0.14_0.00_0)] border border-[oklch(0.92_0.00_0)] dark:border-[oklch(0.27_0.00_0)] rounded-lg">
            <p className="text-sm font-medium text-[oklch(0.27_0.00_0)] dark:text-[oklch(0.92_0.00_0)] mb-1">
              B. İş Süreçleri Kapsamında Kayıt Altına Alınan Veriler:
            </p>
            <p className="text-xs text-[oklch(0.40_0.00_0)] dark:text-[oklch(0.72_0.00_0)] mb-2 italic">
              Bu veriler şirketimizin ticari faaliyetleri kapsamında müşteri ve tedarikçilere ait olup, sistem kullanıcılarına ait değildir.
            </p>
            
            <div className="space-y-3">
              <div>
                <p className="text-sm font-medium mb-1">B.1. Müşteri/Tedarikçi Firma Bilgileri:</p>
                <ul className="list-disc list-inside space-y-1 text-sm text-[oklch(0.40_0.00_0)] dark:text-[oklch(0.72_0.00_0)] ml-2">
                  <li>Ticari unvan</li>
                  <li>Vergi numarası ve vergi dairesi</li>
                  <li>Adres bilgileri</li>
                  <li>Yetkili kişi ad-soyad</li>
                  <li>İletişim bilgileri (telefon, e-posta)</li>
                </ul>
              </div>

              <div>
                <p className="text-sm font-medium mb-1">B.2. Ticari İşlem Verileri:</p>
                <ul className="list-disc list-inside space-y-1 text-sm text-[oklch(0.40_0.00_0)] dark:text-[oklch(0.72_0.00_0)] ml-2">
                  <li>Sipariş ve satış kayıtları</li>
                  <li>Fatura ve irsaliye bilgileri</li>
                  <li>Stok hareketleri</li>
                  <li>Tahsilat ve ödeme kayıtları</li>
                  <li>Fiyat listeleri ve iskonto oranları</li>
                </ul>
              </div>
            </div>
          </div>

          <div>
            <p className="text-sm font-medium mb-1">C. Teknik ve Analitik Veriler:</p>
            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground pl-4">
              <li>Sistem performans metrikleri</li>
              <li>Hata logları ve debug bilgileri</li>
              <li>Özellik kullanım istatistikleri (anonim)</li>
              <li>Çerez (cookie) bilgileri</li>
            </ul>
          </div>
        </div>
      </section>

      <section>
        <h3 className="font-semibold text-base mb-3">4. Kişisel Verilerin İşlenme Amaçları</h3>
        <p className="text-sm text-muted-foreground leading-relaxed mb-2">
          Toplanan kişisel veriler aşağıdaki amaçlarla işlenmektedir:
        </p>
        <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
          <li>Kullanıcı kimlik doğrulama ve yetkilendirme işlemleri</li>
          <li>Stok takibi, sipariş yönetimi ve raporlama hizmetlerinin sunulması</li>
          <li>Müşteri ve tedarikçi ilişkilerinin yönetimi</li>
          <li>Faturalandırma ve muhasebe süreçlerinin yürütülmesi</li>
          <li>Yasal mevzuattan kaynaklanan yükümlülüklerin yerine getirilmesi</li>
          <li>Sistem güvenliğinin sağlanması ve siber saldırıların önlenmesi</li>
          <li>Kullanıcı deneyiminin iyileştirilmesi ve kişiselleştirilmesi</li>
          <li>Teknik destek ve müşteri hizmetlerinin sağlanması</li>
          <li>İstatistiksel analizler ve iş zekası raporlarının oluşturulması</li>
          <li>Yeni özellik ve güncellemelerin geliştirilmesi</li>
        </ul>
      </section>

      <section>
        <h3 className="font-semibold text-base mb-3">5. Kişisel Verilerin İşlenmesinin Hukuki Dayanakları</h3>
        <p className="text-sm text-muted-foreground leading-relaxed mb-2">
          KVKK'nın 5. ve 6. maddeleri uyarınca kişisel verileriniz aşağıdaki hukuki dayanaklara istinaden işlenmektedir:
        </p>
        <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
          <li><strong>Sözleşmenin kurulması ve ifası:</strong> Hizmet sözleşmesinin gereğini yerine getirmek</li>
          <li><strong>Hukuki yükümlülük:</strong> Vergi mevzuatı, Türk Ticaret Kanunu ve ilgili mevzuat</li>
          <li><strong>Meşru menfaat:</strong> Güvenlik, dolandırıcılık önleme ve sistem iyileştirmeleri</li>
          <li><strong>Açık rıza:</strong> Pazarlama faaliyetleri ve isteğe bağlı hizmetler için</li>
        </ul>
      </section>

      <section>
        <h3 className="font-semibold text-base mb-3">6. Veri Güvenliği ve Teknik Önlemler</h3>
        <p className="text-sm text-muted-foreground leading-relaxed mb-2">
          Kişisel verilerinizin güvenliği için aşağıdaki teknik ve idari tedbirler alınmaktadır:
        </p>
        <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
          <li><strong>Şifreleme:</strong> Tüm veri iletimi endüstri standardı şifreleme protokolleri ile korunmaktadır</li>
          <li><strong>Parola güvenliği:</strong> Modern ve güvenli hash algoritmaları kullanılmaktadır</li>
          <li><strong>Veritabanı güvenliği:</strong> Veritabanı erişimleri güvenlik protokolleri ile korunmaktadır</li>
          <li><strong>Erişim kontrolü:</strong> Rol tabanlı yetkilendirme sistemi uygulanmaktadır</li>
          <li><strong>Güvenlik önlemleri:</strong> Çok katmanlı güvenlik mimarisi kullanılmaktadır</li>
          <li><strong>Yedekleme:</strong> Düzenli otomatik yedekleme ve felaket kurtarma planı</li>
          <li><strong>İzleme:</strong> Sistem ve güvenlik olayları sürekli izlenmektedir</li>
          <li><strong>Güvenlik denetimleri:</strong> Düzenli bağımsız güvenlik denetimleri yapılmaktadır</li>
        </ul>
      </section>

      <section>
        <h3 className="font-semibold text-base mb-3">7. Kişisel Verilerin Aktarılması</h3>
        <p className="text-sm text-muted-foreground leading-relaxed mb-2">
          Kişisel verileriniz, işleme amaçları doğrultusunda ve gerekli güvenlik önlemleri alınarak aşağıdaki taraflara aktarılabilir:
        </p>
        <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
          <li><strong>Grup şirketleri:</strong> İş ortaklıkları ve operasyonel gereklilikler için</li>
          <li><strong>Hizmet sağlayıcılar:</strong> Bulut altyapı ve e-posta servisleri</li>
          <li><strong>Yasal merciler:</strong> Mahkemeler, kolluk kuvvetleri, düzenleyici kurumlar</li>
          <li><strong>Mali müşavirlik:</strong> Yasal defter ve beyanname işlemleri için</li>
          <li><strong>Bağımsız denetim:</strong> Yasal denetim yükümlülükleri kapsamında</li>
        </ul>
        <p className="text-sm text-muted-foreground leading-relaxed mt-2">
          <strong>Not:</strong> Verileriniz yurt dışına aktarılmamaktadır.
        </p>
      </section>

      <section>
        <h3 className="font-semibold text-base mb-3">8. Veri Saklama Süreleri</h3>
        <p className="text-sm text-muted-foreground leading-relaxed mb-2">
          Kişisel verileriniz, ilgili mevzuatta öngörülen veya işleme amacının gerektirdiği süreler boyunca saklanmaktadır:
        </p>
        <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
          <li><strong>Ticari defterler ve faturalar:</strong> 10 yıl (VUK ve TTK gereği)</li>
          <li><strong>Muhasebe kayıtları:</strong> 10 yıl</li>
          <li><strong>İş sözleşmeleri:</strong> Sözleşme bitiminden itibaren 10 yıl</li>
          <li><strong>Erişim logları:</strong> 2 yıl (5651 sayılı kanun gereği)</li>
          <li><strong>Pazarlama verileri:</strong> Açık rıza geri çekilene kadar</li>
        </ul>
      </section>

      <section>
        <h3 className="font-semibold text-base mb-3">9. Çerezler (Cookies) ve Benzeri Teknolojiler</h3>
        <p className="text-sm text-muted-foreground leading-relaxed mb-2">
          Uygulamamızda kullanılan çerez türleri:
        </p>
        <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
          <li><strong>Zorunlu çerezler:</strong> Oturum yönetimi ve güvenlik doğrulaması</li>
          <li><strong>Fonksiyonel çerezler:</strong> Tema ayarları</li>
          <li><strong>Performans çerezleri:</strong> Sayfa yükleme süreleri, hata takibi</li>
          <li><strong>Analitik çerezler:</strong> Kullanım istatistikleri (anonim)</li>
        </ul>
        <p className="text-sm text-muted-foreground leading-relaxed mt-2">
          Tarayıcı ayarlarınızdan çerezleri yönetebilirsiniz.
        </p>
      </section>

      <section>
        <h3 className="font-semibold text-base mb-3">10. Veri Minimizasyonu İlkesi</h3>
        <p className="text-sm text-muted-foreground leading-relaxed mb-2">
          Şirketimiz, veri minimizasyonu ilkesi gereğince:
        </p>
        <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
          <li>Sadece işleme amacı için gerekli olan asgari veriyi toplar</li>
          <li>Veri işleme amaçları açık ve meşru olmalıdır</li>
          <li>İşlenen veriler belirli, açık ve meşru amaçlarla sınırlıdır</li>
          <li>Amaç için gerekli olandan fazla veri toplanmaz ve işlenmez</li>
          <li>Veriler, işlenme amaçlarının gerektirdiği süre kadar saklanır</li>
        </ul>
      </section>

      <section>
        <h3 className="font-semibold text-base mb-3">11. Veri Sahiplerinin Hakları</h3>
        <p className="text-sm text-muted-foreground leading-relaxed mb-2">
          KVKK'nın 11. maddesi uyarınca aşağıdaki haklara sahipsiniz:
        </p>
        <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
          <li>Kişisel verilerinizin işlenip işlenmediğini öğrenme</li>
          <li>İşlenmişse buna ilişkin bilgi talep etme</li>
          <li>İşlenme amacını ve amacına uygun kullanılıp kullanılmadığını öğrenme</li>
          <li>Yurt içinde veya dışında aktarıldığı üçüncü kişileri bilme</li>
          <li>Eksik veya yanlış işlenmişse düzeltilmesini isteme</li>
          <li>Silme veya yok edilmesini isteme (yasal saklama süreleri hariç)</li>
          <li>Düzeltme/silme işlemlerinin aktarıldığı üçüncü kişilere bildirilmesini isteme</li>
          <li>Kişisel verilerinizin makine okunabilir formatta tarafınıza veya belirlediğiniz üçüncü kişiye aktarılmasını isteme (veri taşınabilirliği)</li>
          <li>Otomatik sistemlerle analiz edilmesi sonucu aleyhinize çıkan sonuca itiraz etme</li>
          <li>Münhasıran otomatik sistemler vasıtasıyla verilen kararlara tabi tutulmama</li>
          <li>Kanuna aykırı işlenmesi sebebiyle zarara uğramanız halinde tazminat talep etme</li>
        </ul>
      </section>

      <section>
        <h3 className="font-semibold text-base mb-3">12. Veri İhlali Bildirimi</h3>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Verilerinizin güvenliğini etkileyebilecek bir ihlal durumunda:
        </p>
        <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
          <li>Yasal mercilere gerekli bildirimler yapılır</li>
          <li>Etkilenen personel bilgilendirilir</li>
          <li>Gerekli önlemler derhal alınır</li>
        </ul>
      </section>

      <section>
        <h3 className="font-semibold text-base mb-3">13. Değişiklikler ve Güncellemeler</h3>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Bu gizlilik sözleşmesi gerektiğinde güncellenebilir. Önemli değişiklikler hakkında 
          bilgilendirilirsiniz.
        </p>
      </section>

      <section>
        <h3 className="font-semibold text-base mb-3">14. İletişim</h3>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Sorularınız ve talepleriniz için:
        </p>
        <div className="text-sm text-muted-foreground leading-relaxed pl-4 mt-2">
          E-posta: bilgiislem@leventelektrik.biz
        </div>
      </section>
    </div>
  );
}