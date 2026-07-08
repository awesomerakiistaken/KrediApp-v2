using KrediApp.Business.Interfaces;
using KrediApp.Common.Dtos;
using KrediApp.Common.Exceptions;
using KrediApp.Data.Entities;
using Microsoft.AspNetCore.Mvc;

namespace KrediApp.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class KrediHesaplamaController : ControllerBase
{
    private readonly IKrediHesaplamaService _service;

    public KrediHesaplamaController(IKrediHesaplamaService service)
    {
        _service = service;
    }

    [HttpGet]
    public async Task<ActionResult<List<KrediHesaplama>>> GetAll() =>
        Ok(await _service.TumunuGetirAsync());

    [HttpGet("{id}")]
    public async Task<ActionResult<KrediHesaplama>> GetById(int id)
    {
        var hesaplama = await _service.GetirAsync(id);
        return hesaplama == null ? NotFound() : Ok(hesaplama);
    }

    [HttpPost]
    public async Task<ActionResult<KrediHesaplama>> Create(KrediHesaplamaCreateRequest istek)
    {
        try
        {
            var hesaplama = await _service.OlusturAsync(istek.KrediBasvuruId);
            return CreatedAtAction(nameof(GetById), new { id = hesaplama.Id }, hesaplama);
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
