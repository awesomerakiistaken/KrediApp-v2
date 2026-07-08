# Handoff: KrediApp-v2 — sıfırdan öğrenerek rebuild

## Proje bağlamı

Kullanıcı, `C:\Users\doruk\kredihesap` adlı eski staj projesini (KrediApp, .NET 8 + Angular 19 + ML.NET) büyük ölçüde AI'a yazdırmıştı. Yöneticisi bunu fark edip "bir şey öğrenmedin" dedi ve ayrı bir veritabanına (MS SQL Server, SQLite yerine) geçmesini istedi. Kullanıcı bu yeni projeyi (`C:\Users\doruk\KrediApp-v2`, ayrı git repo) **kendisi anlayarak, öğrenerek** yeniden yazmak istiyor. Eski proje sadece referans, dokunulmuyor.

Kullanıcı **C# bilmiyor**. SQL'i (T-SQL, SSMS) bu süreçte öğrendi/öğreniyor.

## Eğitim yöntemi — bu session'da işe yarayan yaklaşım

**Genel prensip**: Kavramsal/tasarımsal kararları kullanıcıya bırak, mekanik/sözdizimsel yazımı ilk birkaç örnekte göster, sonra kullanıcıya devrettir. Kullanıcı zorlandığında ("ben yapamam", "sen yaz") direkt kodu yaz ama HER ZAMAN ne yaptığını ve neden yaptığını satır satır ya da adım adım açıkla.

