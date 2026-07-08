using KrediApp.Business.Interfaces;
using KrediApp.Business.Kuyruk;
using KrediApp.Common.Dtos;
using KrediApp.Common.Exceptions;
using KrediApp.Data;
using KrediApp.Data.Entities;
using Microsoft.EntityFrameworkCore;

namespace KrediApp.Business.Services;

public class KrediBasvuruService : IKrediBasvuruService
{
    private readonly KrediAppDbContext _context;
    private readonly BasvuruKuyrugu _kuyruk;

    public KrediBasvuruService(KrediAppDbContext context, BasvuruKuyrugu kuyruk)
    {
        _context = context;
        _kuyruk = kuyruk;
    }

    public async Task<List<KrediBasvuru>> TumunuGetirAsync() =>
        await _context.KrediBasvurus
            .Include(b => b.Kullanici)
            .Include(b => b.KrediUrunu)
            .ToListAsync();

    public async Task<KrediBasvuru?> GetirAsync(int id) =>
        await _context.KrediBasvurus.FindAsync(id);

    public async Task<KrediBasvuru> OlusturAsync(KrediBasvuruCreateRequest istek)
    {
        var urun = await _context.KrediUrunus.FindAsync(istek.KrediUrunuId);
        if (urun == null)
        {
            throw new KrediIsKuraliException("Belirtilen KrediUrunuId bulunamadı.");
        }

        var kullanici = await _context.Kullanicis.FindAsync(istek.KullaniciId);
        if (kullanici == null)
        {
            throw new KrediIsKuraliException("Belirtilen KullaniciId bulunamadı.");
        }

        if (istek.TalepEdilenTutar < urun.MinTutar || istek.TalepEdilenTutar > urun.MaksTutar)
        {
            throw new KrediIsKuraliException($"Talep edilen tutar, ürünün {urun.MinTutar}-{urun.MaksTutar} aralığı dışında.");
        }

        if (istek.TalepEdilenVade < urun.MinVade || istek.TalepEdilenVade > urun.MaksVade)
        {
            throw new KrediIsKuraliException($"Talep edilen vade, ürünün {urun.MinVade}-{urun.MaksVade} aralığı dışında.");
        }

        var basvuru = new KrediBasvuru
        {
            KullaniciId = istek.KullaniciId,
            KrediUrunuId = istek.KrediUrunuId,
            TalepEdilenTutar = istek.TalepEdilenTutar,
            TalepEdilenVade = istek.TalepEdilenVade,
            FaizOrani = urun.FaizOrani,
            Kkdf = urun.Kkdf,
            Bsmv = urun.Bsmv,
            BasvuruTarihi = DateTime.Now,
            Durum = "Bekleme"
        };

        _context.KrediBasvurus.Add(basvuru);
        await _context.SaveChangesAsync();

        await _kuyruk.EkleAsync(basvuru.Id);

        return basvuru;
    }

    public async Task<bool> DurumGuncelleAsync(int id, KrediBasvuruDurumGuncelleRequest istek)
    {
        if (istek.Durum != "Onaylandı" && istek.Durum != "Reddedildi")
        {
            throw new KrediIsKuraliException("Durum yalnızca 'Onaylandı' veya 'Reddedildi' olabilir.");
        }

        var basvuru = await _context.KrediBasvurus.FindAsync(id);
        if (basvuru == null)
        {
            return false;
        }

        basvuru.Durum = istek.Durum;
        basvuru.KararTarihi = DateTime.Now;
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> SilAsync(int id)
    {
        var basvuru = await _context.KrediBasvurus.FindAsync(id);
        if (basvuru == null)
        {
            return false;
        }

        _context.KrediBasvurus.Remove(basvuru);
        await _context.SaveChangesAsync();
        return true;
    }
}
