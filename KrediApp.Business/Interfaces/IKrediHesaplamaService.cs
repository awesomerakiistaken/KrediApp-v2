using KrediApp.Data.Entities;

namespace KrediApp.Business.Interfaces;

public interface IKrediHesaplamaService
{
    Task<List<KrediHesaplama>> TumunuGetirAsync();

    Task<KrediHesaplama?> GetirAsync(int id);

    /// <summary>İş kuralı ihlallerinde (başvuru yok / zaten hesaplanmış) KrediIsKuraliException fırlatır.</summary>
    Task<KrediHesaplama> OlusturAsync(int krediBasvuruId);

    Task<bool> SilAsync(int id);
}
