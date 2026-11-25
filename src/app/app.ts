import { Component, inject, signal } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { filter } from 'rxjs';

import { Menucomponent } from './components/menucomponent/menucomponent';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Menucomponent],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {

  protected readonly title = signal('rebuild-ai-frontend');

  private readonly router = inject(Router);

  readonly esLogin = signal(
    this.esRutaLogin(this.router.url)
  );

  constructor() {

    this.router.events
      .pipe(
        filter(
          (evento): evento is NavigationEnd =>
            evento instanceof NavigationEnd,
        ),
        takeUntilDestroyed(),
      )
      .subscribe((evento) => {

        this.esLogin.set(
          this.esRutaLogin(evento.urlAfterRedirects)
        );

      });

  }

  private esRutaLogin(url: string): boolean {

    const ruta = url
      .split(/[?#;]/)[0]
      .replace(/\/+$/, '');

    return ruta === '/login' || ruta === '/registro';

  }

}