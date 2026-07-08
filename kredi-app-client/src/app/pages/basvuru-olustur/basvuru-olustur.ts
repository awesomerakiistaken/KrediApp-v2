import { DecimalPipe } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Auth } from '../../core/auth';
import { KrediBasvuruService } from '../../core/kredi-basvuru';
import { KrediUrunu, KrediUrunuService } from '../../core/kredi-urunu';
import { PmtSonuc, pmtHesapla } from '../../core/pmt-hesaplama';

@Component({
  selector: 'app-basvuru-olustur',
  imports: [FormsModule, DecimalPipe],
  templateUrl: './basvuru-olustur.html',
  styleUrl: './basvuru-olustur.scss',
})
export class BasvuruOlustur implements OnInit {
  urunler = signal<KrediUrunu[]>([]);
  secilenUrun = signal<KrediUrunu | null>(null);
  krediUrunuId: number | null = null;
  talepEdilenTutar: number | null = null;
  talepEdilenVade: number | null = null;
  onIzleme = signal<PmtSonuc | null>(null);
  hataMesaji = signal<string | null>(null);
  uyariMesaji = signal<string | null>(null);
  gonderiliyor = signal(false);

  private uyariZamanlayici: ReturnType<typeof setTimeout> | null = null;

  constructor(
    private krediUrunuService: KrediUrunuService,
    private krediBasvuruService: KrediBasvuruService,
    private auth: Auth,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.krediUrunuService.tumunuGetir().subscribe((veri) => this.urunler.set(veri));
  }

  urunSecildi(): void {
    const urun = this.urunler().find((u) => u.id === this.krediUrunuId) ?? null;
    this.secilenUrun.set(urun);
    this.hataMesaji.set(null);

    if (urun) {
      this.talepEdilenTutar = urun.minTutar;
      this.talepEdilenVade = urun.minVade;
      this.onIzlemeyiGuncelle();
    } else {
      this.onIzleme.set(null);
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

    if (this.talepEdilenTutar !== null) {
      const sinirli = this.sinirlaAraliga(this.talepEdilenTutar, urun.minTutar, urun.maksTutar);
      if (sinirli !== this.talepEdilenTutar) {
        this.talepEdilenTutar = sinirli;
        this.uyariGoster(
          `Tutar, ürünün ${urun.minTutar.toLocaleString('tr-TR')} – ${urun.maksTutar.toLocaleString('tr-TR')} TL aralığına sınırlandırıldı.`,
        );
        if (kaynakKutusu?.name === 'talepEdilenTutar') {
          kaynakKutusu.value = String(sinirli);
        }
      }
    }
    if (this.talepEdilenVade !== null) {
      const sinirli = this.sinirlaAraliga(this.talepEdilenVade, urun.minVade, urun.maksVade);
      if (sinirli !== this.talepEdilenVade) {
        this.talepEdilenVade = sinirli;
        this.uyariGoster(`Vade, ürünün ${urun.minVade} – ${urun.maksVade} ay aralığına sınırlandırıldı.`);
        if (kaynakKutusu?.name === 'talepEdilenVade') {
          kaynakKutusu.value = String(sinirli);
        }
      }
    }

    this.onIzlemeyiGuncelle();
  }

  basvurOl(): void {
    if (this.gonderiliyor()) {
      return;
    }

    this.hataMesaji.set(null);

    const kullaniciId = this.auth.kullaniciId();
    if (!kullaniciId || !this.krediUrunuId || !this.talepEdilenTutar || !this.talepEdilenVade) {
      this.hataMesaji.set('Lütfen kredi türü, tutar ve vade seçin.');
      return;
    }

    this.gonderiliyor.set(true);
    this.krediBasvuruService
      .olustur({
        kullaniciId,
        krediUrunuId: this.krediUrunuId,
        talepEdilenTutar: this.talepEdilenTutar,
        talepEdilenVade: this.talepEdilenVade,
      })
      .subscribe({
        next: () => this.router.navigate(['/basvurularim']),
        error: (hata) => {
          this.hataMesaji.set(hata.error ?? 'Başvuru oluşturulamadı.');
          this.gonderiliyor.set(false);
        },
      });
  }

  private onIzlemeyiGuncelle(): void {
    const urun = this.secilenUrun();
    if (!urun || !this.talepEdilenTutar || !this.talepEdilenVade) {
      this.onIzleme.set(null);
      return;
    }

    this.onIzleme.set(
      pmtHesapla({
        anapara: this.talepEdilenTutar,
        vade: this.talepEdilenVade,
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

  private sinirlaAraliga(deger: number, min: number, maks: number): number {
    return Math.min(Math.max(deger, min), maks);
  }
}
