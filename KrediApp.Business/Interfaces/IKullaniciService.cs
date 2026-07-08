using KrediApp.Data.Entities;

namespace KrediApp.Business.Interfaces;

public interface IKullaniciService
{
    Task<List<Kullanici>> TumunuGetirAsync();

    Task<Kullanici?> GetirAsync(int id);

    /// <summary>Başarısızsa false döner (mevcut bulunamadı).</summary>
    Task<bool> GuncelleAsync(int id, Kullanici kullanici);

    Task<bool> SilAsync(int id);
}
