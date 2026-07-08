import { DecimalPipe } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AmortismanSatiri, amortismanTablosuOlustur } from '../../core/amortisman-tablosu';
import { KrediUrunu, KrediUrunuService } from '../../core/kredi-urunu';
import { PmtSonuc, pmtHesapla } from '../../core/pmt-hesaplama';

@Component({
  selector: 'app-hesaplama',
  imports: [FormsModule, DecimalPipe],
  templateUrl: './hesaplama.html',
  styleUrl: './hesaplama.scss',
})
export class Hesaplama implements OnInit {
  urunler = signal<KrediUrunu[]>([]);
  secilenUrun = signal<KrediUrunu | null>(null);
  krediUrunuId: number | null = null;
  tutar: number | null = null;
  vade: number | null = null;
  sonuc = signal<PmtSonuc | null>(null);
  hataMesaji = signal<string | null>(null);
  uyariMesaji = signal<string | null>(null);
  detayAcik = signal(false);
  amortismanSatirlari = signal<AmortismanSatiri[]>([]);

  private uyariZamanlayici: ReturnType<typeof setTimeout> | null = null;

  constructor(private krediUrunuService: KrediUrunuService) {}

  ngOnInit(): void {
    this.krediUrunuService.tumunuGetir().subscribe((veri) => this.urunler.set(veri));
  }

  urunSecildi(): void {
    const urun = this.urunler().find((u) => u.id === this.krediUrunuId) ?? null;
    this.secilenUrun.set(urun);
    this.hataMesaji.set(null);

    if (urun) {
      this.tutar = urun.minTutar;
      this.vade = urun.minVade;
      this.detayAcik.set(false);
      this.hesapla();
    } else {
      this.sonuc.set(null);
    }
  }

  tutarAdimi(urun: KrediUrunu): number {
    return Math.max(100, Math.round((urun.maksTutar - urun.minTutar) / 100));
  }

  degerDegisti(kaynakKutusu?: HTMLInputElement): void {
    const urun = this.secilenUrun();
    if (!urun) {
      return;
    }

    if (this.tutar !== null) {
      const sinirli = this.sinirlaAraliga(this.tutar, urun.minTutar, urun.maksTutar);
      if (sinirli !== this.tutar) {
        this.tutar = sinirli;
        this.uyariGoster(`Tutar, ürünün ${this.formatSayi(urun.minTutar)} – ${this.formatSayi(urun.maksTutar)} TL aralığına sınırlandırıldı.`);
        if (kaynakKutusu?.name === 'tutar') {
          kaynakKutusu.value = String(sinirli);
        }
      }
    }
    if (this.vade !== null) {
      const sinirli = this.sinirlaAraliga(this.vade, urun.minVade, urun.maksVade);
      if (sinirli !== this.vade) {
        this.vade = sinirli;
        this.uyariGoster(`Vade, ürünün ${urun.minVade} – ${urun.maksVade} ay aralığına sınırlandırıldı.`);
        if (kaynakKutusu?.name === 'vade') {
          kaynakKutusu.value = String(sinirli);
        }
      }
    }

    this.hesapla();

    if (this.detayAcik()) {
      this.detayGuncelle();
    }
  }

  detayGosterKapat(): void {
    if (this.detayAcik()) {
      this.detayAcik.set(false);
      return;
    }

    if (!this.sonuc()) {
      this.uyariGoster('Detayları görmek için önce geçerli bir tutar ve vade seçin.');
      return;
    }

    this.detayGuncelle();
    this.detayAcik.set(true);
  }

  private detayGuncelle(): void {
    const urun = this.secilenUrun();
    if (!urun || !this.tutar || !this.vade) {
      this.amortismanSatirlari.set([]);
      return;
    }

    this.amortismanSatirlari.set(
      amortismanTablosuOlustur({
        anapara: this.tutar,
        vade: this.vade,
        faizOrani: urun.faizOrani,
        kkdf: urun.kkdf,
        bsmv: urun.bsmv,
      }),
    );
  }

  private uyariGoster(mesaj: string): void {
    this.uyariMesaji.set(mesaj);
    if (this.uyariZamanlayici) {
      clearTimeout(this.uyariZamanlayici);
    }
    this.uyariZamanlayici = setTimeout(() => this.uyariMesaji.set(null), 4000);
  }

  private formatSayi(deger: number): string {
    return deger.toLocaleString('tr-TR');
  }

  private sinirlaAraliga(deger: number, min: number, maks: number): number {
    return Math.min(Math.max(deger, min), maks);
  }

  hesapla(): void {
    this.hataMesaji.set(null);

    const urun = this.urunler().find((u) => u.id === this.krediUrunuId);
    if (!urun || !this.tutar || !this.vade || this.tutar <= 0 || this.vade <= 0) {
      this.sonuc.set(null);
      this.hataMesaji.set('Lütfen kredi türü, tutar ve vade seçin.');
      return;
    }

    this.sonuc.set(
      pmtHesapla({
        anapara: this.tutar,
        vade: this.vade,
        faizOrani: urun.faizOrani,
        kkdf: urun.kkdf,
        bsmv: urun.bsmv,
      }),
    );
  }
}
