import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, forkJoin, map, switchMap, of } from 'rxjs';
import { environment } from '../../environments/environment';
import { Transaccionservice } from './transaccionservice';
import { Transaccion } from '../models/transaccion.model';
import { Resena } from '../models/resena.model';
import { Publicationservice } from './publicationservice';
import { PublicationPhotoService } from './publicationphotoservice';

import {
  CategoryProductCountDTO,
  UserCountByRoleDTO,
  PublicationCountByStatusDTO,
  ProductPublicationCountDTO,
  RoleCountByStatusDTO,
  LocationCountByDepartmentDTO,
  TransactionCountByStatusDTO,
  ReviewCountByScoreDTO,
  PhotoCountByPublicationDTO,
  CompletedTransactionSummaryDTO,
} from '../models/reportes.model';

import { Publication } from '../models/publication.model';
import { Productservice } from './productservice';
import { Role } from '../models/role';
import { LocationService } from './locationservice';

@Injectable({
  providedIn: 'root',
})
export class Reportservice {

  private readonly http = inject(HttpClient);
  private readonly productService = inject(Productservice);
  private readonly locationService = inject(LocationService);
  private readonly transaccionService = inject(Transaccionservice);
  private readonly apiURL = `${environment.apiUrl}/api`;
  private readonly publicationService = inject(Publicationservice);

  private readonly publicationPhotoService = inject(PublicationPhotoService);

  // REPORTE 01: PRODUCTOS POR CATEGORIA

  productosPorCategoria(): Observable<CategoryProductCountDTO[]> {
    return this.http.get<CategoryProductCountDTO[]>(
      `${this.apiURL}/Categories/cantidad-productos`,
    );
  }

  // REPORTE 02: USUARIOS POR ROL

  usuariosPorRol(): Observable<UserCountByRoleDTO[]> {
    return this.http.get<UserCountByRoleDTO[]>(
      `${this.apiURL}/Users/cantidad-por-rol`,
    );
  }

  // REPORTE 03: PUBLICACIONES POR ESTADO

  publicacionesPorEstado(): Observable<PublicationCountByStatusDTO[]> {

    const estados: Publication['status'][] = [
      'Disponible',
      'Pausada',
      'Finalizada',
      'Cancelada',
    ];

    return forkJoin(
      estados.map((estado) =>
        this.http.get<Publication[]>(
          `${environment.apiUrl}/publications/status/${estado}`,
        ).pipe(
          map((publicaciones) => ({
            status: estado,
            quantityPublications: publicaciones.length,
          })),
        ),
      ),
    );
  }

  // REPORTE 04: PUBLICACIONES POR PRODUCTO

  publicacionesPorProducto(): Observable<ProductPublicationCountDTO[]> {

    return this.productService.getProducts().pipe(

      switchMap((productos) => {

        const productosValidos = productos.filter(
          (producto): producto is typeof producto & { idProduct: number } =>
            typeof producto.idProduct === 'number',
        );

        if (productosValidos.length === 0) {
          return of([]);
        }

        return forkJoin(
          productosValidos.map((producto) => {

            const id = producto.idProduct;

            return this.http.get<number>(
              `${environment.apiUrl}/publications/product/${id}/count`,
            ).pipe(
              map((cantidad) => ({
                idProduct: id,
                nameProduct: producto.nameProduct,
                quantityPublications: Number(cantidad),
              })),
            );
          }),
        );

      }),

      map((filas) =>
        filas.sort(
          (a, b) => b.quantityPublications - a.quantityPublications,
        ),
      ),

    );
  }

  // REPORTE 05: ROLES POR ESTADO

  rolesPorEstado(): Observable<RoleCountByStatusDTO[]> {

    const estados = ['Activo', 'Inactivo'];

    return forkJoin(
      estados.map((estado) =>
        this.http.get<Role[]>(
          `${this.apiURL}/Roles/estados`,
          {
            params: {
              status: estado,
            },
          },
        ).pipe(
          map((roles) => ({
            status: estado,
            quantityRoles: roles.length,
          })),
        ),
      ),
    );
  }

