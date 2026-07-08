namespace KrediApp.Common.Dtos;

public record KrediBasvuruCreateRequest(int KullaniciId, int KrediUrunuId, decimal TalepEdilenTutar, int TalepEdilenVade);

public record KrediBasvuruDurumGuncelleRequest(string Durum);
