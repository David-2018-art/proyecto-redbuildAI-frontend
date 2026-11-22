import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface MaterialAnalysis {
  identificado: boolean;
  nameProduct: string;
  descriptionProduct: string;
  material: string;
  colour: string;
}

@Injectable({
  providedIn: 'root',
})
export class MaterialAnalysisService {
  private readonly http = inject(HttpClient);

  private readonly apiURL =
    'http://localhost:8080/api/material-analysis';

  analizar(foto: File): Observable<MaterialAnalysis> {
    const datos = new FormData();
    datos.append('foto', foto);

    return this.http.post<MaterialAnalysis>(this.apiURL, datos);
  }
}