import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { BasvuruListesi } from './basvuru-listesi';

describe('BasvuruListesi', () => {
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    localStorage.clear();
    await TestBed.configureTestingModule({
      imports: [BasvuruListesi],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('başvuru yoksa "Henüz başvuru yok." mesajını gösterir', () => {
    const fixture = TestBed.createComponent(BasvuruListesi);
    fixture.detectChanges();

    httpMock.expectOne((r) => r.url.endsWith('/api/KrediBasvuru')).flush([]);
    fixture.detectChanges();

    expect((fixture.nativeElement as HTMLElement).textContent).toContain('Henüz başvuru yok.');
  });

  it('gelen başvuruları tabloda listeler', () => {
    const fixture = TestBed.createComponent(BasvuruListesi);
    fixture.detectChanges();

    httpMock.expectOne((r) => r.url.endsWith('/api/KrediBasvuru')).flush([
      {
        id: 1,
        talepEdilenTutar: 15000,
        talepEdilenVade: 12,
        basvuruTarihi: '2026-01-01T00:00:00',
        durum: 'Bekleme',
        riskSkoru: null,
      },
    ]);
    fixture.detectChanges();

    const metin = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(metin).toContain('15000');
    expect(metin).toContain('Bekleme');
  });
});
