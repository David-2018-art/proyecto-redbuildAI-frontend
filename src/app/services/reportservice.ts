import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable } from 'rxjs';

import {
  CategoryProductCountDTO,
  UserCountByRoleDTO,
} from '../models/reportes.model';

@Injectable({
  providedIn: 'root',
})
export class Reportservice {
  private readonly http = inject(HttpClient);
  private readonly apiURL = 'http://localhost:8080/api';

  productosPorCategoria(): Observable<CategoryProductCountDTO[]> {
    return this.http.get<CategoryProductCountDTO[]>(
      `${this.apiURL}/Categories/cantidad-productos`,
    );
  }

  usuariosPorRol(): Observable<UserCountByRoleDTO[]> {
    return this.http.get<UserCountByRoleDTO[]>(
      `${this.apiURL}/Users/cantidad-por-rol`,
    );
  }
}

export function mensajeErrorReporte(error: HttpErrorResponse): string {
  if (error.status === 401) {
    return 'Tu sesión no es válida. Inicia sesión nuevamente.';
  }

  if (error.status === 403) {
    return 'Este reporte está disponible únicamente para administradores.';
  }

  if (error.status === 0) {
    return 'No se pudo conectar con el backend.';
  }

  return 'No se pudo cargar el reporte. Inténtalo nuevamente.';
}