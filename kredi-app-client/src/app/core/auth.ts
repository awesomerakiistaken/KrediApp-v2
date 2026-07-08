import { HttpClient } from '@angular/common/http';
import { Injectable, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { API_BASE_URL } from './api-config';

export interface GirisYaniti {
  token: string;
  ad: string;
  rol: string;
}

export interface KayitIstek {
  ad: string;
  soyad: string;
  tcKimlik: string;
  telNo: string;
  eposta: string;
  sifre: string;
}

export interface GirisIstek {
  eposta: string;
  sifre: string;
}

const TOKEN_KEY = 'kredi_app_token';
const AD_KEY = 'kredi_app_ad';
const ROL_KEY = 'kredi_app_rol';
const KULLANICI_ID_KEY = 'kredi_app_kullanici_id';

function tokenDenKullaniciIdCikar(token: string): number | null {
  try {
    const govde = JSON.parse(atob(token.split('.')[1]));
    const id = govde['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'];
    return id ? Number(id) : null;
  } catch {
    return null;
  }
}

@Injectable({
  providedIn: 'root',
})
export class Auth {
  private readonly apiUrl = `${API_BASE_URL}/Auth`;

  ad = signal<string | null>(localStorage.getItem(AD_KEY));
  rol = signal<string | null>(localStorage.getItem(ROL_KEY));
  kullaniciId = signal<number | null>(
    localStorage.getItem(KULLANICI_ID_KEY)
      ? Number(localStorage.getItem(KULLANICI_ID_KEY))
      : null,
  );

  constructor(private http: HttpClient) {}

  kayit(istek: KayitIstek): Observable<GirisYaniti> {
    return this.http
      .post<GirisYaniti>(`${this.apiUrl}/kayit`, istek)
      .pipe(tap((yanit) => this.oturumAc(yanit)));
  }

  giris(istek: GirisIstek): Observable<GirisYaniti> {
    return this.http
      .post<GirisYaniti>(`${this.apiUrl}/giris`, istek)
      .pipe(tap((yanit) => this.oturumAc(yanit)));
  }

  cikisYap(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(AD_KEY);
    localStorage.removeItem(ROL_KEY);
    localStorage.removeItem(KULLANICI_ID_KEY);
    this.ad.set(null);
    this.rol.set(null);
    this.kullaniciId.set(null);
  }

  girisYapilmisMi(): boolean {
    return !!this.token();
  }

  token(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  private oturumAc(yanit: GirisYaniti): void {
    const kullaniciId = tokenDenKullaniciIdCikar(yanit.token);

    localStorage.setItem(TOKEN_KEY, yanit.token);
    localStorage.setItem(AD_KEY, yanit.ad);
    localStorage.setItem(ROL_KEY, yanit.rol);
    if (kullaniciId !== null) {
      localStorage.setItem(KULLANICI_ID_KEY, String(kullaniciId));
    }

    this.ad.set(yanit.ad);
    this.rol.set(yanit.rol);
    this.kullaniciId.set(kullaniciId);
  }
}
