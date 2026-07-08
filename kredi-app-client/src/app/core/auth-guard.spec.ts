import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { authGuard } from './auth-guard';

describe('authGuard', () => {
  let router: Router;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    });
    router = TestBed.inject(Router);
  });

  function calistir(): boolean {
    return TestBed.runInInjectionContext(() =>
      authGuard({} as any, {} as any),
    ) as boolean;
  }

  it('token yokken erişimi engeller ve login sayfasına yönlendirir', () => {
    const navigateSpy = vi.spyOn(router, 'navigate');

    const sonuc = calistir();

    expect(sonuc).toBe(false);
    expect(navigateSpy).toHaveBeenCalledWith(['/login']);
  });

  it('token varken erişime izin verir', () => {
    localStorage.setItem('kredi_app_token', 'jwt-token');

    const sonuc = calistir();

    expect(sonuc).toBe(true);
  });
});
