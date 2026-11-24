import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Role } from '../models/role';

@Injectable({
  providedIn: 'root',
})
export class Roleservice {
  private apiURL = 'https://proyecto-redbuildai-backend.onrender.com/api/Roles';

  constructor(private http: HttpClient) {}

  getRoles(): Observable<Role[]> {
    return this.http.get<Role[]>(this.apiURL);
  }

  insertRole(role: Role): Observable<Role> {
    return this.http.post<Role>(this.apiURL, role);
  }

  deleteRole(id: number): Observable<string> {
    return this.http.delete(`${this.apiURL}/${id}`, {
      responseType: 'text',
    });
  }

  getRoleById(id: number): Observable<Role> {
  return this.http.get<Role>(`${this.apiURL}/${id}`);
}

updateRole(role: Role): Observable<Role> {
  return this.http.put<Role>(this.apiURL, role);
}
}