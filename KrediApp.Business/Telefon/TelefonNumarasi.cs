namespace KrediApp.Business.Telefon;

/// <summary>
/// Kullanıcı telefon numarasını kanonik forma çevirir: rakam dışı karakterleri temizler,
/// Türkiye formatındaki baştaki tek "0"ı atar, tam 10 hane olmasını zorunlu kılar.
/// Daha önce AuthController ve KullaniciController'da ayrı ayrı kopyalanmıştı (mimari
/// incelemede bulunan tekrar) — kayıt formunda 11 haneli girişin veritabanı truncation
/// hatası vermesine yol açmıştı. Artık tek kanonik yer burası.
/// </summary>
public static class TelefonNumarasi
{
    public static bool Normallestir(string? telNo, out string sonuc)
    {
        var rakamlar = new string((telNo ?? string.Empty).Where(char.IsDigit).ToArray());

        if (rakamlar.Length == 11 && rakamlar.StartsWith('0'))
        {
            rakamlar = rakamlar[1..];
        }

        if (rakamlar.Length != 10)
        {
            sonuc = string.Empty;
            return false;
        }

        sonuc = rakamlar;
        return true;
    }
}
