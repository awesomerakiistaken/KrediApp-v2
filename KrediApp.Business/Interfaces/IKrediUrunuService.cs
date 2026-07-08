using KrediApp.Data.Entities;

namespace KrediApp.Business.Interfaces;

public interface IKrediUrunuService
{
    Task<List<KrediUrunu>> TumunuGetirAsync();

    Task<KrediUrunu?> GetirAsync(int id);

    Task<KrediUrunu> OlusturAsync(KrediUrunu urun);

    Task<bool> GuncelleAsync(int id, KrediUrunu urun);

    Task<bool> SilAsync(int id);
}
