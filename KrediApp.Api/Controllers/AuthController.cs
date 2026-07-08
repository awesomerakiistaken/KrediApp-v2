using KrediApp.Business.Interfaces;
using KrediApp.Common.Dtos;
using KrediApp.Common.Exceptions;
using Microsoft.AspNetCore.Mvc;

namespace KrediApp.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;

    public AuthController(IAuthService authService)
    {
        _authService = authService;
    }

    [HttpPost("kayit")]
    public async Task<ActionResult<GirisYaniti>> Kayit(KullaniciKayitRequest istek)
    {
        try
        {
            return Ok(await _authService.KayitOlAsync(istek));
        }
        catch (KrediIsKuraliException hata)
        {
            return BadRequest(hata.Message);
        }
    }

    [HttpPost("giris")]
    public async Task<ActionResult<GirisYaniti>> Giris(KullaniciGirisRequest istek)
    {
        var yanit = await _authService.GirisYapAsync(istek);
        if (yanit == null)
        {
            return Unauthorized("E-posta veya şifre hatalı.");
        }

        return Ok(yanit);
    }
}
