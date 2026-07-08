import { Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { KrediBasvuru, KrediBasvuruService } from '../../core/kredi-basvuru';
import { KrediHesaplama, KrediHesaplamaService } from '../../core/kredi-hesaplama';

@Component({
  selector: 'app-basvuru-detay',
  imports: [],
  templateUrl: './basvuru-detay.html',
  styleUrl: './basvuru-detay.scss',
})
export class BasvuruDetay implements OnInit {
  basvuru = signal<KrediBasvuru | null>(null);
  hesaplama = signal<KrediHesaplama | null>(null);
  yukleniyor = signal(true);

  private basvuruId!: number;

  constructor(
    private route: ActivatedRoute,
    private krediBasvuruService: KrediBasvuruService,
    private krediHesaplamaService: KrediHesaplamaService,
  ) {}

  ngOnInit(): void {
    this.basvuruId = Number(this.route.snapshot.paramMap.get('id'));

    this.krediBasvuruService.getir(this.basvuruId).subscribe((basvuru) => {
      this.basvuru.set(basvuru);
      this.hesaplamalariYukle();
    });
  }

  hesapla(): void {
    this.krediHesaplamaService.hesapla(this.basvuruId).subscribe((hesaplama) => {
      this.hesaplama.set(hesaplama);
    });
  }

  private hesaplamalariYukle(): void {
    this.krediHesaplamaService.tumunuGetir().subscribe({
      next: (veri) => {
        const buBasvurununHesaplamasi = veri.find((h) => h.krediBasvuruId === this.basvuruId);
        this.hesaplama.set(buBasvurununHesaplamasi ?? null);
        this.yukleniyor.set(false);
      },
      error: () => this.yukleniyor.set(false),
    });
  }
}
