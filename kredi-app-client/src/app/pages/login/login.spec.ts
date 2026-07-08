import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { Login } from './login';

describe('Login', () => {
  let httpMock: HttpTestingController;
  let router: Router;

  beforeEach(async () => {
    localStorage.clear();
    await TestBed.configureTestingModule({
      imports: [Login],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();
    httpMock = TestBed.inject(HttpTestingController);
    router = TestBed.inject(Router);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('başarılı girişte başvurularım sayfasına yönlendirir', () => {
    const fixture = TestBed.createComponent(Login);
    const navigateSpy = vi.spyOn(router, 'navigate');
    const component = fixture.componentInstance;

    component.eposta = 'ali@test.com';
    component.sifre = 'sifre123';
    component.girisYap();

    httpMock
      .expectOne((r) => r.url.endsWith('/api/Auth/giris'))
      .flush({ token: 'jwt-token', ad: 'Ali', rol: 'User' });

    expect(navigateSpy).toHaveBeenCalledWith(['/basvurularim']);
  });

  it('hatalı girişte hata mesajı gösterir ve yönlendirmez', () => {
    const fixture = TestBed.createComponent(Login);
    const navigateSpy = vi.spyOn(router, 'navigate');
    const component = fixture.componentInstance;

    component.eposta = 'ali@test.com';
    component.sifre = 'yanlis';
    component.girisYap();

    httpMock
      .expectOne((r) => r.url.endsWith('/api/Auth/giris'))
      .flush('Yetkisiz', { status: 401, statusText: 'Unauthorized' });

    expect(component.hataMesaji()).toBe('E-posta veya şifre hatalı.');
    expect(navigateSpy).not.toHaveBeenCalled();
  });
});
