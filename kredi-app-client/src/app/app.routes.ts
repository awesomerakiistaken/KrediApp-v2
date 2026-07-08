import { Routes } from '@angular/router';
import { Login } from './pages/login/login';
import { Kayit } from './pages/kayit/kayit';
import { Hesaplama } from './pages/hesaplama/hesaplama';
import { BasvuruListesi } from './pages/basvuru-listesi/basvuru-listesi';
import { BasvuruOlustur } from './pages/basvuru-olustur/basvuru-olustur';
import { BasvuruDetay } from './pages/basvuru-detay/basvuru-detay';
import { KrediUrunuListesi } from './pages/kredi-urunu-listesi/kredi-urunu-listesi';
import { AdminUrunYonetimi } from './pages/admin-urun-yonetimi/admin-urun-yonetimi';
import { Raporlar } from './pages/raporlar/raporlar';
import { authGuard } from './core/auth-guard';
import { adminGuard } from './core/admin-guard';

export const routes: Routes = [
  { path: '', redirectTo: 'hesaplama', pathMatch: 'full' },
  { path: 'hesaplama', component: Hesaplama },
  { path: 'login', component: Login },
  { path: 'kayit', component: Kayit },
  { path: 'urunler', component: KrediUrunuListesi },
  { path: 'basvurularim', component: BasvuruListesi, canActivate: [authGuard] },
  { path: 'basvuru-olustur', component: BasvuruOlustur, canActivate: [authGuard] },
  { path: 'basvurular/:id', component: BasvuruDetay, canActivate: [authGuard] },
  { path: 'admin/urunler', component: AdminUrunYonetimi, canActivate: [authGuard, adminGuard] },
  { path: 'admin/raporlar', component: Raporlar, canActivate: [authGuard, adminGuard] },
];
