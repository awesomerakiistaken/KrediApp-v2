using KrediApp.Common.Dtos;

namespace KrediApp.Business.Interfaces;

public interface IAuthService
{
    Task<GirisYaniti> KayitOlAsync(KullaniciKayitRequest istek);

    Task<GirisYaniti?> GirisYapAsync(KullaniciGirisRequest istek);
}
