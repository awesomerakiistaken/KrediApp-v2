import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { Kayit } from './kayit';

describe('Kayit', () => {
  let httpMock: HttpTestingController;
  let router: Router;

  beforeEach(async () => {
    localStorage.clear();
    await TestBed.configureTestingModule({
      imports: [Kayit],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();
    httpMock = TestBed.inject(HttpTestingController);
    router = TestBed.inject(Router);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('başarılı kayıtta başvurularım sayfasına yönlendirir', () => {
    const fixture = TestBed.createComponent(Kayit);
    const navigateSpy = vi.spyOn(router, 'navigate');
    const component = fixture.componentInstance;

    component.ad = 'Veli';
    component.soyad = 'Demir';
    component.tcKimlik = '12345678901';
    component.telNo = '5551234567';
    component.eposta = 'veli@test.com';
    component.sifre = 'sifre123';
    component.kayitOl();

    httpMock
      .expectOne((r) => r.url.endsWith('/api/Auth/kayit'))
      .flush({ token: 'jwt-token', ad: 'Veli', rol: 'User' });

    expect(navigateSpy).toHaveBeenCalledWith(['/basvurularim']);
  });

  it('e-posta zaten kayıtlıysa sunucu hata mesajını gösterir', () => {
    const fixture = TestBed.createComponent(Kayit);
    const navigateSpy = vi.spyOn(router, 'navigate');
    const component = fixture.componentInstance;

    component.ad = 'Veli';
    component.soyad = 'Demir';
    component.tcKimlik = '12345678901';
    component.telNo = '5551234567';
    component.eposta = 'veli@test.com';
    component.sifre = 'sifre123';
    component.kayitOl();

    httpMock
      .expectOne((r) => r.url.endsWith('/api/Auth/kayit'))
      .flush('Bu e-posta adresi zaten kayıtlı.', { status: 400, statusText: 'Bad Request' });

    expect(component.hataMesaji()).toBe('Bu e-posta adresi zaten kayıtlı.');
    expect(navigateSpy).not.toHaveBeenCalled();
  });

  it('geçersiz TC kimlik ile sunucuya istek atmadan hata gösterir', () => {
    const fixture = TestBed.createComponent(Kayit);
    const component = fixture.componentInstance;

    component.ad = 'Veli';
    component.soyad = 'Demir';
    component.tcKimlik = '123';
    component.telNo = '5551234567';
    component.eposta = 'veli@test.com';
    component.sifre = 'sifre123';
    component.kayitOl();

    expect(component.hataMesaji()).toBe('TC kimlik numarası 11 haneli olmalıdır.');
  });
});