**Somut akış (şema tasarımı fazında böyle işledi)**:
1. Kullanıcı bir tasarım taslağı getirir (örn. tablo alanları).
2. Ben eksik/yanlış noktaları **Socratic soru** olarak sorarım ("bu alan neden burada?", "şunu düşün: X olursa ne olur?") — direkt cevabı vermem, önce düşündürürüm.
3. Kullanıcı "tamamdır, sence nasıl olmalı söyle" dediğinde tam öneriyi veririm — yani ısrar edip Socratic yöntemi zorlamıyorum, kullanıcı direkt cevap istediğinde veriyorum.
4. Yeni bir SQL/kod kavramı (örn. FK sözdizimi, `DECIMAL(5,4)` ne demek, `CHECK` constraint nedir) sorulduğunda **kısa, somut örnekli** açıklama veriyorum — akademik değil, "bu satır ne yapar" seviyesinde.
5. Kullanıcı bir komut yazıp hata aldığında, hatayı direkt düzeltmiyorum — **neyin yanlış olduğunu** gösterip tekrar denemesini istiyorum (örn. trailing comma, eksik parantez, `NOT NULL` unutma gibi hataları kendisi bulup düzeltti).
6. İlk örnek (örn. ilk Controller) benden geldi, tam açıklamalı; sonraki benzer görevi (örn. ikinci tablo) kullanıcı dener.
7. Kullanıcı "ben yapamam, sen yap" dediğinde (C# gibi hiç bilmediği bir alanda), pes etmeden direkt yapıyorum ama her adımı özetliyorum — zorlayıp kullanıcıyı bunaltmamak önemli.
8. Her önemli adımdan sonra **build/run/test** yaparak doğruluyorum (kullanıcıya "çalıştı" demek yerine gerçekten çalıştırıp kanıtlıyorum).

**Kullanıcının kendi yazdığı, benim sadece düzelttiğim şeyler**: 4 tablo (KrediUrunu, Kullanici, KrediBasvuru, KrediHesaplama) T-SQL `CREATE TABLE` komutları — SSMS'te elle yazdı, ben syntax/tasarım hatalarını (trailing comma, eksik parantez, `NVARCHAR` uzunluk unutma, `PRIMARY KEY` unutma, `NOT NULL` unutma, `CHAR` vs `NVARCHAR` farkı) gösterdim, kendisi düzeltti.

**Benim yazdığım, kullanıcının "ben yapamam" dediği şeyler**: .NET proje iskeleti (`dotnet new`, EF Core scaffold komutları), `appsettings.json`/`Program.cs`/`DbContext` konfigürasyonu, ilk Controller (`KrediUrunuController.cs`, sadece GET metodları).

## Şu ana kadar tamamlanan (kronolojik)

1. **Şema tasarımı** (Faz 1) — tamam. 4 tablo, ilişkiler netleşti:
   - `KrediUrunu`: Id, Ad, MinVade, MaksVade, FaizOrani, KKDF, BSMV, MinTutar, MaksTutar
   - `Kullanici`: Id, Ad, Soyad, TcKimlik(CHAR11,UNIQUE), TelNo(CHAR10,UNIQUE), Eposta(UNIQUE)
   - `KrediBasvuru`: Id, KullaniciId(FK), KrediUrunuId(FK), TalepEdilenTutar, TalepEdilenVade, FaizOrani/KKDF/BSMV (ürün tablosundan **snapshot** — kritik tasarım kararı, ürün oranı sonradan değişse bile geçmiş başvuruyu etkilemesin diye), BasvuruTarihi, Durum (NOT NULL, DEFAULT 'Beklemede', CHECK constraint ile 3 değere kısıtlı), RiskSkoru(nullable), KararTarihi(nullable)
   - `KrediHesaplama`: Id, KrediBasvuruId(FK+UNIQUE → 1:1 ilişki), AylikTaksit, ToplamGeriOdeme, ToplamFaizTutari, OlusturmaTarihi
   - Tüm tablolar SSMS'te elle T-SQL ile oluşturuldu (Database-First yaklaşım, EF Core Code-First değil — kullanıcının bilinçli tercihi, "ham SQL öğrenmek istiyorum" dedi).

2. **.NET projesi kuruldu** (Faz 2 başlangıç):
   - `dotnet new sln -n KrediApp`, `dotnet new webapi -n KrediApp.Api -controllers`
   - EF Core paketleri eklendi (SqlServer, Tools, Design)
   - `dotnet ef dbcontext scaffold` ile mevcut SQL tablolarından otomatik entity + DbContext üretildi (`Entities/` klasörü, `KrediAppDbContext.cs`)
   - Connection string `appsettings.json`'a taşındı (`ConnectionStrings:KrediAppDb`), `OnConfiguring`'deki hardcoded string kaldırıldı, `Program.cs`'de `AddDbContext` ile DI'a kaydedildi.
   - İlk Controller (`KrediUrunuController.cs`) yazıldı — sadece `GetAll` (GET tüm kayıtlar) ve `GetById` (GET tek kayıt). Build başarılı, `dotnet run` ile çalıştırılıp `curl http://localhost:5080/api/KrediUrunu` ile test edildi, `[]` (boş ama hatasız) döndü — API↔DB bağlantısı doğrulandı.
   - Kullanıcıya Controller/CRUD/Swagger kavramları konuşma içinde açıklandı (henüz ayrı bir dosyaya yazılmadı).

## Faz 2 tamamlandı (CRUD Controller'lar)

- **`KrediUrunuController`**: GET/GET-by-id/POST/PUT/DELETE — tam CRUD. Doğrulandı.
- **`KullaniciController`**: aynı kalıp (GET/GET-by-id/POST/PUT/DELETE). Doğrulandı.
- **`KrediBasvuruController`**: GET/GET-by-id/POST/DELETE (PUT yok — bilinçli karar, başvuru alanlarının sonradan "güncellenmesi" iş mantığına aykırı, durum değişikliği ayrı bir endpoint olmalı, henüz eklenmedi). POST'ta `KrediBasvuruCreateRequest` DTO'su kullanılıyor (sadece `KullaniciId, KrediUrunuId, TalepEdilenTutar, TalepEdilenVade` alır), sunucu tarafında ürün/kullanıcı varlığı + tutar/vade sınır kontrolleri yapılıyor, `FaizOrani/KKDF/BSMV` üründen **snapshot** olarak kopyalanıyor. Doğrulandı.
- **`KrediHesaplamaController`**: GET/GET-by-id/POST/DELETE. POST'ta `KrediHesaplamaCreateRequest` (sadece `KrediBasvuruId`) — sunucu Fransız amortisman (PMT) formülüyle `AylikTaksit/ToplamGeriOdeme/ToplamFaizTutari`'yı kendisi hesaplayıp kaydediyor (client hesap gönderemiyor). 1:1 ilişki kontrolü (aynı başvuruya iki kez hesaplama yapılamaz) hem kodda hem DB `UNIQUE` kısıtında var. Doğrulandı.

**Test sırasında bulunan ve düzeltilen 2 gerçek hata:**
1. `KrediBasvuru.Durum` CHECK constraint'i "Bekleme" bekliyor, handoff'ta "Beklemede" yazıyordu (SSMS'te tabloyu elle kurarken oluşan tutarsızlık) — kod düzeltildi.
2. EF Core'un çift yönlü navigation property'leri (örn. `KrediUrunu.KrediBasvurus` ↔ `KrediBasvuru.KrediUrunu`) JSON serileştirmede sonsuz döngüye giriyordu — `Program.cs`'e `ReferenceHandler.IgnoreCycles` eklendi (global fix).

**Ayrıca**: Şablon artığı `WeatherForecastController.cs` ve `WeatherForecast.cs` silindi. Proje köküne `KrediApp_Mimari_Dokumani.md` eklendi (eski projenin referans mimarisi — ML pipeline, Producer-Consumer, Angular yapısı gibi ileride işe yarayacak detaylar için).

## Faz 3-4 tamamlandı (Producer-Consumer + BackgroundService)

- **İzole deneme**: `KrediApp.KuyrukDenemesi` adlı ayrı bir console app oluşturuldu (`Microsoft.Extensions.Hosting` paketiyle). `BasvuruKuyrugu` (Channel<int> sarmalayıcı, kapasite 100) + `RiskDegerlendirmeWorker` (BackgroundService) ile pattern denendi, loglardan producer'ın tüketiciyi beklemediği doğrulandı.
- **Gerçek API'ye taşındı**: `KrediApp.Api/BasvuruKuyrugu.cs` ve `KrediApp.Api/RiskDegerlendirmeWorker.cs` eklendi. `Program.cs`'e `AddSingleton<BasvuruKuyrugu>()` + `AddHostedService<RiskDegerlendirmeWorker>()` kaydedildi. `KrediBasvuruController.Create`, kayıt sonrası `_kuyruk.EkleAsync(basvuru.Id)` çağırıyor.
- **Kritik teknik detay**: `RiskDegerlendirmeWorker` (Singleton) constructor'ına `KrediAppDbContext`'i (Scoped) doğrudan alamaz — DI container bunu yasaklar. Çözüm: `IServiceScopeFactory` enjekte edilip her kuyruk öğesi için `scopeFactory.CreateScope()` ile taze bir scope/DbContext açılıyor. Bu Scoped/Singleton çakışması ve çözümü ileride benzer worker'lar yazılırken tekrar karşımıza çıkacak.
- Worker şu an gerçek ML yerine **rastgele risk skoru** üretip mimari dökümandaki eşiklere göre (`<0.10 Onay`, `>0.90 Red`, arası Bekleme) `Durum`/`RiskSkoru`/`KararTarihi` güncelliyor — Faz 5'te gerçek ML modeliyle değiştirilecek "stub" implementasyon.
- Henüz uçtan uca gerçek testi yapılmadı (kullanıcı "şimdilik teste gerek yok" dedi, sıradaki oturumda ilk iş bu olabilir).

## Faz 5 tamamlandı (ML entegrasyonu)

- **`KrediApp.ML`** (class library): `CreditData.cs` (20 özellikli girdi şeması, German Credit Dataset sütunlarına `[LoadColumn]` ile eşleniyor), `CreditPrediction.cs` (çıktı: `PredictedLabel/Probability/Score`), `ModelBuilder.cs` (eğitim pipeline'ı: label mapping → One-Hot Encoding → Concatenate → FastTree → kaydet).
- **`KrediApp.ML.Trainer`** (ayrı console app): eğitimi bir kere çalıştırıp `KrediApp.Api/RiskModel.zip` üretiyor (103KB). API'nin içine konmadı çünkü eğitim nadiren yapılan, zaman alan bir iş.
- **`Program.cs`**: `AddPredictionEnginePool<CreditData, CreditPrediction>().FromFile(..., watchForChanges: true)` — thread-safe tahmin havuzu, model dosyası güncellenirse API yeniden başlamadan otomatik yükler.
- **`RiskDegerlendirmeWorker`**: artık `Random` yerine gerçek `_tahminHavuzu.Predict(girdi)` kullanıyor. **Bilinen kısıt**: `KrediBasvuru` tablomuz sadece `TalepEdilenTutar`/`TalepEdilenVade` topluyor, modelin istediği 20 özellikten 18'i sabit varsayılan kodlarla (`"A14"`, `"A32"` vb.) dolduruluyor — mimari dökümanında da işaretli bir kısıt, ileride form genişletilirse düzeltilebilir.
- Uçtan uca test edildi: POST → anında 201 → 5sn sonra worker gerçek modelden `Probability` üretip `RiskSkoru`/`Durum` güncelledi, SQL loglarından UPDATE doğrulandı.

## Sırada ne var (açık uçlar)

- **Faz 6 (şimdi buradayız)**: Auth sağlamlaştırma + Angular frontend. Eski projede mock auth vardı (`X-Role`/`X-User-Id` header'ları, gerçek JWT yok) — v2'de bu konuda henüz karar verilmedi.
- `KrediBasvuru` için durum güncelleme endpoint'i (`PUT /api/KrediBasvuru/{id}/durum` gibi) henüz yok — worker zaten durumu güncelliyor ama admin'in manuel override etmesi gerekebilir.

## Ortam notları

- SQL Server: yerel, `DORUK_PC` sunucu adı, Windows Authentication, `TrustServerCertificate=True` gerekiyor (SSMS bağlantısında "Sunucu Sertifikasına Güven" işaretlenmeli — yeni SSMS sürümlerinde SSL zorunlu ama local sertifika güvenilir değil).
- Veritabanı adı: `KrediAppV2`.
- API projesi: `C:\Users\doruk\KrediApp-v2\KrediApp.Api`, `dotnet run` ile `http://localhost:5080` üzerinde çalıştırıldı (test amaçlı, kalıcı port değil).
- .NET sürümü: `net10.0` (proje şablonundan geldi, eski projedeki .NET 8'den farklı — kullanıcıya henüz bu fark açıklanmadı, gerekirse belirtilmeli).

## explain-changes skill

`~/.claude/skills/explain-changes/SKILL.md` — otomatik tetiklenir halde duruyor, her kod değişikliğinden sonra "neden bu yaklaşım" açıklaması ekliyor. Bu session'da fiilen kullanılıp kullanılmadığı belirsiz (yukarıdaki manuel açıklamalar zaten benzer işlevi görüyor). Kullanıcı deaktive etmek isterse: `mv ~/.claude/skills/explain-changes ~/.claude/skills/explain-changes.disabled`.
