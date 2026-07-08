import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_BASE_URL } from './api-config';

export interface KrediBasvuru {
  id: number;
  kullaniciId: number;
  krediUrunuId: number;
  talepEdilenTutar: number;
  talepEdilenVade: number;
  faizOrani: number;
  kkdf: number;
  bsmv: number;
  basvuruTarihi: string;
  durum: string;
  riskSkoru: number | null;
  kararTarihi: string | null;
  kullanici?: { ad: string; soyad: string; tcKimlik: string; telNo: string } | null;
  krediUrunu?: { ad: string } | null;
}

export interface KrediBasvuruOlusturIstek {
  kullaniciId: number;
  krediUrunuId: number;
  talepEdilenTutar: number;
  talepEdilenVade: number;
}

@Injectable({
  providedIn: 'root',
})
export class KrediBasvuruService {
  private readonly apiUrl = `${API_BASE_URL}/KrediBasvuru`;

  constructor(private http: HttpClient) {}

  tumunuGetir(): Observable<KrediBasvuru[]> {
    return this.http.get<KrediBasvuru[]>(this.apiUrl);
  }

  getir(id: number): Observable<KrediBasvuru> {
    return this.http.get<KrediBasvuru>(`${this.apiUrl}/${id}`);
  }

  olustur(istek: KrediBasvuruOlusturIstek): Observable<KrediBasvuru> {
    return this.http.post<KrediBasvuru>(this.apiUrl, istek);
  }

  durumGuncelle(id: number, durum: 'Onaylandı' | 'Reddedildi'): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}/durum`, { durum });
  }
}
