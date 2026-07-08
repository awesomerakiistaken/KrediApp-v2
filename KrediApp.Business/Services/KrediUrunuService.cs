using KrediApp.Business.Interfaces;
using KrediApp.Data;
using KrediApp.Data.Entities;
using Microsoft.EntityFrameworkCore;

namespace KrediApp.Business.Services;

public class KrediUrunuService : IKrediUrunuService
{
    private readonly KrediAppDbContext _context;

    public KrediUrunuService(KrediAppDbContext context)
    {
        _context = context;
    }

    public async Task<List<KrediUrunu>> TumunuGetirAsync() =>
        await _context.KrediUrunus.ToListAsync();

    public async Task<KrediUrunu?> GetirAsync(int id) =>
        await _context.KrediUrunus.FindAsync(id);

    public async Task<KrediUrunu> OlusturAsync(KrediUrunu urun)
    {
        _context.KrediUrunus.Add(urun);
        await _context.SaveChangesAsync();
        return urun;
    }

    public async Task<bool> GuncelleAsync(int id, KrediUrunu urun)
    {
        var mevcut = await _context.KrediUrunus.FindAsync(id);
        if (mevcut == null)
        {
            return false;
        }

        mevcut.Ad = urun.Ad;
        mevcut.MinVade = urun.MinVade;
        mevcut.MaksVade = urun.MaksVade;
        mevcut.FaizOrani = urun.FaizOrani;
        mevcut.Kkdf = urun.Kkdf;
        mevcut.Bsmv = urun.Bsmv;
        mevcut.MinTutar = urun.MinTutar;
        mevcut.MaksTutar = urun.MaksTutar;

        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> SilAsync(int id)
    {
        var urun = await _context.KrediUrunus.FindAsync(id);
        if (urun == null)
        {
            return false;
        }

        _context.KrediUrunus.Remove(urun);
        await _context.SaveChangesAsync();
        return true;
    }
}
