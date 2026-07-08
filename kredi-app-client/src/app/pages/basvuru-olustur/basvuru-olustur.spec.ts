import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { BasvuruOlustur } from './basvuru-olustur';

describe('BasvuruOlustur', () => {
  let httpMock: HttpTestingController;
  let router: Router;

  beforeEach(async () => {
    localStorage.clear();
    await TestBed.configureTestingModule({
      imports: [BasvuruOlustur],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();
    httpMock = TestBed.inject(HttpTestingController);
    router = TestBed.inject(Router);
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

  it('sayfa yüklendiğinde kredi ürünlerini getirir', () => {
    const fixture = TestBed.createComponent(BasvuruOlustur);
    urunleriYukle(fixture);

    expect(fixture.componentInstance.urunler()).toHaveLength(1);
  });

  it('geçerli veriyle başvuru oluşturur ve listeye yönlendirir', () => {
    // JWT payload: nameidentifier=3
    const sahteToken = `h.${btoa(
      JSON.stringify({
        'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier': '3',
      }),
    )}.s`;
    localStorage.setItem('kredi_app_token', sahteToken);
    localStorage.setItem('kredi_app_kullanici_id', '3');

    const fixture = TestBed.createComponent(BasvuruOlustur);
    const navigateSpy = vi.spyOn(router, 'navigate');
    urunleriYukle(fixture);

    const component = fixture.componentInstance;
    component.krediUrunuId = 1;
    component.talepEdilenTutar = 5000;
    component.talepEdilenVade = 12;
    component.basvurOl();

    const istek = httpMock.expectOne((r) => r.url.endsWith('/api/KrediBasvuru'));
    expect(istek.request.body).toEqual({
      kullaniciId: 3,
      krediUrunuId: 1,
      talepEdilenTutar: 5000,
      talepEdilenVade: 12,
    });
    istek.flush({ id: 10, durum: 'Bekleme' });

    expect(navigateSpy).toHaveBeenCalledWith(['/basvurularim']);
  });

  it('tutar ürün aralığı dışındaysa backend hatasını gösterir', () => {
    localStorage.setItem('kredi_app_kullanici_id', '3');
    const fixture = TestBed.createComponent(BasvuruOlustur);
    urunleriYukle(fixture);

    const component = fixture.componentInstance;
    component.krediUrunuId = 1;
    component.talepEdilenTutar = 999999;
    component.talepEdilenVade = 12;
    component.basvurOl();

    httpMock
      .expectOne((r) => r.url.endsWith('/api/KrediBasvuru'))
      .flush('Talep edilen tutar, ürünün 1000-100000 aralığı dışında.', {
        status: 400,
        statusText: 'Bad Request',
      });

    expect(component.hataMesaji()).toBe(
      'Talep edilen tutar, ürünün 1000-100000 aralığı dışında.',
    );
  });
});
