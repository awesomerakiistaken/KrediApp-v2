import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Auth } from '../../core/auth';

@Component({
  selector: 'app-login',
  imports: [FormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login {
  eposta = '';
  sifre = '';
  hataMesaji = signal<string | null>(null);
  gonderiliyor = signal(false);

  constructor(
    private auth: Auth,
    private router: Router,
  ) {}

  girisYap(): void {
    if (this.gonderiliyor()) {
      return;
    }

    this.hataMesaji.set(null);
    this.gonderiliyor.set(true);
    this.auth.giris({ eposta: this.eposta, sifre: this.sifre }).subscribe({
      next: () => this.router.navigate(['/basvurularim']),
      error: () => {
        this.hataMesaji.set('E-posta veya şifre hatalı.');
        this.gonderiliyor.set(false);
      },
    });
  }
}
