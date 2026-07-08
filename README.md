# KrediApp-v2

Kredi başvuru ve risk değerlendirme sistemi — .NET 10 (N-tier: Api/Business/Data/Common), ML.NET tabanlı otomatik risk skorlama, Angular 21 frontend.

Mimari detaylar ve tasarım kararları için: [KrediApp_Mimari_Dokumani.md](KrediApp_Mimari_Dokumani.md)

## Kurulum

### Ön koşullar
- .NET SDK 10
- Node.js + npm
- MS SQL Server (local instance)

### 1. Veritabanı
`KrediAppV2` adında bir veritabanı oluşturun (şema `KrediApp.Data/KrediAppDbContext.cs`'teki entity konfigürasyonuyla eşleşmeli — `Kullanici`, `KrediUrunu`, `KrediBasvuru`, `KrediHesaplama` tabloları).

### 2. Backend secret'ları
`KrediApp.Api/appsettings.Development.json` dosyasını oluşturun (bu dosya `.gitignore`'da, repo'da yok — gerçek secret'lar asla commit edilmemeli):

```json
{
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Microsoft.AspNetCore": "Warning"
    }
  },
  "ConnectionStrings": {
    "KrediAppDb": "Server=YOUR_SQL_SERVER_INSTANCE;Database=KrediAppV2;Trusted_Connection=True;TrustServerCertificate=True;"
  },
  "Jwt": {
    "SecretKey": "en-az-32-bayt-uzunlugunda-rastgele-bir-anahtar-buraya",
    "Issuer": "KrediApp.Api",
    "Audience": "KrediApp.Client",
    "ExpireMinutes": 60
  }
}
```

### 3. Çalıştırma

```bash
# Backend
cd KrediApp.Api
dotnet run --launch-profile https
# → http://localhost:5089 (HTTP), https://localhost:7028 (HTTPS)

# Frontend (ayrı terminal)
cd kredi-app-client
npm install
npm start
# → http://localhost:4200
```

### 4. ML modelini yeniden eğitmek (opsiyonel)

```bash
cd KrediApp.ML.Trainer
dotnet run
# → KrediApp.Api/RiskModel.zip günceller
```

## Test

```bash
# Backend
dotnet build KrediApp.slnx

# Frontend
cd kredi-app-client
npx ng test --watch=false
```
