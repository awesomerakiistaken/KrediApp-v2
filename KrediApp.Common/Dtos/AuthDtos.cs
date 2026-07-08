namespace KrediApp.Common.Dtos;

public record KullaniciKayitRequest(string Ad, string Soyad, string TcKimlik, string TelNo, string Eposta, string Sifre);

public record KullaniciGirisRequest(string Eposta, string Sifre);

public record GirisYaniti(string Token, string Ad, string Rol);
