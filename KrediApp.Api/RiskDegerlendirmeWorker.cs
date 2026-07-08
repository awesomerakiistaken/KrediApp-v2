using KrediApp.Business.Interfaces;
using KrediApp.Business.Kuyruk;

namespace KrediApp.Api;

public class RiskDegerlendirmeWorker : BackgroundService
{
    private readonly BasvuruKuyrugu _kuyruk;
    private readonly IServiceScopeFactory _scopeFactory;
    private readonly ILogger<RiskDegerlendirmeWorker> _logger;

    public RiskDegerlendirmeWorker(
        BasvuruKuyrugu kuyruk,
        IServiceScopeFactory scopeFactory,
        ILogger<RiskDegerlendirmeWorker> logger)
    {
        _kuyruk = kuyruk;
        _scopeFactory = scopeFactory;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken iptalToken)
    {
        _logger.LogInformation("Risk değerlendirme worker'ı başladı, kuyruğu dinliyor...");

        while (!iptalToken.IsCancellationRequested)
        {
            var basvuruId = await _kuyruk.AlAsync(iptalToken);
            _logger.LogInformation("Başvuru {Id} kuyruktan alındı, risk değerlendiriliyor...", basvuruId);

            using var scope = _scopeFactory.CreateScope();
            var risk = scope.ServiceProvider.GetRequiredService<IRiskDegerlendirmeService>();
            await risk.DegerlendirVeGuncelleAsync(basvuruId, iptalToken);
        }
    }
}
