import { Component, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { RouterLink } from '@angular/router';

import { PublicationPhotoService } from '../../../services/publicationphotoservice';
import { Publicationservice } from '../../../services/publicationservice';
import { Authservice } from '../../../services/authservice';

import { PublicationPhotoDTO } from '../../../models/publicationPhotoDTO';
import { PublicationDTO } from '../../../models/publicationDTO';

@Component({
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    RouterLink
  ],
  selector: 'app-ppinsertcomponent',
  styleUrl: './ppinsertcomponent.css',
  templateUrl: './ppinsertcomponent.html',
})
export class Ppinsertcomponent implements OnInit {

  readonly publicaciones = signal<PublicationDTO[]>([]);
  readonly cargando = signal(true);
  readonly guardando = signal(false);

  readonly mensaje = signal('');
  readonly exito = signal(false);

  readonly urlVistaPrevia = signal('');
  readonly imagenCargada = signal(false);
  readonly errorImagen = signal(false);

  formPhoto;

  constructor(
    private fb: FormBuilder,
    private ppS: PublicationPhotoService,
    private publicationService: Publicationservice,
    private auth: Authservice
  ) {

    this.formPhoto = this.fb.nonNullable.group({

      urlPhoto: [
        '',
        [
          Validators.required,
          Validators.pattern(/^https?:\/\/\S+$/i)
        ]
      ],

      descriptionPhoto: [''],

      idPublication: [
        0,
        [
          Validators.required,
          Validators.min(1)
        ]
      ],

    });

  }

  ngOnInit(): void {

    const session = this.auth.session();

    if (!session) {

      this.cargando.set(false);
      this.mensaje.set('Debes iniciar sesión.');

      return;

    }

    this.publicationService.getPublications().subscribe({

      next: data => {

        this.publicaciones.set(
          data.filter(
            p => p.publisherUserId === session.idUser
          )
        );

        this.cargando.set(false);

      },

      error: () => {

        this.cargando.set(false);

        this.mensaje.set(
          'No se pudieron cargar tus publicaciones.'
        );

      }

    });

  }

  actualizarVistaPrevia(): void {

    const control = this.formPhoto.controls.urlPhoto;
    const url = control.value.trim();

    this.imagenCargada.set(false);
    this.errorImagen.set(false);

    if (!url || control.invalid) {

      this.urlVistaPrevia.set('');
      return;

    }

    this.urlVistaPrevia.set(url);

  }

  imagenCorrecta(): void {

    this.imagenCargada.set(true);
    this.errorImagen.set(false);

  }

  imagenIncorrecta(): void {

    this.imagenCargada.set(false);
    this.errorImagen.set(true);

  }

  registrar(): void {

    if (this.guardando()) return;

    this.exito.set(false);
    this.mensaje.set('');

    if (this.formPhoto.invalid) {

      this.formPhoto.markAllAsTouched();

      this.mensaje.set(
        'Completa correctamente los campos obligatorios.'
      );

      return;

    }

    if (!this.imagenCargada()) {

      this.mensaje.set(
        'Ingresa una URL de imagen que pueda visualizarse.'
      );

      return;

    }

    const value = this.formPhoto.getRawValue();

    const publicacionValida = this.publicaciones().some(
      p => p.id === value.idPublication
    );

    if (!publicacionValida) {

      this.mensaje.set('Selecciona una publicación propia.');

      return;

    }

    const photo: PublicationPhotoDTO = {

      idPhoto: 0,
      urlPhoto: value.urlPhoto.trim(),
      descriptionPhoto: value.descriptionPhoto.trim(),
      idPublication: value.idPublication,
      uploadDate: null,

    };

    this.guardando.set(true);

    this.ppS.insertPublicationPhoto(photo).subscribe({

      next: () => {

        this.guardando.set(false);
        this.exito.set(true);

        this.mensaje.set(
          'Fotografía registrada correctamente.'
        );

        this.formPhoto.reset();

        this.urlVistaPrevia.set('');
        this.imagenCargada.set(false);
        this.errorImagen.set(false);

      },

      error: error => {

        this.guardando.set(false);
        this.exito.set(false);

        this.mensaje.set(

          error.status === 403
            ? 'No tienes permiso para agregar esta fotografía.'

            : error.error?.message ??
              'No se pudo registrar la fotografía.'

        );

      }

    });

  }

}