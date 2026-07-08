import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_BASE_URL } from './api-config';

export interface KrediUrunu {
  id: number;
  ad: string;
  minVade: number;
  maksVade: number;
  faizOrani: number;
  kkdf: number;
  bsmv: number;
  minTutar: number;
  maksTutar: number;
}

export type KrediUrunuFormu = Omit<KrediUrunu, 'id'>;

@Injectable({
  providedIn: 'root',
})
export class KrediUrunuService {
  private readonly apiUrl = `${API_BASE_URL}/KrediUrunu`;

  constructor(private http: HttpClient) {}

  tumunuGetir(): Observable<KrediUrunu[]> {
    return this.http.get<KrediUrunu[]>(this.apiUrl);
  }

  getir(id: number): Observable<KrediUrunu> {
    return this.http.get<KrediUrunu>(`${this.apiUrl}/${id}`);
  }

  olustur(urun: KrediUrunuFormu): Observable<KrediUrunu> {
    return this.http.post<KrediUrunu>(this.apiUrl, urun);
  }

  guncelle(id: number, urun: KrediUrunuFormu): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}`, { id, ...urun });
  }

  sil(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
