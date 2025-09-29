export default function KullanimKosullari() {
  return (
    <div className="space-y-5">
      <div className="flex justify-between text-sm text-muted-foreground mb-4">
        <span>Yürürlük tarihi: 23.09.2025</span>
        <span>Son güncelleme: 24.09.2025</span>
      </div>
      
      <section>
        <h3 className="font-semibold text-base mb-3">1. Genel Hükümler ve Kabul</h3>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Bu kullanım koşulları, şirketimizin kurumsal yönetim uygulamasını kullanırken uyulması 
          gereken kuralları belirtir. Uygulama, yalnızca şirket personelimizin kullanımına sunulmuştur.
        </p>
      </section>

      <section>
        <h3 className="font-semibold text-base mb-3">2. Hizmet Kapsamı ve Tanımı</h3>
        <p className="text-sm text-muted-foreground leading-relaxed mb-2">
          Uygulama ile aşağıdaki hizmetlerden yararlanabilirsiniz:
        </p>
        <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground pl-4">
          <li>Stok takibi ve envanter yönetimi</li>
          <li>Müşteri ve tedarikçi yönetimi (CRM)</li>
          <li>Sipariş ve satış yönetimi</li>
          <li>Faturalama ve tahsilat takibi</li>
          <li>Raporlama ve veri analizi</li>
          <li>Kullanıcı yetkilendirme ve rol yönetimi</li>
          <li>Belge yönetimi ve arşivleme</li>
        </ul>
      </section>

      <section>
        <h3 className="font-semibold text-base mb-3">3. Kullanıcı Hesabı ve Yükümlülükleri</h3>
        <div className="space-y-3">
          <div>
            <p className="text-sm font-medium mb-1">3.1. Hesap Kullanımı:</p>
            <p className="text-sm text-muted-foreground leading-relaxed pl-4">
              Hesap bilgileriniz Mikro sisteminden otomatik olarak çekilmektedir. 
              Giriş bilgilerinizi güvenli tutmak sizin sorumluluğunuzdadır.
            </p>
          </div>

          <div>
            <p className="text-sm font-medium mb-1">3.2. Hesap Güvenliği:</p>
            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground pl-4">
              <li>Kullanıcı adı ve şifrenizi gizli tutmakla yükümlüsünüz</li>
              <li>Şifrenizi en az 8 karakter uzunluğunda ve güvenli kriterlere uygun belirlemelisiniz</li>
              <li>Hesabınızdan gerçekleştirilen tüm işlemlerden sorumlusunuz</li>
              <li>Yetkisiz erişim tespit ettiğinizde derhal bilgiislem@leventelektrik.biz adresine bildirimde bulunmalısınız</li>
              <li>Hesap bilgilerinizi üçüncü şahıslarla paylaşmanız kesinlikle yasaktır</li>
            </ul>
          </div>

          <div>
            <p className="text-sm font-medium mb-1">3.3. Kullanıcı Davranış Kuralları:</p>
            <p className="text-sm text-muted-foreground leading-relaxed pl-4 mb-2">
              Uygulama kullanımı sırasında aşağıdaki kurallara uymanız zorunludur:
            </p>
            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground pl-4">
              <li>Türkiye Cumhuriyeti yasalarına ve ilgili mevzuata uygun hareket etmek</li>
              <li>Şirket politika ve prosedürlerine uymak</li>
              <li>Müşteri ve tedarikçi gizliliğine saygı göstermek</li>
              <li>Sisteme zarar verecek eylemlerden kaçınmak</li>
              <li>Sahte veya yanıltıcı bilgi girmemek</li>
              <li>Başka kullanıcıların hesaplarına erişim sağlamamak</li>
            </ul>
          </div>
        </div>
      </section>

      <section>
        <h3 className="font-semibold text-base mb-3">4. Fikri Mülkiyet Hakları</h3>
        <p className="text-sm text-muted-foreground leading-relaxed mb-2">
          Uygulamanın tüm fikri mülkiyet hakları (kaynak kod, tasarım, logo, içerik, veritabanı yapısı dahil ancak 
          bunlarla sınırlı olmamak üzere) Şirkete aittir. Bu haklar ulusal ve uluslararası fikri mülkiyet yasaları 
          ile korunmaktadır. İzinsiz kullanım, kopyalama, dağıtma veya değiştirme yasaktır ve hukuki takibe tabidir.
        </p>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Kullanıcılar tarafından sisteme girilen veriler (müşteri bilgileri, satış kayıtları vb.) Şirkete aittir 
          ve ticari sır niteliğindedir.
        </p>
      </section>

      <section>
        <h3 className="font-semibold text-base mb-3">5. Yasaklanmış Faaliyetler</h3>
        <p className="text-sm text-muted-foreground leading-relaxed mb-2">
          Aşağıdaki faaliyetler kesinlikle yasaktır ve tespit edilmesi halinde hesap kapatma ve yasal işlem başlatma 
          hakkımız saklıdır:
        </p>
        <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground pl-4">
          <li>Sisteme yetkisiz erişim sağlama veya sağlamaya teşebbüs</li>
          <li>Güvenlik açıklarını tespit etme veya istismar etme</li>
          <li>Virüs, trojan veya zararlı kod yükleme</li>
          <li>DDoS saldırısı veya sistem performansını bozacak eylemler</li>
          <li>Tersine mühendislik, kaynak koda erişim veya kod çalma girişimleri</li>
          <li>Veri madenciliği, bot kullanımı veya otomatik veri çekme</li>
          <li>Sahte kimlik veya yetkisiz temsil</li>
          <li>Ticari sırların ifşası veya rekabet yasağı ihlali</li>
        </ul>
      </section>

      <section>
        <h3 className="font-semibold text-base mb-3">6. Hizmet Kesintileri ve Değişiklikler</h3>
        <div className="space-y-3">
          <div>
            <p className="text-sm font-medium mb-1">6.1. Planlı Bakım:</p>
            <p className="text-sm text-muted-foreground leading-relaxed pl-4">
              Sistem performansı ve güvenliği için düzenli bakım çalışmaları yapılmaktadır. Planlı bakımlar 
              önceden e-posta ile bildirilir ve mümkün olduğunca mesai saatleri dışında gerçekleştirilir.
            </p>
          </div>

          <div>
            <p className="text-sm font-medium mb-1">6.2. Beklenmeyen Kesintiler:</p>
            <p className="text-sm text-muted-foreground leading-relaxed pl-4">
              Teknik arızalar, siber saldırılar, doğal afetler veya mücbir sebeplerden kaynaklanan kesintilerden 
              Şirket sorumlu tutulamaz. Kesinti durumunda en kısa sürede hizmet normale döndürülür.
            </p>
          </div>

          <div>
            <p className="text-sm font-medium mb-1">6.3. Özellik Güncellemeleri:</p>
            <p className="text-sm text-muted-foreground leading-relaxed pl-4">
              Şirket, Uygulamada iyileştirmeler, yeni özellikler veya güvenlik yamalarını kullanıcıları 
              bilgilendirerek uygulama hakkını saklı tutar.
            </p>
          </div>
        </div>
      </section>

      <section>
        <h3 className="font-semibold text-base mb-3">7. Veri Yedekleme ve Kurtarma</h3>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Sistem verileri günlük olarak otomatik yedeklenir. Yedekler şifreli olarak saklanır ve 30 gün boyunca 
          muhafaza edilir. Veri kaybı durumunda son yedekleme noktasına geri dönüş yapılabilir. Ancak, kullanıcı 
          hatasından kaynaklanan veri kayıplarında (yanlış silme, üzerine yazma vb.) Şirket sorumluluk kabul etmez.
        </p>
      </section>

      <section>
        <h3 className="font-semibold text-base mb-3">8. Sorumluluk Sınırlaması</h3>
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground leading-relaxed">
            Yasal düzenlemelerin izin verdiği azami ölçüde, Şirket aşağıdaki durumlardan sorumlu tutulamaz:
          </p>
          <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground pl-4">
            <li>Dolaylı, arızi, cezai veya sonuç olarak ortaya çıkan zararlar</li>
            <li>Kar kaybı, itibar kaybı veya veri kaybı</li>
            <li>Üçüncü taraf hizmetlerinden kaynaklanan sorunlar</li>
            <li>Kullanıcı hatasından kaynaklanan zararlar</li>
            <li>Mücbir sebeplerden kaynaklanan hizmet kesintileri</li>
          </ul>
          <p className="text-sm text-muted-foreground leading-relaxed mt-2">
            Hizmetlerimiz "OLDUĞU GİBİ" ve "MEVCUT OLDUĞU ŞEKILDE" sunulmaktadır. Açık veya zımni hiçbir 
            garanti verilmemektedir.
          </p>
        </div>
      </section>

      <section>
        <h3 className="font-semibold text-base mb-3">9. Tazminat</h3>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Uygulamayı kurallara aykırı kullanımınızdan doğabilecek tüm sorunlardan 
          siz sorumlusunuz.
        </p>
      </section>

      <section>
        <h3 className="font-semibold text-base mb-3">10. Sözleşmenin Feshi</h3>
        <div className="space-y-3">
          <div>
            <p className="text-sm font-medium mb-1">10.1. Hesap Kapanması:</p>
            <p className="text-sm text-muted-foreground leading-relaxed pl-4">
              Şirketten ayrıldığınızda hesabınız otomatik olarak kapatılır.
            </p>
          </div>

          <div>
            <p className="text-sm font-medium mb-1">10.2. Hesap Askıya Alınması:</p>
            <p className="text-sm text-muted-foreground leading-relaxed pl-4">
              Kurallara aykırı kullanım veya güvenlik tehdidi durumlarında hesabınız 
              askıya alınabilir.
            </p>
          </div>

          <div>
            <p className="text-sm font-medium mb-1">10.3. Fesih Sonrası:</p>
            <p className="text-sm text-muted-foreground leading-relaxed pl-4">
              Hesap kapatıldıktan sonra tüm erişim hakları sona erer. Veriler yasal saklama süreleri boyunca 
              arşivde tutulur, sonrasında güvenli şekilde imha edilir.
            </p>
          </div>
        </div>
      </section>

      <section>
        <h3 className="font-semibold text-base mb-3">11. Gizlilik</h3>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Uygulama üzerinden eriştiğiniz tüm müşteri bilgileri, fiyat listeleri ve 
          diğer ticari bilgiler gizlidir. Bu bilgileri kimseyle paylaşamazsınız. 
          Gizlilik yükümlülüğünüz şirketten ayrıldıktan sonra da devam eder.
        </p>
      </section>

      <section>
        <h3 className="font-semibold text-base mb-3">12. Uygulanacak Hukuk ve Yetkili Mahkeme</h3>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Bu Sözleşme, Türkiye Cumhuriyeti kanunlarına tabidir. Sözleşmeden doğan her türlü uyuşmazlıkta 
          öncelikle dostane çözüm aranır. Anlaşmazlık halinde Antalya Mahkemeleri ve İcra Daireleri yetkilidir. 
          Tüketici hakem heyetine başvuru hakkınız saklıdır.
        </p>
      </section>

      <section>
        <h3 className="font-semibold text-base mb-3">13. Bildirimler</h3>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Önemli bildirimler e-posta adresinize veya uygulama içi bildirim sistemi üzerinden yapılır.
        </p>
      </section>

      <section>
        <h3 className="font-semibold text-base mb-3">14. Değişiklikler</h3>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Bu kullanım koşulları gerektiğinde güncellenebilir. Önemli değişiklikler 
          hakkında bilgilendirilirsiniz.
        </p>
      </section>

      <section>
        <h3 className="font-semibold text-base mb-3">15. Bölünebilirlik</h3>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Bu Sözleşmenin herhangi bir hükmünün geçersiz veya uygulanamaz olması durumunda, 
          diğer hükümler geçerliliğini korur. Geçersiz hüküm, yasal sınırlar dahilinde tarafların 
          asıl amacına en yakın şekilde yorumlanır.
        </p>
      </section>

      <section>
        <h3 className="font-semibold text-base mb-3">16. Feragat</h3>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Şirketin bu Sözleşmedeki herhangi bir hakkını kullanmaması veya geç kullanması, 
          o haktan feragat ettiği anlamına gelmez. Feragat ancak yazılı olarak ve yetkili 
          temsilci imzası ile geçerli olur.
        </p>
      </section>

      <section>
        <h3 className="font-semibold text-base mb-3">17. Tam Mutabakat</h3>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Bu Sözleşme ve Gizlilik Politikası, taraflar arasındaki tam mutabakatı oluşturur ve 
          konuya ilişkin önceki tüm yazılı veya sözlü anlaşmaların yerine geçer.
        </p>
      </section>

      <section>
        <h3 className="font-semibold text-base mb-3">18. İletişim</h3>
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