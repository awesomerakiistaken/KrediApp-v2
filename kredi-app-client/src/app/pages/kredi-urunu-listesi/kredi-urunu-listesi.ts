import { DecimalPipe } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { KrediUrunu, KrediUrunuService } from '../../core/kredi-urunu';

@Component({
  selector: 'app-kredi-urunu-listesi',
  imports: [DecimalPipe],
  templateUrl: './kredi-urunu-listesi.html',
  styleUrl: './kredi-urunu-listesi.scss',
})
export class KrediUrunuListesi implements OnInit {
  urunler = signal<KrediUrunu[]>([]);
  yukleniyor = signal(true);

  constructor(private krediUrunuService: KrediUrunuService) {}

  ngOnInit(): void {
    this.krediUrunuService.tumunuGetir().subscribe({
      next: (veri) => {
        this.urunler.set(veri);
        this.yukleniyor.set(false);
      },
      error: () => this.yukleniyor.set(false),
    });
  }
}
