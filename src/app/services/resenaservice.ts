import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Resena } from '../models/resena.model';
import { environment } from '../../environments/environment';
@Injectable({ providedIn: 'root' })
export class Resenaservice {
  private readonly http = inject(HttpClient);
  private readonly apiURL = `${environment.apiUrl}/api/Resenas`;

  getAll(): Observable<Resena[]> {
    return this.http.get<Resena[]>(this.apiURL);
  }

  getByUser(userId: number): Observable<Resena[]> {
    return this.http.get<Resena[]>(`${this.apiURL}/usuario/${userId}`);
  }

  getById(id: number): Observable<Resena> {
    return this.http.get<Resena>(`${this.apiURL}/${id}`);
  }

  insert(resena: Resena): Observable<Resena> {
    return this.http.post<Resena>(this.apiURL, resena);
  }

  update(resena: Resena): Observable<Resena> {
    return this.http.put<Resena>(this.apiURL, resena);
  }

  delete(id: number): Observable<string> {
    return this.http.delete(`${this.apiURL}/${id}`, { responseType: 'text' });
  }
}
