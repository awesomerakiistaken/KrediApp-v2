import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Hesaplama } from './hesaplama';

describe('Hesaplama', () => {
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Hesaplama],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  function urunleriYukle(fixture: ReturnType<typeof TestBed.createComponent>) {
    fixture.detectChanges();
    httpMock.expectOne((r) => r.url.endsWith('/api/KrediUrunu')).flush([
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
    fixture.detectChanges();
  }

  it('giriş yapmadan da ürünleri getirir ve hesaplama yapabilir', () => {
    const fixture = TestBed.createComponent(Hesaplama);
    urunleriYukle(fixture);

    const component = fixture.componentInstance;
    component.krediUrunuId = 1;
    component.tutar = 15000;
    component.vade = 12;
    component.hesapla();
    fixture.detectChanges();

    expect(component.sonuc()).not.toBeNull();
    expect(component.sonuc()!.aylikTaksit).toBeCloseTo(1506.93, 1);
    expect((fixture.nativeElement as HTMLElement).textContent).toContain('1,506.93');
  });

  it('ürün seçilmeden hesapla çağrılırsa hata mesajı gösterir', () => {
    const fixture = TestBed.createComponent(Hesaplama);
    urunleriYukle(fixture);

    fixture.componentInstance.hesapla();
    fixture.detectChanges();

    expect(fixture.componentInstance.hataMesaji()).toBe('Lütfen kredi türü, tutar ve vade seçin.');
  });

  it('ürün seçilince detay bilgisini ve tutar/vade varsayılanlarını doldurur', () => {
    const fixture = TestBed.createComponent(Hesaplama);
    urunleriYukle(fixture);

    const component = fixture.componentInstance;
    component.krediUrunuId = 1;
    component.urunSecildi();

    expect(component.secilenUrun()?.ad).toBe('İhtiyaç Kredisi');
    expect(component.tutar).toBe(1000);
    expect(component.vade).toBe(3);
  });

  it('ürün seçilince otomatik olarak hesaplama sonucu üretir', () => {
    const fixture = TestBed.createComponent(Hesaplama);
    urunleriYukle(fixture);

    const component = fixture.componentInstance;
    component.krediUrunuId = 1;
    component.urunSecildi();

    expect(component.sonuc()).not.toBeNull();
  });

  it('tutar kaydırıcısı değiştiğinde sonuç anında güncellenir', () => {
    const fixture = TestBed.createComponent(Hesaplama);
    urunleriYukle(fixture);

    const component = fixture.componentInstance;
    component.krediUrunuId = 1;
    component.urunSecildi();
    const ilkTaksit = component.sonuc()!.aylikTaksit;

    component.tutar = 50000;
    component.degerDegisti();

    expect(component.sonuc()!.aylikTaksit).toBeGreaterThan(ilkTaksit);
  });
});