  // REPORTE 06: UBICACIONES POR DEPARTAMENTO

  ubicacionesPorDepartamento(): Observable<LocationCountByDepartmentDTO[]> {

    return this.locationService.getLocation().pipe(

      switchMap((ubicaciones) => {

        const departamentos = [
          ...new Set(
            ubicaciones
              .map((ubicacion) => ubicacion.department)
              .filter((department) =>
                typeof department === 'string' &&
                department.trim().length > 0,
              ),
          ),
        ];

        if (departamentos.length === 0) {
          return of([]);
        }

        return forkJoin(
          departamentos.map((department) =>

            this.locationService
              .getLocationsByDepartment(department)
              .pipe(

                map((ubicacionesDepartamento) => ({
                  department: department,
                  quantityLocations: ubicacionesDepartamento.length,
                })),

              ),

          ),
        );

      }),

      map((filas) =>
        filas.sort(
          (a, b) => b.quantityLocations - a.quantityLocations,
        ),
      ),

    );

  }

  // REPORTE 07: TRANSACCIONES POR ESTADO

transaccionesPorEstado(): Observable<TransactionCountByStatusDTO[]> {

  const estados: Transaccion['statusTransaction'][] = [
    'Solicitada',
    'Reservada',
    'Completada',
    'Rechazada',
    'Cancelada',
  ];

  return this.transaccionService.getAll().pipe(

    map((transacciones) =>
      estados.map((estado) => ({
        status: estado,
        quantityTransactions: transacciones.filter(
          (transaccion) =>
            transaccion.statusTransaction === estado,
        ).length,
      })),
    ),

  );

}

// REPORTE 08: DISTRIBUCION DE CALIFICACIONES

resenasPorCalificacion(): Observable<ReviewCountByScoreDTO[]> {

  const calificaciones = [1, 2, 3, 4, 5];

  return this.http.get<Resena[]>(
    `${this.apiURL}/Resenas`,
  ).pipe(

    map((resenas) =>
      calificaciones.map((score) => ({
        score: score,
        quantityReviews: resenas.filter(
          (resena) => Number(resena.scoreResena) === score,
        ).length,
      })),
    ),

  );

}

// REPORTE 09: FOTOGRAFIAS POR PUBLICACION

fotografiasPorPublicacion(): Observable<PhotoCountByPublicationDTO[]> {

  return this.publicationService.getPublications().pipe(

    switchMap((publicaciones) => {

      const publicacionesValidas = publicaciones.filter(
        (publicacion): publicacion is typeof publicacion & { id: number } =>
          typeof publicacion.id === 'number',
      );

      if (publicacionesValidas.length === 0) {
        return of<PhotoCountByPublicationDTO[]>([]);
      }

      return forkJoin(

        publicacionesValidas.map((publicacion) =>

          this.publicationPhotoService
            .getPhotosByPublicationId(publicacion.id)
            .pipe(

              map((fotos) => ({

                idPublication: publicacion.id,

                titlePublication: publicacion.title,

                quantityPhotos: fotos.length,

              })),

            ),

        ),

      );

    }),

    map((filas) =>
      filas.sort(
        (a, b) => b.quantityPhotos - a.quantityPhotos,
      ),
    ),

  );

}


// REPORTE 10: VENTAS Y DONACIONES COMPLETADAS

ventasYDonacionesCompletadas():
  Observable<CompletedTransactionSummaryDTO[]> {

  const tipos: Transaccion['typeTransaction'][] = [
    'Venta',
    'Donacion',
  ];

  return this.transaccionService.getAll().pipe(

    map((transacciones) => {

      const completadas = transacciones.filter(
        (transaccion) =>
          transaccion.statusTransaction === 'Completada',
      );

      return tipos.map((tipo) => {

        const operaciones = completadas.filter(
          (transaccion) =>
            transaccion.typeTransaction === tipo,
        );

        return {

          typeTransaction: tipo,

          quantityTransactions: operaciones.length,

          totalAmount: operaciones.reduce(
            (suma, transaccion) =>
              suma + Number(transaccion.amountTransaction ?? 0),
            0,
          ),

        };

      });

    }),

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