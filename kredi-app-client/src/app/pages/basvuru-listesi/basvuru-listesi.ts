import { DatePipe } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Auth } from '../../core/auth';
import { durumSinifi } from '../../core/durum-yardimci';
import { KrediBasvuru, KrediBasvuruService } from '../../core/kredi-basvuru';

@Component({
  selector: 'app-basvuru-listesi',
  imports: [DatePipe, RouterLink],
  templateUrl: './basvuru-listesi.html',
  styleUrl: './basvuru-listesi.scss',
})
export class BasvuruListesi implements OnInit {
  basvurular = signal<KrediBasvuru[]>([]);
  yukleniyor = signal(true);
  durumSinifi = durumSinifi;

  constructor(
    private krediBasvuruService: KrediBasvuruService,
    protected auth: Auth,
  ) {}

  ngOnInit(): void {
    this.krediBasvuruService.tumunuGetir().subscribe({
      next: (veri) => {
        this.basvurular.set(veri);
        this.yukleniyor.set(false);
      },
      error: () => this.yukleniyor.set(false),
    });
  }
}
