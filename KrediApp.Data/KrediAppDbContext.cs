using System;
using System.Collections.Generic;
using KrediApp.Data.Entities;
using Microsoft.EntityFrameworkCore;

namespace KrediApp.Data;

public partial class KrediAppDbContext : DbContext
{
    public KrediAppDbContext()
    {
    }

    public KrediAppDbContext(DbContextOptions<KrediAppDbContext> options)
        : base(options)
    {
    }

    public virtual DbSet<KrediBasvuru> KrediBasvurus { get; set; }

    public virtual DbSet<KrediHesaplama> KrediHesaplamas { get; set; }

    public virtual DbSet<KrediUrunu> KrediUrunus { get; set; }

    public virtual DbSet<Kullanici> Kullanicis { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<KrediBasvuru>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__KrediBas__3214EC271B483330");

            entity.ToTable("KrediBasvuru");

            entity.Property(e => e.Id).HasColumnName("ID");
            entity.Property(e => e.BasvuruTarihi).HasDefaultValueSql("(getdate())");
            entity.Property(e => e.Bsmv)
                .HasColumnType("decimal(5, 4)")
                .HasColumnName("BSMV");
            entity.Property(e => e.Durum)
                .HasMaxLength(20)
                .HasDefaultValue("Beklemede");
            entity.Property(e => e.FaizOrani).HasColumnType("decimal(5, 4)");
            entity.Property(e => e.Kkdf)
                .HasColumnType("decimal(5, 4)")
                .HasColumnName("KKDF");
            entity.Property(e => e.RiskSkoru).HasColumnType("decimal(5, 4)");
            entity.Property(e => e.TalepEdilenTutar).HasColumnType("decimal(18, 2)");

            entity.HasOne(d => d.KrediUrunu).WithMany(p => p.KrediBasvurus)
                .HasForeignKey(d => d.KrediUrunuId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__KrediBasv__Kredi__60A75C0F");

            entity.HasOne(d => d.Kullanici).WithMany(p => p.KrediBasvurus)
                .HasForeignKey(d => d.KullaniciId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__KrediBasv__Kulla__5FB337D6");
        });

        modelBuilder.Entity<KrediHesaplama>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__KrediHes__3214EC07B03F208E");

            entity.ToTable("KrediHesaplama");

            entity.HasIndex(e => e.KrediBasvuruId, "UQ__KrediHes__2E17416545B0A2B1").IsUnique();

            entity.Property(e => e.AylikTaksit).HasColumnType("decimal(18, 4)");
            entity.Property(e => e.OlusturmaTarihi).HasDefaultValueSql("(getdate())");
            entity.Property(e => e.ToplamFaizTutari).HasColumnType("decimal(18, 2)");
            entity.Property(e => e.ToplamGeriOdeme).HasColumnType("decimal(18, 2)");

            entity.HasOne(d => d.KrediBasvuru).WithOne(p => p.KrediHesaplama)
                .HasForeignKey<KrediHesaplama>(d => d.KrediBasvuruId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__KrediHesa__Kredi__656C112C");
        });

        modelBuilder.Entity<KrediUrunu>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__KrediUru__3214EC079ED33838");

            entity.ToTable("KrediUrunu");

            entity.Property(e => e.Ad).HasMaxLength(100);
            entity.Property(e => e.Bsmv)
                .HasColumnType("decimal(5, 4)")
                .HasColumnName("BSMV");
            entity.Property(e => e.FaizOrani).HasColumnType("decimal(5, 4)");
            entity.Property(e => e.Kkdf)
                .HasColumnType("decimal(5, 4)")
                .HasColumnName("KKDF");
            entity.Property(e => e.MaksTutar).HasColumnType("decimal(18, 2)");
            entity.Property(e => e.MinTutar).HasColumnType("decimal(18, 2)");
        });

        modelBuilder.Entity<Kullanici>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__Kullanic__3214EC07AB0FF0F2");

            entity.ToTable("Kullanici");

            entity.HasIndex(e => e.Eposta, "UQ__Kullanic__03ABA3919732F253").IsUnique();

            entity.HasIndex(e => e.TelNo, "UQ__Kullanic__6E5E566A4FF19507").IsUnique();

            entity.HasIndex(e => e.TcKimlik, "UQ__Kullanic__771B5B5985A55DE4").IsUnique();

            entity.Property(e => e.Ad).HasMaxLength(50);
            entity.Property(e => e.Eposta).HasMaxLength(30);
            entity.Property(e => e.Soyad).HasMaxLength(50);
            entity.Property(e => e.TcKimlik)
                .HasMaxLength(11)
                .IsUnicode(false)
                .IsFixedLength();
            entity.Property(e => e.TelNo)
                .HasMaxLength(10)
                .IsUnicode(false)
                .IsFixedLength();
        });

        OnModelCreatingPartial(modelBuilder);
    }

    partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
}
