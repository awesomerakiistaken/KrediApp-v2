import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_BASE_URL } from './api-config';

export interface KrediHesaplama {
  id: number;
  krediBasvuruId: number;
  aylikTaksit: number;
  toplamGeriOdeme: number;
  toplamFaizTutari: number;
  olusturmaTarihi: string;
}

@Injectable({
  providedIn: 'root',
})
export class KrediHesaplamaService {
  private readonly apiUrl = `${API_BASE_URL}/KrediHesaplama`;

  constructor(private http: HttpClient) {}

  tumunuGetir(): Observable<KrediHesaplama[]> {
    return this.http.get<KrediHesaplama[]>(this.apiUrl);
  }

  hesapla(krediBasvuruId: number): Observable<KrediHesaplama> {
    return this.http.post<KrediHesaplama>(this.apiUrl, { krediBasvuruId });
  }
}
