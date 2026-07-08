using KrediApp.Business.Interfaces;
using KrediApp.Data.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace KrediApp.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class KrediUrunuController : ControllerBase
{
    private readonly IKrediUrunuService _service;

    public KrediUrunuController(IKrediUrunuService service)
    {
        _service = service;
    }

    [HttpGet]
    public async Task<ActionResult<List<KrediUrunu>>> GetAll() =>
        Ok(await _service.TumunuGetirAsync());

    [HttpGet("{id}")]
    public async Task<ActionResult<KrediUrunu>> GetById(int id)
    {
        var urun = await _service.GetirAsync(id);
        return urun == null ? NotFound() : Ok(urun);
    }

    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<KrediUrunu>> Create(KrediUrunu urun)
    {
        var olusturulan = await _service.OlusturAsync(urun);
        return CreatedAtAction(nameof(GetById), new { id = olusturulan.Id }, olusturulan);
    }

    [HttpPut("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Update(int id, KrediUrunu urun)
    {
        if (id != urun.Id)
        {
            return BadRequest();
        }

        var basarili = await _service.GuncelleAsync(id, urun);
        return basarili ? NoContent() : NotFound();
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Delete(int id)
    {
        var basarili = await _service.SilAsync(id);
        return basarili ? NoContent() : NotFound();
    }
}
