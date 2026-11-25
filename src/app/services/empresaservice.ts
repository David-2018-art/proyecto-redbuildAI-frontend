import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { EmpresaResumen } from '../models/empresa-resumen.model';
import { environment } from '../../environments/environment';
@Injectable({ providedIn: 'root' })
export class Empresaservice {
  private readonly http = inject(HttpClient);

  private readonly apiURL =
    `${environment.apiUrl}/api/empresas/mi-resumen`;

  obtenerMiResumen(): Observable<EmpresaResumen> {
    return this.http.get<EmpresaResumen>(this.apiURL);
  }
}