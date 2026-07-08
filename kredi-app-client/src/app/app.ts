import { Component, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { Auth } from './core/auth';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('kredi-app-client');

  constructor(
    protected auth: Auth,
    private router: Router,
  ) {}

  cikisYap(): void {
    this.auth.cikisYap();
    this.router.navigate(['/login']);
  }
}
