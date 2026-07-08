import { DatePipe, DecimalPipe } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AmortismanSatiri, amortismanTablosuOlustur } from '../../core/amortisman-tablosu';
import { durumSinifi } from '../../core/durum-yardimci';
import { KrediBasvuru, KrediBasvuruService } from '../../core/kredi-basvuru';
import { raporuExcelOlarakIndir, raporuPdfOlarakIndir } from '../../core/rapor-disa-aktar';

@Component({
  selector: 'app-raporlar',
  imports: [FormsModule, DatePipe, DecimalPipe],
  templateUrl: './raporlar.html',
  styleUrl: './raporlar.scss',
})
export class Raporlar implements OnInit {
  basvurular = signal<KrediBasvuru[]>([]);
  yukleniyor = signal(true);
  acikBasvuruId = signal<number | null>(null);
  durumSinifi = durumSinifi;

  aramaMetni = '';
  durumFiltresi = 'Tümü';
  krediTuruFiltresi = 'Tümü';
  baslangicTarihi = '';
  bitisTarihi = '';

  filtrelenmisBasvurular(): KrediBasvuru[] {
    const arama = this.aramaMetni.trim().toLocaleLowerCase('tr-TR');

    return this.basvurular().filter((b) => {
      const adSoyad = `${b.kullanici?.ad ?? ''} ${b.kullanici?.soyad ?? ''}`.toLocaleLowerCase('tr-TR');
      const aramaUyuyor =
        !arama || adSoyad.includes(arama) || (b.kullanici?.tcKimlik ?? '').includes(arama);

      const durumUyuyor = this.durumFiltresi === 'Tümü' || b.durum === this.durumFiltresi;
      const turUyuyor = this.krediTuruFiltresi === 'Tümü' || b.krediUrunu?.ad === this.krediTuruFiltresi;

      const tarih = new Date(b.basvuruTarihi);
      const baslangicUyuyor = !this.baslangicTarihi || tarih >= new Date(this.baslangicTarihi);
      const bitisUyuyor = !this.bitisTarihi || tarih <= new Date(this.bitisTarihi + 'T23:59:59');

      return aramaUyuyor && durumUyuyor && turUyuyor && baslangicUyuyor && bitisUyuyor;
    });
  }

  krediTurleri(): string[] {
    const turler = new Set(this.basvurular().map((b) => b.krediUrunu?.ad).filter((ad): ad is string => !!ad));
    return Array.from(turler);
  }

  constructor(private krediBasvuruService: KrediBasvuruService) {}

  ngOnInit(): void {
    this.krediBasvuruService.tumunuGetir().subscribe({
      next: (veri) => {
        const enYeniden = [...veri].sort(
          (a, b) => new Date(b.basvuruTarihi).getTime() - new Date(a.basvuruTarihi).getTime(),
        );
        this.basvurular.set(enYeniden);
        this.yukleniyor.set(false);
      },
      error: () => this.yukleniyor.set(false),
    });
  }

  detayiAcKapat(id: number): void {
    this.acikBasvuruId.set(this.acikBasvuruId() === id ? null : id);
  }

  amortismanTablosu(basvuru: KrediBasvuru): AmortismanSatiri[] {
    return amortismanTablosuOlustur({
      anapara: basvuru.talepEdilenTutar,
      vade: basvuru.talepEdilenVade,
      faizOrani: basvuru.faizOrani,
      kkdf: basvuru.kkdf,
      bsmv: basvuru.bsmv,
    });
  }

  durumGuncelle(basvuru: KrediBasvuru, durum: 'Onaylandı' | 'Reddedildi'): void {
    this.krediBasvuruService.durumGuncelle(basvuru.id, durum).subscribe(() => {
      this.basvurular.update((mevcut) =>
        mevcut.map((b) => (b.id === basvuru.id ? { ...b, durum } : b)),
      );
    });
  }

  pdfIndir(): void {
    raporuPdfOlarakIndir(this.filtrelenmisBasvurular());
  }

  excelIndir(): void {
    raporuExcelOlarakIndir(this.filtrelenmisBasvurular());
  }
}
