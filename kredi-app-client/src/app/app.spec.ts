import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { App } from './app';

describe('App', () => {
  beforeEach(async () => {
    localStorage.clear();
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();
  });

  it('giriş yapılmamışken Giriş Yap ve Kayıt Ol bağlantılarını gösterir', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Giriş Yap');
    expect(compiled.textContent).toContain('Kayıt Ol');
  });

  it('giriş yapılmışken kullanıcı adını ve Çıkış Yap butonunu gösterir', () => {
    localStorage.setItem('kredi_app_token', 'sahte-token');
    localStorage.setItem('kredi_app_ad', 'Ali');
    localStorage.setItem('kredi_app_rol', 'User');

    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Ali');
    expect(compiled.textContent).toContain('Çıkış Yap');
  });

  it('normal kullanıcı için Başvuru ve Başvurularım sekmelerini gösterir', () => {
    localStorage.setItem('kredi_app_token', 'sahte-token');
    localStorage.setItem('kredi_app_ad', 'Ali');
    localStorage.setItem('kredi_app_rol', 'User');

    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Başvuru');
    expect(compiled.textContent).toContain('Başvurularım');
  });

  it('Admin için Başvuru sekmesini gizler, Ürünler ve Raporlar sekmelerini gösterir', () => {
    localStorage.setItem('kredi_app_token', 'sahte-token');
    localStorage.setItem('kredi_app_ad', 'Admin');
    localStorage.setItem('kredi_app_rol', 'Admin');

    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('a[href="/basvuru-olustur"]')).toBeNull();
    expect(compiled.querySelector('a[href="/basvurularim"]')).toBeNull();
    expect(compiled.querySelector('a[href="/admin/urunler"]')).not.toBeNull();
    expect(compiled.querySelector('a[href="/admin/raporlar"]')).not.toBeNull();
  });
});
