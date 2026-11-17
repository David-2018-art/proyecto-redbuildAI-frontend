import { Component, inject, signal } from '@angular/core';
import {
  RouterOutlet,
  RouterLink,
  RouterLinkActive,
} from '@angular/router';
import { Authservice } from './services/authservice';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  protected readonly title = signal('rebuild-ai-frontend');
  readonly auth = inject(Authservice);

  cerrarSesion(): void {
    this.auth.logout();
  }
}