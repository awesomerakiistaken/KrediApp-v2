using System;
using System.Collections.Generic;

namespace KrediApp.Data.Entities;

public partial class KrediBasvuru
{
    public int Id { get; set; }

    public int KullaniciId { get; set; }

    public int KrediUrunuId { get; set; }

    public decimal TalepEdilenTutar { get; set; }

    public int TalepEdilenVade { get; set; }

    public decimal FaizOrani { get; set; }

    public decimal Kkdf { get; set; }

    public decimal Bsmv { get; set; }

    public DateTime BasvuruTarihi { get; set; }

    public string Durum { get; set; } = null!;

    public decimal? RiskSkoru { get; set; }

    public DateTime? KararTarihi { get; set; }

    public virtual KrediHesaplama? KrediHesaplama { get; set; }

    public virtual KrediUrunu KrediUrunu { get; set; } = null!;

    public virtual Kullanici Kullanici { get; set; } = null!;
}
