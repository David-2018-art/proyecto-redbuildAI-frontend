import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PublicationPhotoDTO } from '../models/publicationPhotoDTO';
import { environment } from '../../environments/environment';
@Injectable({
  providedIn: 'root',
})
export class PublicationPhotoService {
  private apiURL = `${environment.apiUrl}/publication-photos`;

  constructor(private http: HttpClient) {}

  getPublicationPhotos(): Observable<PublicationPhotoDTO[]> {
    return this.http.get<PublicationPhotoDTO[]>(this.apiURL);
  }

  getPublicationPhotoById(id: number): Observable<PublicationPhotoDTO> {
    return this.http.get<PublicationPhotoDTO>(`${this.apiURL}/${id}`);
  }

  getPhotosByPublicationId(idPublication: number): Observable<PublicationPhotoDTO[]> {
    return this.http.get<PublicationPhotoDTO[]>(
      `${this.apiURL}/publication/${idPublication}`
    );
  }

  insertPublicationPhoto(photo: PublicationPhotoDTO): Observable<PublicationPhotoDTO> {
    return this.http.post<PublicationPhotoDTO>(this.apiURL, photo);
  }

  updatePublicationPhoto(photo: PublicationPhotoDTO): Observable<PublicationPhotoDTO> {
    return this.http.put<PublicationPhotoDTO>(
      `${this.apiURL}/${photo.idPhoto}`,
      photo
    );
  }

  deletePublicationPhoto(id: number): Observable<string> {
    return this.http.delete(`${this.apiURL}/${id}`, {
      responseType: 'text',
    });
  }
}
