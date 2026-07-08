import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { AdminUrunYonetimi } from './admin-urun-yonetimi';

describe('AdminUrunYonetimi', () => {
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    localStorage.clear();
    await TestBed.configureTestingModule({
      imports: [AdminUrunYonetimi],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  function yukle(fixture: ReturnType<typeof TestBed.createComponent>, urunler: unknown[] = []) {
    fixture.detectChanges();
    httpMock.expectOne((r) => r.url.endsWith('/api/KrediUrunu') && r.method === 'GET').flush(urunler);
    fixture.detectChanges();
  }

  it('ürün yokken tablo yerine boş mesajı gösterir', () => {
    const fixture = TestBed.createComponent(AdminUrunYonetimi);
    yukle(fixture);

    const metin = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(metin).toContain('Henüz ürün yok.');
    expect(fixture.nativeElement.querySelector('table')).toBeNull();
  });

  it('mevcut ürünleri listeler', () => {
    const fixture = TestBed.createComponent(AdminUrunYonetimi);
    yukle(fixture, [
      {
        id: 1,
        ad: 'İhtiyaç Kredisi',
        minVade: 3,
        maksVade: 36,
        faizOrani: 0.025,
        kkdf: 0.15,
        bsmv: 0.05,
        minTutar: 1000,
        maksTutar: 100000,
      },
    ]);

    expect((fixture.nativeElement as HTMLElement).textContent).toContain('İhtiyaç Kredisi');
  });

  it('yeni ürün ekler ve listeyi günceller', () => {
    const fixture = TestBed.createComponent(AdminUrunYonetimi);
    yukle(fixture);

    const component = fixture.componentInstance;
    component.form = {
      ad: 'Taşıt Kredisi',
      minVade: 6,
      maksVade: 48,
      faizOrani: 0.03,
      kkdf: 0.15,
      bsmv: 0.05,
      minTutar: 10000,
      maksTutar: 500000,
    };
    component.kaydet();

    const istek = httpMock.expectOne((r) => r.url.endsWith('/api/KrediUrunu') && r.method === 'POST');
    istek.flush({ id: 2, ...component.form });

    expect(component.urunler()).toHaveLength(1);
  });

  it('ürünü siler', () => {
    const fixture = TestBed.createComponent(AdminUrunYonetimi);
    yukle(fixture, [
      {
        id: 1,
        ad: 'İhtiyaç Kredisi',
        minVade: 3,
        maksVade: 36,
        faizOrani: 0.025,
        kkdf: 0.15,
        bsmv: 0.05,
        minTutar: 1000,
        maksTutar: 100000,
      },
    ]);

    vi.spyOn(window, 'confirm').mockReturnValue(true);
    fixture.componentInstance.sil(1);

    httpMock.expectOne((r) => r.url.endsWith('/api/KrediUrunu/1') && r.method === 'DELETE').flush(null);

    expect(fixture.componentInstance.urunler()).toHaveLength(0);
  });

  it('silme onaylanmazsa isteği göndermez', () => {
    const fixture = TestBed.createComponent(AdminUrunYonetimi);
    yukle(fixture, [
      {
        id: 1,
        ad: 'İhtiyaç Kredisi',
        minVade: 3,
        maksVade: 36,
        faizOrani: 0.025,
        kkdf: 0.15,
        bsmv: 0.05,
        minTutar: 1000,
        maksTutar: 100000,
      },
    ]);

    vi.spyOn(window, 'confirm').mockReturnValue(false);
    fixture.componentInstance.sil(1);

    expect(fixture.componentInstance.urunler()).toHaveLength(1);
  });
});
