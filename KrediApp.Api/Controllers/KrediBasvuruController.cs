using KrediApp.Business.Interfaces;
using KrediApp.Common.Dtos;
using KrediApp.Common.Exceptions;
using KrediApp.Data.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace KrediApp.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class KrediBasvuruController : ControllerBase
{
    private readonly IKrediBasvuruService _service;

    public KrediBasvuruController(IKrediBasvuruService service)
    {
        _service = service;
    }

    [HttpGet]
    public async Task<ActionResult<List<KrediBasvuru>>> GetAll() =>
        Ok(await _service.TumunuGetirAsync());

    [HttpGet("{id}")]
    public async Task<ActionResult<KrediBasvuru>> GetById(int id)
    {
        var basvuru = await _service.GetirAsync(id);
        return basvuru == null ? NotFound() : Ok(basvuru);
    }

    [HttpPost]
    public async Task<ActionResult<KrediBasvuru>> Create(KrediBasvuruCreateRequest istek)
    {
        try
        {
            var basvuru = await _service.OlusturAsync(istek);
            return CreatedAtAction(nameof(GetById), new { id = basvuru.Id }, basvuru);
        }
        catch (KrediIsKuraliException hata)
        {
            return BadRequest(hata.Message);
        }
    }

    [HttpPut("{id}/durum")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> DurumGuncelle(int id, KrediBasvuruDurumGuncelleRequest istek)
    {
        try
        {
            var basarili = await _service.DurumGuncelleAsync(id, istek);
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
