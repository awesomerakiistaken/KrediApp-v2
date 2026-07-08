using KrediApp.Business.Interfaces;
using KrediApp.Common.Exceptions;
using KrediApp.Data.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace KrediApp.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Admin")]
public class KullaniciController : ControllerBase
{
    private readonly IKullaniciService _service;

    public KullaniciController(IKullaniciService service)
    {
        _service = service;
    }

    [HttpGet]
    public async Task<ActionResult<List<Kullanici>>> GetAll() =>
        Ok(await _service.TumunuGetirAsync());

    [HttpGet("{id}")]
    public async Task<ActionResult<Kullanici>> GetById(int id)
    {
        var kullanici = await _service.GetirAsync(id);
        return kullanici == null ? NotFound() : Ok(kullanici);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, Kullanici kullanici)
    {
        if (id != kullanici.Id)
        {
            return BadRequest();
        }

        try
        {
            var basarili = await _service.GuncelleAsync(id, kullanici);
            return basarili ? NoContent() : NotFound();
        }
        catch (KrediIsKuraliException hata)
        {
            return BadRequest(hata.Message);
        }
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var basarili = await _service.SilAsync(id);
        return basarili ? NoContent() : NotFound();
    }
}
