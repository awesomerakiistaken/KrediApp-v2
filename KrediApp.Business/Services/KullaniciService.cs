using KrediApp.Business.Interfaces;
using KrediApp.Business.Telefon;
using KrediApp.Common.Exceptions;
using KrediApp.Data;
using KrediApp.Data.Entities;
using Microsoft.EntityFrameworkCore;

namespace KrediApp.Business.Services;

public class KullaniciService : IKullaniciService
{
    private readonly KrediAppDbContext _context;

    public KullaniciService(KrediAppDbContext context)
    {
        _context = context;
    }

    public async Task<List<Kullanici>> TumunuGetirAsync() =>
        await _context.Kullanicis.ToListAsync();

    public async Task<Kullanici?> GetirAsync(int id) =>
        await _context.Kullanicis.FindAsync(id);

    public async Task<bool> GuncelleAsync(int id, Kullanici kullanici)
    {
        var mevcut = await _context.Kullanicis.FindAsync(id);
        if (mevcut == null)
        {
            return false;
        }

        if (!TelefonNumarasi.Normallestir(kullanici.TelNo, out var telNo))
        {
            throw new KrediIsKuraliException("Telefon numarası 10 haneli olmalıdır (başında 0 olsun ya da olmasın).");
        }

        mevcut.Ad = kullanici.Ad;
        mevcut.Soyad = kullanici.Soyad;
        mevcut.TcKimlik = kullanici.TcKimlik;
        mevcut.TelNo = telNo;
        mevcut.Eposta = kullanici.Eposta;

        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> SilAsync(int id)
    {
        var kullanici = await _context.Kullanicis.FindAsync(id);
        if (kullanici == null)
        {
            return false;
        }

        _context.Kullanicis.Remove(kullanici);
        await _context.SaveChangesAsync();
        return true;
    }
}
