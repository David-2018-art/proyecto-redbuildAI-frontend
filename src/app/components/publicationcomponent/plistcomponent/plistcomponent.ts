import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';

import { Publicationservice } from '../../../services/publicationservice';
import { Authservice } from '../../../services/authservice';
import { PublicationDTO } from '../../../models/publicationDTO';
import { PaginadorComponent } from '../../../shared/paginador.component';
@Component({
  selector: 'app-plistcomponent',
  imports: [MatTableModule, MatButtonModule, RouterLink,PaginadorComponent],
  templateUrl: './plistcomponent.html',
  styleUrl: './plistcomponent.css',
})
export class Plistcomponent implements OnInit {
  private readonly service = inject(Publicationservice);
  private readonly auth = inject(Authservice);
  private readonly router = inject(Router);
  private readonly cdr = inject(ChangeDetectorRef);

  publicaciones: PublicationDTO[] = [];
  displayedColumns = [
    'id', 'title', 'operationType', 'status',
    'productId', 'locationId', 'acciones',
  ];
  cargando = true;
  eliminando = false;
  mensaje = '';

  ngOnInit(): void {
    this.listar();
  }

  listar(): void {
    this.cargando = true;
    this.mensaje = '';

    this.service.getPublications().subscribe({
      next: data => {
        this.publicaciones = data;
        this.cargando = false;
        this.cdr.markForCheck();
      },
      error: error => {
        this.cargando = false;
        this.mensaje = error.status === 401
          ? 'Debes iniciar sesión.'
          : 'No se pudieron cargar las publicaciones.';
        this.cdr.markForCheck();
      },
    });
  }

  puedeGestionar(publicacion: PublicationDTO): boolean {
    const session = this.auth.session();
    return !!session && (
      session.role === 'Administrador' ||
      publicacion.publisherUserId === session.idUser
    );
  }

  editar(id: number | undefined): void {
    if (id) this.router.navigate(['/publicaciones/editar', id]);
  }

  eliminar(id: number | undefined): void {
    if (!id || this.eliminando) return;
    if (!confirm('¿Eliminar esta publicación?')) return;

    this.eliminando = true;

    this.service.deletePublication(id).subscribe({
      next: () => {
        this.eliminando = false;
        this.listar();
      },
      error: error => {
        this.eliminando = false;
        this.mensaje =
          error.status === 409
            ? 'No se puede eliminar: tiene fotos o transacciones asociadas.'
            : error.status === 403
              ? 'No tienes permiso para eliminar esta publicación.'
              : 'No se pudo eliminar la publicación.';
        this.cdr.markForCheck();
      },
    });
  }
}