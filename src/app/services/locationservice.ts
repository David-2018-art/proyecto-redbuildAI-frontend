import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { LocationDTO } from '../models/locationDTO';

@Injectable({
    providedIn: 'root'
})
export class LocationService {
    private apiURL = 'http://localhost:8080/api/Locations';
    constructor(private http: HttpClient) {}
    getLocation(): Observable<LocationDTO[]> {
        return this.http.get<LocationDTO[]>(this.apiURL);
    }

    insertLocation(location: LocationDTO): Observable<LocationDTO> {
        return this.http.post<LocationDTO>(this.apiURL, location);
    }

    deleteLocation(id: number): Observable<string> {
        return this.http.delete(`${this.apiURL}/${id}`, {
            responseType: 'text'
        })
    }
}