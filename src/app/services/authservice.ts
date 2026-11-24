import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { LoginRequest, LoginResponse } from '../models/login.model';

const SESSION_KEY = 'rebuild-auth';

@Injectable({ providedIn: 'root' })
export class Authservice {
  private readonly http = inject(HttpClient);
  private readonly apiURL = 'https://proyecto-redbuildai-backend.onrender.com/login';
  readonly session = signal<LoginResponse | null>(this.readSession());

  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(this.apiURL, credentials).pipe(
      tap((session) => {
        sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
        this.session.set(session);
      }),
    );
  }

  logout(): void {
    sessionStorage.removeItem(SESSION_KEY);
    this.session.set(null);
  }

  get isAuthenticated(): boolean {
    return this.session() !== null;
  }

  get token(): string | null {
    return this.session()?.token ?? null;
  }

  private readSession(): LoginResponse | null {
    const value = sessionStorage.getItem(SESSION_KEY);
    if (!value) return null;
    try {
      return JSON.parse(value) as LoginResponse;
    } catch {
      sessionStorage.removeItem(SESSION_KEY);
      return null;
    }
  }
}
