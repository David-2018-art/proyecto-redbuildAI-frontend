import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { Product } from '../models/product.model';

@Injectable({
  providedIn: 'root',
})
export class Productservice {
  private readonly apiURL = 'http://localhost:8080/api/Products';

  constructor(private http: HttpClient) {}

  getProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(this.apiURL);
  }

  getProductById(id: number): Observable<Product> {
    return this.http.get<Product>(`${this.apiURL}/${id}`);
  }

  insertProduct(product: Product): Observable<Product> {
    return this.http.post<Product>(this.apiURL, product);
  }

  updateProduct(product: Product): Observable<Product> {
    return this.http.put<Product>(this.apiURL, product);
  }

  deleteProduct(id: number): Observable<string> {
    return this.http.delete(`${this.apiURL}/${id}`, {
      responseType: 'text',
    });
  }
}