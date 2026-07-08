using KrediApp.Common.Dtos;
using KrediApp.Data.Entities;

namespace KrediApp.Business.Interfaces;

public interface IKrediBasvuruService
{
    Task<List<KrediBasvuru>> TumunuGetirAsync();

    Task<KrediBasvuru?> GetirAsync(int id);

    /// <summary>Aralık/varlık ihlallerinde KrediIsKuraliException fırlatır.</summary>
    Task<KrediBasvuru> OlusturAsync(KrediBasvuruCreateRequest istek);

    /// <summary>Başvuru bulunamazsa false döner.</summary>
    Task<bool> DurumGuncelleAsync(int id, KrediBasvuruDurumGuncelleRequest istek);

    Task<bool> SilAsync(int id);
}
