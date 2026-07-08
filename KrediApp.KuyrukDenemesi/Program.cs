using KrediApp.KuyrukDenemesi;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

var host = Host.CreateDefaultBuilder(args)
    .ConfigureServices(services =>
    {
        services.AddSingleton<BasvuruKuyrugu>();
        services.AddHostedService<RiskDegerlendirmeWorker>();
    })
    .Build();

_ = host.RunAsync();

var kuyruk = host.Services.GetRequiredService<BasvuruKuyrugu>();
var logger = host.Services.GetRequiredService<ILogger<Program>>();

for (int basvuruId = 1; basvuruId <= 5; basvuruId++)
{
    logger.LogInformation("Producer: Başvuru {Id} kuyruğa ekleniyor.", basvuruId);
    await kuyruk.EkleAsync(basvuruId);
    await Task.Delay(300); // başvurular art arda hızlıca geliyor gibi simüle ediyoruz
}

logger.LogInformation("Producer: Tüm başvurular kuyruğa eklendi, worker'ın bitirmesi bekleniyor...");
await Task.Delay(10000); // worker'ın kuyruktaki 5 işi bitirmesine yetecek süre
