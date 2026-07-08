import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { provideRouter } from '@angular/router';
import { BasvuruDetay } from './basvuru-detay';

describe('BasvuruDetay', () => {
  let httpMock: HttpTestingController;

  async function kur(basvuruId: string) {
    localStorage.clear();
    await TestBed.configureTestingModule({
      imports: [BasvuruDetay],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: { get: () => basvuruId } } } },
      ],
    }).compileComponents();
    httpMock = TestBed.inject(HttpTestingController);
  }

  afterEach(() => {
    httpMock.verify();
  });

  it('başvuru bilgilerini ve mevcut hesaplamayı gösterir', async () => {
    await kur('5');
    const fixture = TestBed.createComponent(BasvuruDetay);
    fixture.detectChanges();

    httpMock.expectOne((r) => r.url.endsWith('/api/KrediBasvuru/5')).flush({
      id: 5,
      talepEdilenTutar: 10000,
      talepEdilenVade: 12,
      durum: 'Onaylandı',
      riskSkoru: 0.05,
    });
    httpMock.expectOne((r) => r.url.endsWith('/api/KrediHesaplama')).flush([
      { id: 1, krediBasvuruId: 5, aylikTaksit: 900.5, toplamGeriOdeme: 10806, toplamFaizTutari: 806 },
    ]);
    fixture.detectChanges();

    const metin = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(metin).toContain('Onaylandı');
    expect(metin).toContain('900.5');
  });

  it('hesaplama yoksa Hesapla butonu gösterir ve tıklayınca hesaplama oluşturur', async () => {
    await kur('5');
    const fixture = TestBed.createComponent(BasvuruDetay);
    fixture.detectChanges();

    httpMock.expectOne((r) => r.url.endsWith('/api/KrediBasvuru/5')).flush({
      id: 5,
      talepEdilenTutar: 10000,
      talepEdilenVade: 12,
      durum: 'Onaylandı',
      riskSkoru: 0.05,
    });
    httpMock.expectOne((r) => r.url.endsWith('/api/KrediHesaplama')).flush([]);
    fixture.detectChanges();

    expect((fixture.nativeElement as HTMLElement).textContent).toContain('Hesapla');

    fixture.componentInstance.hesapla();

    httpMock
      .expectOne((r) => r.url.endsWith('/api/KrediHesaplama') && r.method === 'POST')
      .flush({ id: 2, krediBasvuruId: 5, aylikTaksit: 900.5, toplamGeriOdeme: 10806, toplamFaizTutari: 806 });
    fixture.detectChanges();

    expect((fixture.nativeElement as HTMLElement).textContent).toContain('900.5');
  });
});
