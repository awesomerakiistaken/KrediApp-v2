import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { KrediUrunuService } from './kredi-urunu';

describe('KrediUrunuService', () => {
  let service: KrediUrunuService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(KrediUrunuService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('tumunuGetir tüm kredi ürünlerini döner', () => {
    let sonuc: unknown;
    service.tumunuGetir().subscribe((veri) => (sonuc = veri));

    const istek = httpMock.expectOne((r) => r.url.endsWith('/api/KrediUrunu'));
    expect(istek.request.method).toBe('GET');
    istek.flush([{ id: 1, ad: 'İhtiyaç Kredisi' }]);

    expect(sonuc).toEqual([{ id: 1, ad: 'İhtiyaç Kredisi' }]);
  });

  it('olustur yeni bir kredi ürünü oluşturur', () => {
    const yeniUrun = {
      ad: 'Taşıt Kredisi',
      minVade: 6,
      maksVade: 48,
      faizOrani: 0.03,
      kkdf: 0.15,
      bsmv: 0.05,
      minTutar: 10000,
      maksTutar: 500000,
    };
    let sonuc: unknown;
    service.olustur(yeniUrun).subscribe((veri) => (sonuc = veri));

    const istek = httpMock.expectOne((r) => r.url.endsWith('/api/KrediUrunu'));
    expect(istek.request.method).toBe('POST');
    expect(istek.request.body).toEqual(yeniUrun);
    istek.flush({ id: 2, ...yeniUrun });

    expect(sonuc).toEqual({ id: 2, ...yeniUrun });
  });

  it('sil bir kredi ürününü siler', () => {
    let tamamlandi = false;
    service.sil(2).subscribe(() => (tamamlandi = true));

    const istek = httpMock.expectOne((r) => r.url.endsWith('/api/KrediUrunu/2'));
    expect(istek.request.method).toBe('DELETE');
    istek.flush(null);

    expect(tamamlandi).toBe(true);
  });
});
