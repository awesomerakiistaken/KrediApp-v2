using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

namespace KrediApp.KuyrukDenemesi;

public class RiskDegerlendirmeWorker : BackgroundService
{
    private readonly BasvuruKuyrugu _kuyruk;
    private readonly ILogger<RiskDegerlendirmeWorker> _logger;

    public RiskDegerlendirmeWorker(BasvuruKuyrugu kuyruk, ILogger<RiskDegerlendirmeWorker> logger)
    {
        _kuyruk = kuyruk;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken iptalToken)
    {
        _logger.LogInformation("Worker başladı, kuyruğu dinliyor...");

        while (!iptalToken.IsCancellationRequested)
        {
            var basvuruId = await _kuyruk.AlAsync(iptalToken);
            _logger.LogInformation("Başvuru {Id} kuyruktan alındı, risk değerlendiriliyor...", basvuruId);

            await Task.Delay(1500, iptalToken); // gerçek ML tahmini simülasyonu

            _logger.LogInformation("Başvuru {Id} için risk değerlendirmesi tamamlandı.", basvuruId);
        }
    }
}
