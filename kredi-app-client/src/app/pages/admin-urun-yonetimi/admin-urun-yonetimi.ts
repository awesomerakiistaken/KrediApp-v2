import { DecimalPipe } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { KrediUrunu, KrediUrunuFormu, KrediUrunuService } from '../../core/kredi-urunu';

const BOS_FORM: KrediUrunuFormu = {
  ad: '',
  minVade: 1,
  maksVade: 12,
  faizOrani: 0,
  kkdf: 0,
  bsmv: 0,
  minTutar: 0,
  maksTutar: 0,
};

@Component({
  selector: 'app-admin-urun-yonetimi',
  imports: [FormsModule, DecimalPipe],
  templateUrl: './admin-urun-yonetimi.html',
  styleUrl: './admin-urun-yonetimi.scss',
})
export class AdminUrunYonetimi implements OnInit {
  urunler = signal<KrediUrunu[]>([]);
  form: KrediUrunuFormu = { ...BOS_FORM };
  hataMesaji = signal<string | null>(null);
  basariMesaji = signal<string | null>(null);
  kaydediliyor = signal(false);

  private basariZamanlayici: ReturnType<typeof setTimeout> | null = null;

  constructor(private krediUrunuService: KrediUrunuService) {}

  ngOnInit(): void {
    this.krediUrunuService.tumunuGetir().subscribe((veri) => this.urunler.set(veri));
  }

  kaydet(): void {
    if (this.kaydediliyor()) {
      return;
    }

    this.hataMesaji.set(null);

    if (this.form.minVade >= this.form.maksVade) {
      this.hataMesaji.set('Min vade, maks vadeden küçük olmalıdır.');
      return;
    }
    if (this.form.minTutar >= this.form.maksTutar) {
      this.hataMesaji.set('Min tutar, maks tutardan küçük olmalıdır.');
      return;
    }

    this.kaydediliyor.set(true);
    this.krediUrunuService.olustur(this.form).subscribe({
      next: (yeniUrun) => {
        this.urunler.update((mevcut) => [...mevcut, yeniUrun]);
        this.form = { ...BOS_FORM };
        this.kaydediliyor.set(false);
        this.basariMesajiGoster(`"${yeniUrun.ad}" ürünü eklendi.`);
      },
      error: (hata) => {
        this.hataMesaji.set(hata.error ?? 'Ürün oluşturulamadı.');
        this.kaydediliyor.set(false);
      },
    });
  }

  private basariMesajiGoster(mesaj: string): void {
    this.basariMesaji.set(mesaj);
    if (this.basariZamanlayici) {
      clearTimeout(this.basariZamanlayici);
    }
    this.basariZamanlayici = setTimeout(() => this.basariMesaji.set(null), 3000);
  }

  sil(id: number): void {
    const urun = this.urunler().find((u) => u.id === id);
    if (!urun || !confirm(`"${urun.ad}" ürününü silmek istediğine emin misin?`)) {
      return;
    }

    this.krediUrunuService.sil(id).subscribe(() => {
      this.urunler.update((mevcut) => mevcut.filter((u) => u.id !== id));
    });
  }
}
