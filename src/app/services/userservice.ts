import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { User } from '../models/user.model';
import { UserRegister } from '../models/user-register.model';

@Injectable({
  providedIn: 'root',
})
export class Userservice {
  private apiURL = 'http://localhost:8080/api/Users';

  constructor(private http: HttpClient) {}

  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(this.apiURL);
  }

  insertUser(user: UserRegister): Observable<User> {
    return this.http.post<User>(this.apiURL, user);
  }

  deleteUser(id: number): Observable<string> {
    return this.http.delete(`${this.apiURL}/${id}`, {
      responseType: 'text',
    });
  }
}