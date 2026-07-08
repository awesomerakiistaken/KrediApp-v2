using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using KrediApp.Business.Interfaces;
using KrediApp.Business.Telefon;
using KrediApp.Common.Dtos;
using KrediApp.Common.Exceptions;
using KrediApp.Data;
using KrediApp.Data.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;

namespace KrediApp.Business.Services;

public class AuthService : IAuthService
{
    private readonly KrediAppDbContext _context;
    private readonly IConfiguration _configuration;

    public AuthService(KrediAppDbContext context, IConfiguration configuration)
    {
        _context = context;
        _configuration = configuration;
    }

    public async Task<GirisYaniti> KayitOlAsync(KullaniciKayitRequest istek)
    {
        var epostaKullanimda = await _context.Kullanicis.AnyAsync(k => k.Eposta == istek.Eposta);
        if (epostaKullanimda)
        {
            throw new KrediIsKuraliException("Bu e-posta adresi zaten kayıtlı.");
        }

        if (!TelefonNumarasi.Normallestir(istek.TelNo, out var telNo))
        {
            throw new KrediIsKuraliException("Telefon numarası 10 haneli olmalıdır (başında 0 olsun ya da olmasın).");
        }

        if (await _context.Kullanicis.AnyAsync(k => k.TelNo == telNo))
        {
            throw new KrediIsKuraliException("Bu telefon numarası zaten kayıtlı.");
        }

        if (await _context.Kullanicis.AnyAsync(k => k.TcKimlik == istek.TcKimlik))
        {
            throw new KrediIsKuraliException("Bu TC kimlik numarası zaten kayıtlı.");
        }

        var kullanici = new Kullanici
        {
            Ad = istek.Ad,
            Soyad = istek.Soyad,
            TcKimlik = istek.TcKimlik,
            TelNo = telNo,
            Eposta = istek.Eposta,
            SifreHash = BCrypt.Net.BCrypt.HashPassword(istek.Sifre),
            Rol = "User"
        };

        _context.Kullanicis.Add(kullanici);
        await _context.SaveChangesAsync();

        var token = TokenUret(kullanici);
        return new GirisYaniti(token, kullanici.Ad, kullanici.Rol);
    }

    public async Task<GirisYaniti?> GirisYapAsync(KullaniciGirisRequest istek)
    {
        var kullanici = await _context.Kullanicis.FirstOrDefaultAsync(k => k.Eposta == istek.Eposta);
        if (kullanici == null || !BCrypt.Net.BCrypt.Verify(istek.Sifre, kullanici.SifreHash))
        {
            return null;
        }

        var token = TokenUret(kullanici);
        return new GirisYaniti(token, kullanici.Ad, kullanici.Rol);
    }

    private string TokenUret(Kullanici kullanici)
    {
        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, kullanici.Id.ToString()),
            new Claim(ClaimTypes.Name, $"{kullanici.Ad} {kullanici.Soyad}"),
            new Claim(ClaimTypes.Role, kullanici.Rol)
        };

        var anahtar = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["Jwt:SecretKey"]!));
        var imzalamaBilgisi = new SigningCredentials(anahtar, SecurityAlgorithms.HmacSha256);

        var token = new JwtSecurityToken(
            issuer: _configuration["Jwt:Issuer"],
            audience: _configuration["Jwt:Audience"],
            claims: claims,
            expires: DateTime.UtcNow.AddMinutes(double.Parse(_configuration["Jwt:ExpireMinutes"]!)),
            signingCredentials: imzalamaBilgisi);

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}
