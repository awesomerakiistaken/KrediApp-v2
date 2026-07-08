import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Auth } from './auth';

describe('Auth', () => {
  let auth: Auth;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    auth = TestBed.inject(Auth);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('giriş yapılmamışken girisYapilmisMi false döner', () => {
    expect(auth.girisYapilmisMi()).toBe(false);
  });

  it('başarılı girişte token, ad ve rolü saklar', () => {
    auth.giris({ eposta: 'ali@test.com', sifre: 'sifre123' }).subscribe();

    const istek = httpMock.expectOne((r) => r.url.endsWith('/api/Auth/giris'));
    istek.flush({ token: 'jwt-token', ad: 'Ali', rol: 'User' });

    expect(auth.girisYapilmisMi()).toBe(true);
    expect(auth.token()).toBe('jwt-token');
    expect(auth.ad()).toBe('Ali');
    expect(auth.rol()).toBe('User');
  });

  it('token içindeki nameidentifier claiminden kullaniciId çıkarır', () => {
    const govde = {
      'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier': '7',
    };
    const sahteToken = `header.${btoa(JSON.stringify(govde))}.imza`;

    auth.giris({ eposta: 'ali@test.com', sifre: 'sifre123' }).subscribe();
    httpMock
      .expectOne((r) => r.url.endsWith('/api/Auth/giris'))
      .flush({ token: sahteToken, ad: 'Ali', rol: 'User' });

    expect(auth.kullaniciId()).toBe(7);
  });

  it('başarılı kayıtta token, ad ve rolü saklar', () => {
    auth
      .kayit({
        ad: 'Veli',
        soyad: 'Demir',
        tcKimlik: '12345678901',
        telNo: '5551234567',
        eposta: 'veli@test.com',
        sifre: 'sifre123',
      })
      .subscribe();

    const istek = httpMock.expectOne((r) => r.url.endsWith('/api/Auth/kayit'));
    istek.flush({ token: 'jwt-token-2', ad: 'Veli', rol: 'User' });

    expect(auth.token()).toBe('jwt-token-2');
    expect(auth.ad()).toBe('Veli');
  });

  it('cikisYap oturum bilgilerini temizler', () => {
    auth.giris({ eposta: 'ali@test.com', sifre: 'sifre123' }).subscribe();
    httpMock.expectOne((r) => r.url.endsWith('/api/Auth/giris')).flush({
      token: 'jwt-token',
      ad: 'Ali',
      rol: 'User',
    });

    auth.cikisYap();

    expect(auth.girisYapilmisMi()).toBe(false);
    expect(auth.token()).toBeNull();
    expect(auth.ad()).toBeNull();
  });
});
