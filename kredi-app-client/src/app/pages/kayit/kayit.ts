import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Auth } from '../../core/auth';

@Component({
  selector: 'app-kayit',
  imports: [FormsModule, RouterLink],
  templateUrl: './kayit.html',
  styleUrl: './kayit.scss',
})
export class Kayit {
  ad = '';
  soyad = '';
  tcKimlik = '';
  telNo = '';
  eposta = '';
  sifre = '';
  hataMesaji = signal<string | null>(null);
  gonderiliyor = signal(false);

  constructor(
    private auth: Auth,
    private router: Router,
  ) {}

  kayitOl(): void {
    if (this.gonderiliyor()) {
      return;
    }

    this.hataMesaji.set(null);

    const gecerlilikHatasi = this.formuDogrula();
    if (gecerlilikHatasi) {
      this.hataMesaji.set(gecerlilikHatasi);
      return;
    }

    this.gonderiliyor.set(true);
    this.auth
      .kayit({
        ad: this.ad,
        soyad: this.soyad,
        tcKimlik: this.tcKimlik,
        telNo: this.telNo,
        eposta: this.eposta,
        sifre: this.sifre,
      })
      .subscribe({
        next: () => this.router.navigate(['/basvurularim']),
        error: (hata) => {
          this.hataMesaji.set(hata.error ?? 'Kayıt sırasında bir hata oluştu.');
          this.gonderiliyor.set(false);
        },
      });
  }

  private formuDogrula(): string | null {
    const telNoHaneleri = this.telNo.replace(/\D/g, '');
    const gecerliTelNo =
      telNoHaneleri.length === 10 || (telNoHaneleri.length === 11 && telNoHaneleri.startsWith('0'));

    if (!/^\S+@\S+\.\S+$/.test(this.eposta)) {
      return 'Lütfen geçerli bir e-posta adresi girin.';
    }
    if (!/^\d{11}$/.test(this.tcKimlik)) {
      return 'TC kimlik numarası 11 haneli olmalıdır.';
    }
    if (!gecerliTelNo) {
      return 'Telefon numarası 10 haneli olmalıdır (başında 0 olsun ya da olmasın).';
    }
    if (this.sifre.length < 6) {
      return 'Şifre en az 6 karakter olmalıdır.';
    }
    return null;
  }
}
