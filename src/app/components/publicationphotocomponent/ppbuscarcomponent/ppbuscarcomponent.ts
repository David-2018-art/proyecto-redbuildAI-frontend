import { Component, OnInit, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { RouterLink } from '@angular/router';

import { PublicationPhotoService } from '../../../services/publicationphotoservice';
import { Publicationservice } from '../../../services/publicationservice';

import { PublicationPhotoDTO } from '../../../models/publicationPhotoDTO';
import { PublicationDTO } from '../../../models/publicationDTO';

@Component({
  imports: [
    FormsModule,
    DatePipe,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    RouterLink
  ],
  selector: 'app-ppbuscarcomponent',
  styleUrl: './ppbuscarcomponent.css',
  templateUrl: './ppbuscarcomponent.html',
})
export class Ppbuscarcomponent implements OnInit {

  idPhoto: number | null = null;
  idPublication: number | null = null;

  readonly publicaciones = signal<PublicationDTO[]>([]);
  readonly fotos = signal<PublicationPhotoDTO[]>([]);

  readonly mensaje = signal('');
  readonly exito = signal(false);
  readonly buscando = signal(false);
  readonly cargandoPublicaciones = signal(true);

  readonly imagenesFallidas = signal<number[]>([]);

  constructor(
    private ppS: PublicationPhotoService,
    private publicationService: Publicationservice
  ) {}

  ngOnInit(): void {

    this.publicationService.getPublications().subscribe({

      next: data => {

        this.publicaciones.set(data);
        this.cargandoPublicaciones.set(false);

      },

      error: error => {

        console.error(error);

        this.cargandoPublicaciones.set(false);
        this.mensaje.set('No se pudieron cargar las publicaciones.');

      }

    });

  }

  nombrePublicacion(id: number): string {

    return this.publicaciones().find(
      p => p.id === id
    )?.title ?? `Publicación #${id}`;

  }

  limpiarResultados(): void {

    this.fotos.set([]);
    this.mensaje.set('');
    this.exito.set(false);
    this.imagenesFallidas.set([]);

  }

  buscarPorId(): void {

    if (this.buscando()) return;

    this.limpiarResultados();

    if (
      this.idPhoto === null ||
      !Number.isInteger(this.idPhoto) ||
      this.idPhoto <= 0
    ) {

      this.mensaje.set('Ingresa un ID de fotografía válido.');
      return;

    }

    this.buscando.set(true);

    this.ppS.getPublicationPhotoById(this.idPhoto).subscribe({

      next: data => {

        this.fotos.set([data]);
        this.exito.set(true);
        this.buscando.set(false);

        this.mensaje.set(
          'Fotografía encontrada correctamente.'
        );

      },

      error: error => {

        this.buscando.set(false);

        this.mensaje.set(
          error.status === 404
            ? 'No existe una fotografía con ese ID.'
            : 'No se pudo consultar la fotografía.'
        );

      }

    });

  }

  buscarPorPublicacion(): void {

    if (this.buscando()) return;

    this.limpiarResultados();

    if (
      this.idPublication === null ||
      !this.publicaciones().some(
        p => p.id === this.idPublication
      )
    ) {

      this.mensaje.set('Selecciona una publicación.');
      return;

    }

    this.buscando.set(true);

    this.ppS.getPhotosByPublicationId(
      this.idPublication
    ).subscribe({

      next: data => {

        this.fotos.set(data);
        this.exito.set(data.length > 0);
        this.buscando.set(false);

        this.mensaje.set(

          data.length === 0

            ? 'Esta publicación todavía no tiene fotografías.'

            : data.length === 1

              ? '1 fotografía encontrada.'

              : `${data.length} fotografías encontradas.`

        );

      },

      error: error => {

        this.buscando.set(false);

        this.mensaje.set(
          error.status === 404
            ? 'No se encontró el recurso solicitado.'
            : 'No se pudieron consultar las fotografías.'
        );

      }

    });

  }

  errorImagen(id: number): void {

    this.imagenesFallidas.update(
      ids => [...ids, id]
    );

  }

  limpiar(): void {

    if (this.buscando()) return;

    this.idPhoto = null;
    this.idPublication = null;

    this.limpiarResultados();

  }

}