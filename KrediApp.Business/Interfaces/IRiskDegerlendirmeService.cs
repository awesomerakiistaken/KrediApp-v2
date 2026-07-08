namespace KrediApp.Business.Interfaces;

public interface IRiskDegerlendirmeService
{
    /// <summary>ML modelini çalıştırır, başvurunun RiskSkoru/Durum/KararTarihi alanlarını günceller ve kaydeder.</summary>
    Task DegerlendirVeGuncelleAsync(int basvuruId, CancellationToken iptalToken);
}
