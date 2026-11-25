import { Component, OnInit, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { Router, RouterLink } from '@angular/router';

import { PublicationPhotoService } from '../../../services/publicationphotoservice';
import { Publicationservice } from '../../../services/publicationservice';
import { Authservice } from '../../../services/authservice';

import { PublicationPhotoDTO } from '../../../models/publicationPhotoDTO';
import { PublicationDTO } from '../../../models/publicationDTO';
import { PaginadorComponent } from '../../../shared/paginador.component';

@Component({
  imports: [
    MatTableModule,
    MatButtonModule,
    PaginadorComponent,
    DatePipe,
    RouterLink
  ],
  selector: 'app-pplistcomponent',
  styleUrl: './pplistcomponent.css',
  templateUrl: './pplistcomponent.html',
})
export class Pplistcomponent implements OnInit {

  readonly fotos = signal<PublicationPhotoDTO[]>([]);
  readonly publicaciones = signal<PublicationDTO[]>([]);

  readonly cargando = signal(true);
  readonly eliminando = signal<number | null>(null);

  readonly mensaje = signal('');
  readonly exito = signal(false);

  readonly imagenesFallidas = signal<number[]>([]);

  displayedColumns: string[] = [
    'idPhoto',
    'urlPhoto',
    'descriptionPhoto',
    'uploadDate',
    'idPublication',
    'acciones',
  ];

  constructor(
    private ppS: PublicationPhotoService,
    private publicationService: Publicationservice,
    private auth: Authservice,
    private router: Router
  ) {}

  ngOnInit(): void {

    this.listar();
    this.cargarPublicaciones();

  }

  listar(): void {

    this.cargando.set(true);

    this.ppS.getPublicationPhotos().subscribe({

      next: data => {

        this.fotos.set(data);
        this.imagenesFallidas.set([]);
        this.cargando.set(false);

      },

      error: error => {

        console.error('Error al listar las fotos:', error);

        this.cargando.set(false);
        this.exito.set(false);

        this.mensaje.set(
          'No se pudieron cargar las fotografías.'
        );

      }

    });

  }

  cargarPublicaciones(): void {

    this.publicationService.getPublications().subscribe({

      next: data => {

        this.publicaciones.set(data);

      },

      error: error => {

        console.error(
          'Error al cargar las publicaciones:',
          error
        );

      }

    });

  }

  nombrePublicacion(id: number): string {

    return this.publicaciones().find(
      p => p.id === id
    )?.title ?? `Publicación #${id}`;

  }

  puedeGestionar(foto: PublicationPhotoDTO): boolean {

    const session = this.auth.session();

    if (!session) return false;

    const rol = String(session.role)
      .toUpperCase()
      .replace(/^ROLE_/, '');

    if (rol === 'ADMIN' || rol === 'ADMINISTRADOR') {
      return true;
    }

    const publicacion = this.publicaciones().find(
      p => p.id === foto.idPublication
    );

    return publicacion?.publisherUserId === session.idUser;

  }

  errorImagen(id: number): void {

    this.imagenesFallidas.update(
      ids => [...ids, id]
    );

  }

  editar(id: number): void {

    const foto = this.fotos().find(
      f => f.idPhoto === id
    );

    if (!foto || !this.puedeGestionar(foto)) return;

    this.router.navigate([
      '/fotos-publicaciones/editar',
      id
    ]);

  }

  eliminar(id: number): void {

    if (this.eliminando() !== null) return;

    const foto = this.fotos().find(
      f => f.idPhoto === id
    );

    if (!foto || !this.puedeGestionar(foto)) return;

    const confirmado = confirm(
      '¿Estás seguro de eliminar esta fotografía?'
    );

    if (!confirmado) return;

    this.eliminando.set(id);
    this.mensaje.set('');
    this.exito.set(false);

    this.ppS.deletePublicationPhoto(id).subscribe({

      next: () => {

        this.fotos.update(
          fotos => fotos.filter(
            foto => foto.idPhoto !== id
          )
        );

        this.imagenesFallidas.update(
          ids => ids.filter(
            idFoto => idFoto !== id
          )
        );

        this.eliminando.set(null);
        this.exito.set(true);

        this.mensaje.set(
          'Fotografía eliminada correctamente.'
        );

      },

      error: error => {

        console.error('Error al eliminar la foto:', error);

        this.eliminando.set(null);
        this.exito.set(false);

        this.mensaje.set(

          error.status === 403
            ? 'No tienes permiso para eliminar esta fotografía.'
            : 'No se pudo eliminar la fotografía.'

        );

      }

    });

  }

}