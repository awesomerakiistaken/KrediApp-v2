using KrediApp.Business.Interfaces;
using KrediApp.Common.Exceptions;
using KrediApp.Data;
using KrediApp.Data.Entities;
using Microsoft.EntityFrameworkCore;

namespace KrediApp.Business.Services;

public class KrediHesaplamaService : IKrediHesaplamaService
{
    private readonly KrediAppDbContext _context;

    public KrediHesaplamaService(KrediAppDbContext context)
    {
        _context = context;
    }

    public async Task<List<KrediHesaplama>> TumunuGetirAsync() =>
        await _context.KrediHesaplamas.ToListAsync();

    public async Task<KrediHesaplama?> GetirAsync(int id) =>
        await _context.KrediHesaplamas.FindAsync(id);

    public async Task<KrediHesaplama> OlusturAsync(int krediBasvuruId)
    {
        var basvuru = await _context.KrediBasvurus.FindAsync(krediBasvuruId);
        if (basvuru == null)
        {
            throw new KrediIsKuraliException("Belirtilen KrediBasvuruId bulunamadı.");
        }

        var mevcutHesaplama = await _context.KrediHesaplamas
            .FirstOrDefaultAsync(h => h.KrediBasvuruId == krediBasvuruId);
        if (mevcutHesaplama != null)
        {
            throw new KrediIsKuraliException("Bu başvuru için zaten bir hesaplama yapılmış.");
        }

        // Fransız amortisman yöntemi: FaizOrani, başvuruda snapshot alınmış aylık orandır.
        var aylikFaizOrani = basvuru.FaizOrani;
        var efektifOran = aylikFaizOrani * (1 + basvuru.Bsmv + basvuru.Kkdf);
        var n = basvuru.TalepEdilenVade;
        var anapara = basvuru.TalepEdilenTutar;

        var carpan = (double)Math.Pow((double)(1 + efektifOran), n);
        var aylikTaksit = anapara * (efektifOran * (decimal)carpan) / ((decimal)carpan - 1);
        var toplamGeriOdeme = aylikTaksit * n;
        var toplamFaizTutari = toplamGeriOdeme - anapara;

        var hesaplama = new KrediHesaplama
        {
            KrediBasvuruId = krediBasvuruId,
            AylikTaksit = Math.Round(aylikTaksit, 2),
            ToplamGeriOdeme = Math.Round(toplamGeriOdeme, 2),
            ToplamFaizTutari = Math.Round(toplamFaizTutari, 2),
            OlusturmaTarihi = DateTime.Now
        };

        _context.KrediHesaplamas.Add(hesaplama);
        await _context.SaveChangesAsync();
        return hesaplama;
    }

    public async Task<bool> SilAsync(int id)
    {
        var hesaplama = await _context.KrediHesaplamas.FindAsync(id);
        if (hesaplama == null)
        {
            return false;
        }

        _context.KrediHesaplamas.Remove(hesaplama);
        await _context.SaveChangesAsync();
        return true;
    }
}
