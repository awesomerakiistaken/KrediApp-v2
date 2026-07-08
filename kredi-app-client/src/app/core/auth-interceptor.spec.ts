import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { authInterceptor } from './auth-interceptor';

describe('authInterceptor', () => {
  let http: HttpClient;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting(),
      ],
    });
    http = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('token varsa Authorization header ekler', () => {
    localStorage.setItem('kredi_app_token', 'jwt-token');

    http.get('/api/test').subscribe();

    const istek = httpMock.expectOne('/api/test');
    expect(istek.request.headers.get('Authorization')).toBe('Bearer jwt-token');
    istek.flush({});
  });

  it('token yoksa Authorization header eklemez', () => {
    http.get('/api/test').subscribe();

    const istek = httpMock.expectOne('/api/test');
    expect(istek.request.headers.has('Authorization')).toBe(false);
    istek.flush({});
  });
});
