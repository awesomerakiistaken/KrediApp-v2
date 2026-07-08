using System;
using System.Collections.Generic;

namespace KrediApp.Data.Entities;

public partial class KrediUrunu
{
    public int Id { get; set; }

    public string Ad { get; set; } = null!;

    public int MinVade { get; set; }

    public int MaksVade { get; set; }

    public decimal FaizOrani { get; set; }

    public decimal Kkdf { get; set; }

    public decimal Bsmv { get; set; }

    public decimal MinTutar { get; set; }

    public decimal MaksTutar { get; set; }

    public virtual ICollection<KrediBasvuru> KrediBasvurus { get; set; } = new List<KrediBasvuru>();
}
