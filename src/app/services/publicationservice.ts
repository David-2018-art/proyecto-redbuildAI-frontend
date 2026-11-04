

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PublicationDTO } from '../models/publicationDTO';

@Injectable({
  providedIn: 'root'
})
export class Publicationservice {

  private apiURL = 'http://localhost:8080/publications';

  constructor(private http: HttpClient) { }

  getPublications(): Observable<PublicationDTO[]> {
    return this.http.get<PublicationDTO[]>(this.apiURL);
  }

  getPublicationById(id: number): Observable<PublicationDTO> {
    return this.http.get<PublicationDTO>(`${this.apiURL}/${id}`);
  }

  getPublicationsByStatus(status: string): Observable<PublicationDTO[]> {
    return this.http.get<PublicationDTO[]>(
      `${this.apiURL}/status/${encodeURIComponent(status)}`
    );
  }

  countByProductId(productId: number): Observable<number> {
    return this.http.get<number>(
      `${this.apiURL}/product/${productId}/count`
    );
  }

  createPublication(dto: PublicationDTO): Observable<PublicationDTO> {
    return this.http.post<PublicationDTO>(this.apiURL, dto);
  }

  updatePublication(id: number, dto: PublicationDTO): Observable<PublicationDTO> {
    return this.http.put<PublicationDTO>(`${this.apiURL}/${id}`, dto);
  }

  deletePublication(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiURL}/${id}`);
  }

}
