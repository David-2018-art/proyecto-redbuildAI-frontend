import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Transaccion } from '../models/transaccion.model';

@Injectable({ providedIn: 'root' })
export class Transaccionservice {
  private readonly http = inject(HttpClient);
  private readonly apiURL = 'http://localhost:8080/api/Transacciones';

  getAll(): Observable<Transaccion[]> {
    return this.http.get<Transaccion[]>(this.apiURL);
  }

  getByUser(userId: number): Observable<Transaccion[]> {
    return this.http.get<Transaccion[]>(`${this.apiURL}/usuario/${userId}`);
  }

  getById(id: number): Observable<Transaccion> {
    return this.http.get<Transaccion>(`${this.apiURL}/${id}`);
  }

  insert(transaccion: Transaccion): Observable<Transaccion> {
    return this.http.post<Transaccion>(this.apiURL, transaccion);
  }

  update(transaccion: Transaccion): Observable<Transaccion> {
    return this.http.put<Transaccion>(this.apiURL, transaccion);
  }

  delete(id: number): Observable<string> {
    return this.http.delete(`${this.apiURL}/${id}`, { responseType: 'text' });
  }

  getReceived(): Observable<Transaccion[]> {
  return this.http.get<Transaccion[]>(`${this.apiURL}/recibidas`);
}
}
