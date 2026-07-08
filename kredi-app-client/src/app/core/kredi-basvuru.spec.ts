import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { KrediBasvuruService } from './kredi-basvuru';

describe('KrediBasvuruService', () => {
  let service: KrediBasvuruService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(KrediBasvuruService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('tumunuGetir tüm başvuruları döner', () => {
    let sonuc: unknown;
    service.tumunuGetir().subscribe((veri) => (sonuc = veri));

    const istek = httpMock.expectOne((r) => r.url.endsWith('/api/KrediBasvuru'));
    expect(istek.request.method).toBe('GET');
    istek.flush([{ id: 1, durum: 'Bekleme' }]);

    expect(sonuc).toEqual([{ id: 1, durum: 'Bekleme' }]);
  });

  it('getir tek bir başvuruyu döner', () => {
    let sonuc: unknown;
    service.getir(5).subscribe((veri) => (sonuc = veri));

    const istek = httpMock.expectOne((r) => r.url.endsWith('/api/KrediBasvuru/5'));
    expect(istek.request.method).toBe('GET');
    istek.flush({ id: 5, durum: 'Onaylandı' });

    expect(sonuc).toEqual({ id: 5, durum: 'Onaylandı' });
  });

  it('olustur yeni bir başvuru oluşturur', () => {
    const istekGovdesi = { kullaniciId: 1, krediUrunuId: 2, talepEdilenTutar: 10000, talepEdilenVade: 12 };
    let sonuc: unknown;
    service.olustur(istekGovdesi).subscribe((veri) => (sonuc = veri));

    const istek = httpMock.expectOne((r) => r.url.endsWith('/api/KrediBasvuru'));
    expect(istek.request.method).toBe('POST');
    expect(istek.request.body).toEqual(istekGovdesi);
    istek.flush({ id: 10, ...istekGovdesi, durum: 'Bekleme' });

    expect(sonuc).toEqual({ id: 10, ...istekGovdesi, durum: 'Bekleme' });
  });

  it('durumGuncelle başvurunun durumunu günceller', () => {
    let tamamlandi = false;
    service.durumGuncelle(5, 'Onaylandı').subscribe(() => (tamamlandi = true));

    const istek = httpMock.expectOne((r) => r.url.endsWith('/api/KrediBasvuru/5/durum'));
    expect(istek.request.method).toBe('PUT');
    expect(istek.request.body).toEqual({ durum: 'Onaylandı' });
    istek.flush(null);

    expect(tamamlandi).toBe(true);
  });
});
