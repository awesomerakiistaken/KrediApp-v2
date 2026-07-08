import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Raporlar } from './raporlar';

const BASVURU_1 = {
  id: 1,
  kullaniciId: 1,
  krediUrunuId: 1,
  talepEdilenTutar: 49000,
  talepEdilenVade: 3,
  faizOrani: 0.033,
  kkdf: 0.15,
  bsmv: 0.05,
  basvuruTarihi: '2026-06-24T13:40:00',
  durum: 'Bekleme',
  riskSkoru: 1,
  kararTarihi: null,
  kullanici: { ad: 'Ali', soyad: 'Demir', tcKimlik: '23456789012', telNo: '05552345678' },
  krediUrunu: { ad: 'İhtiyaç Kredisi' },
};

const BASVURU_2 = {
  id: 2,
  kullaniciId: 2,
  krediUrunuId: 2,
  talepEdilenTutar: 1484000,
  talepEdilenVade: 35,
  faizOrani: 0.0219,
  kkdf: 0.15,
  bsmv: 0.05,
  basvuruTarihi: '2026-06-23T09:09:00',
  durum: 'Onaylandı',
  riskSkoru: 0.02,
  kararTarihi: '2026-06-23T10:00:00',
  kullanici: { ad: 'Ayşe', soyad: 'Yılmaz', tcKimlik: '12345678901', telNo: '05551234567' },
  krediUrunu: { ad: 'Konut Kredisi' },
};

describe('Raporlar', () => {
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    localStorage.clear();
    await TestBed.configureTestingModule({
      imports: [Raporlar],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  function yukle(fixture: ReturnType<typeof TestBed.createComponent>) {
    fixture.detectChanges();
    httpMock.expectOne((r) => r.url.endsWith('/api/KrediBasvuru')).flush([BASVURU_1, BASVURU_2]);
    fixture.detectChanges();
  }

  it('tüm başvuruları listeler', () => {
    const fixture = TestBed.createComponent(Raporlar);
    yukle(fixture);

    const metin = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(metin).toContain('Ali Demir');
    expect(metin).toContain('Ayşe Yılmaz');
  });

  it('arama metnine göre filtreler', () => {
    const fixture = TestBed.createComponent(Raporlar);
    yukle(fixture);

    fixture.componentInstance.aramaMetni = 'ayşe';

    const filtrelenmis = fixture.componentInstance.filtrelenmisBasvurular();
    expect(filtrelenmis).toHaveLength(1);
    expect(filtrelenmis[0].id).toBe(2);
  });

  it('durum filtresine göre filtreler', () => {
    const fixture = TestBed.createComponent(Raporlar);
    yukle(fixture);

    fixture.componentInstance.durumFiltresi = 'Onaylandı';

    expect(fixture.componentInstance.filtrelenmisBasvurular()).toHaveLength(1);
    expect(fixture.componentInstance.filtrelenmisBasvurular()[0].id).toBe(2);
  });

  it('bir satırı genişletince amortisman tablosu gösterir', () => {
    const fixture = TestBed.createComponent(Raporlar);
    yukle(fixture);

    fixture.componentInstance.detayiAcKapat(1);
    fixture.detectChanges();

    expect(fixture.componentInstance.acikBasvuruId()).toBe(1);
    expect(fixture.componentInstance.amortismanTablosu(BASVURU_1 as any)).toHaveLength(3);
  });

  it('Bekleme durumundaki başvuruyu onaylar', () => {
    const fixture = TestBed.createComponent(Raporlar);
    yukle(fixture);

    fixture.componentInstance.durumGuncelle(BASVURU_1 as any, 'Onaylandı');

    const istek = httpMock.expectOne((r) => r.url.endsWith('/api/KrediBasvuru/1/durum'));
    expect(istek.request.body).toEqual({ durum: 'Onaylandı' });
    istek.flush(null);

    expect(fixture.componentInstance.basvurular().find((b) => b.id === 1)?.durum).toBe('Onaylandı');
  });
});
