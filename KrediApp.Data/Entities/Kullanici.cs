using System;
using System.Collections.Generic;
using System.Text.Json.Serialization;

namespace KrediApp.Data.Entities;

public partial class Kullanici
{
    public int Id { get; set; }

    public string Ad { get; set; } = null!;

    public string Soyad { get; set; } = null!;

    public string TcKimlik { get; set; } = null!;

    public string TelNo { get; set; } = null!;

    public string Eposta { get; set; } = null!;

    [JsonIgnore]
    public string SifreHash { get; set; } = null!;

    public string Rol { get; set; } = null!;

    public virtual ICollection<KrediBasvuru> KrediBasvurus { get; set; } = new List<KrediBasvuru>();
}
