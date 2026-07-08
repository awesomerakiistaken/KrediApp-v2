import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { KrediUrunuListesi } from './kredi-urunu-listesi';

describe('KrediUrunuListesi', () => {
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    localStorage.clear();
    await TestBed.configureTestingModule({
      imports: [KrediUrunuListesi],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('kredi ürünlerini listeler', () => {
    const fixture = TestBed.createComponent(KrediUrunuListesi);
    fixture.detectChanges();

    httpMock.expectOne((r) => r.url.endsWith('/api/KrediUrunu')).flush([
      { id: 1, ad: 'İhtiyaç Kredisi', minVade: 3, maksVade: 36, faizOrani: 0.025, kkdf: 0.15, bsmv: 0.05, minTutar: 1000, maksTutar: 100000 },
    ]);
    fixture.detectChanges();

    expect((fixture.nativeElement as HTMLElement).textContent).toContain('İhtiyaç Kredisi');
  });

  it('ürün yoksa uygun mesajı gösterir', () => {
    const fixture = TestBed.createComponent(KrediUrunuListesi);
    fixture.detectChanges();

    httpMock.expectOne((r) => r.url.endsWith('/api/KrediUrunu')).flush([]);
    fixture.detectChanges();

    expect((fixture.nativeElement as HTMLElement).textContent).toContain('Henüz ürün yok.');
  });
});
