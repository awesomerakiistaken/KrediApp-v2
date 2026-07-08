import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { adminGuard } from './admin-guard';

describe('adminGuard', () => {
  let router: Router;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    });
    router = TestBed.inject(Router);
  });

  function calistir(): boolean {
    return TestBed.runInInjectionContext(() => adminGuard({} as any, {} as any)) as boolean;
  }

  it('Admin rolü yokken erişimi engeller ve ana sayfaya yönlendirir', () => {
    localStorage.setItem('kredi_app_token', 'jwt-token');
    localStorage.setItem('kredi_app_rol', 'User');
    const navigateSpy = vi.spyOn(router, 'navigate');

    expect(calistir()).toBe(false);
    expect(navigateSpy).toHaveBeenCalledWith(['/basvurularim']);
  });

  it('Admin rolündeyken erişime izin verir', () => {
    localStorage.setItem('kredi_app_token', 'jwt-token');
    localStorage.setItem('kredi_app_rol', 'Admin');

    expect(calistir()).toBe(true);
  });
});
