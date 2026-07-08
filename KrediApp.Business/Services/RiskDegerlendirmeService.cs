using KrediApp.Business.Interfaces;
using KrediApp.Data;
using KrediApp.ML;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.ML;

namespace KrediApp.Business.Services;

public class RiskDegerlendirmeService : IRiskDegerlendirmeService
{
    private readonly KrediAppDbContext _context;
    private readonly PredictionEnginePool<CreditData, CreditPrediction> _tahminHavuzu;
    private readonly ILogger<RiskDegerlendirmeService> _logger;

    public RiskDegerlendirmeService(
        KrediAppDbContext context,
        PredictionEnginePool<CreditData, CreditPrediction> tahminHavuzu,
        ILogger<RiskDegerlendirmeService> logger)
    {
        _context = context;
        _tahminHavuzu = tahminHavuzu;
        _logger = logger;
    }

    public async Task DegerlendirVeGuncelleAsync(int basvuruId, CancellationToken iptalToken)
    {
        var basvuru = await _context.KrediBasvurus.FindAsync(new object?[] { basvuruId }, iptalToken);
        if (basvuru == null)
        {
            _logger.LogWarning("Başvuru {Id} bulunamadı, atlanıyor.", basvuruId);
            return;
        }

        // Başvuru formumuz German Credit Dataset'in 20 özelliğinin tamamını toplamıyor;
        // elimizde olmayan özellikler sabit/varsayılan kategorik kodlarla dolduruluyor
        // (bilinen kısıt — mimari dökümanında da işaretli).
        var girdi = new CreditData
        {
            StatusOfExistingCheckingAccount = "A14", // hesap bilgisi yok
            DurationInMonths = basvuru.TalepEdilenVade,
            CreditHistory = "A32", // varsayılan: mevcut kredileri düzenli ödemiş
            Purpose = "A40",
            CreditAmount = (float)basvuru.TalepEdilenTutar,
            SavingsAccount = "A65", // bilinmiyor
            PresentEmploymentSince = "A73",
            InstallmentRateInPercentageOfDisposableIncome = 4,
            PersonalStatusAndSex = "A93",
            OtherDebtorsGuarantors = "A101",
            PresentResidenceSince = 4,
            Property = "A121",
            AgeInYears = 35,
            OtherInstallmentPlans = "A143",
            Housing = "A152",
            NumberOfExistingCreditsAtThisBank = 1,
            Job = "A173",
            NumberOfPeopleBeingLiableToProvideMaintenanceFor = 1,
            Telephone = "A192",
            ForeignWorker = "A201"
        };

        var tahmin = _tahminHavuzu.Predict(girdi);
        var riskSkoru = (decimal)tahmin.Probability;

        basvuru.RiskSkoru = riskSkoru;
        basvuru.Durum = riskSkoru < 0.10m ? "Onaylandı" : riskSkoru > 0.90m ? "Reddedildi" : "Bekleme";
        basvuru.KararTarihi = basvuru.Durum == "Bekleme" ? null : DateTime.Now;

        await _context.SaveChangesAsync(iptalToken);
        _logger.LogInformation("Başvuru {Id} değerlendirildi: RiskSkoru={Risk}, Durum={Durum}", basvuruId, riskSkoru, basvuru.Durum);
    }
}
