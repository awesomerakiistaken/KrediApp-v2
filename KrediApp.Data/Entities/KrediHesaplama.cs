using System;
using System.Collections.Generic;

namespace KrediApp.Data.Entities;

public partial class KrediHesaplama
{
    public int Id { get; set; }

    public int KrediBasvuruId { get; set; }

    public decimal AylikTaksit { get; set; }

    public decimal ToplamGeriOdeme { get; set; }

    public decimal ToplamFaizTutari { get; set; }

    public DateTime? OlusturmaTarihi { get; set; }

    public virtual KrediBasvuru KrediBasvuru { get; set; } = null!;
}
