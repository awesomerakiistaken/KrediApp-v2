import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { KrediHesaplamaService } from './kredi-hesaplama';

describe('KrediHesaplamaService', () => {
  let service: KrediHesaplamaService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(KrediHesaplamaService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('tumunuGetir tüm hesaplamaları döner', () => {
    let sonuc: unknown;
    service.tumunuGetir().subscribe((veri) => (sonuc = veri));

    const istek = httpMock.expectOne((r) => r.url.endsWith('/api/KrediHesaplama'));
    istek.flush([{ id: 1, krediBasvuruId: 5, aylikTaksit: 950.25 }]);

    expect(sonuc).toEqual([{ id: 1, krediBasvuruId: 5, aylikTaksit: 950.25 }]);
  });

  it('hesapla belirtilen başvuru için hesaplama oluşturur', () => {
    let sonuc: unknown;
    service.hesapla(5).subscribe((veri) => (sonuc = veri));

    const istek = httpMock.expectOne((r) => r.url.endsWith('/api/KrediHesaplama'));
    expect(istek.request.method).toBe('POST');
    expect(istek.request.body).toEqual({ krediBasvuruId: 5 });
    istek.flush({ id: 1, krediBasvuruId: 5, aylikTaksit: 950.25 });

    expect(sonuc).toEqual({ id: 1, krediBasvuruId: 5, aylikTaksit: 950.25 });
  });
});
