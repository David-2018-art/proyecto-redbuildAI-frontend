import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import {
  Category,
  CategoryProductCount,
} from '../models/category.model';

@Injectable({
  providedIn: 'root',
})
export class Categoryservice {
  private readonly apiURL = 'http://localhost:8080/api/Categories';

  constructor(private http: HttpClient) {}

  getCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(this.apiURL);
  }

  getCategoryById(id: number): Observable<Category> {
    return this.http.get<Category>(`${this.apiURL}/${id}`);
  }

  insertCategory(category: Category): Observable<Category> {
    return this.http.post<Category>(this.apiURL, category);
  }

  updateCategory(category: Category): Observable<Category> {
    return this.http.put<Category>(this.apiURL, category);
  }

  deleteCategory(id: number): Observable<string> {
    return this.http.delete(`${this.apiURL}/${id}`, {
      responseType: 'text',
    });
  }

  getCategoriesByStatus(
    estado: 'Activo' | 'Inactivo',
  ): Observable<Category[]> {
    return this.http.get<Category[]>(`${this.apiURL}/estado`, {
      params: { estado },
    });
  }

  countProductsByCategory(): Observable<CategoryProductCount[]> {
    return this.http.get<CategoryProductCount[]>(
      `${this.apiURL}/cantidad-productos`,
    );
  }
}