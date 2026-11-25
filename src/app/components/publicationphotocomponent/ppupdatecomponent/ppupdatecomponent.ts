import { Component, OnInit, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';

import { PublicationPhotoService } from '../../../services/publicationphotoservice';
import { Publicationservice } from '../../../services/publicationservice';

import { PublicationPhotoDTO } from '../../../models/publicationPhotoDTO';

@Component({
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    DatePipe,
    RouterLink
  ],
  selector: 'app-ppupdatecomponent',
  styleUrl: './ppupdatecomponent.css',
  templateUrl: './ppupdatecomponent.html',
})
export class Ppupdatecomponent implements OnInit {

  idPhoto: number = 0;

  readonly fotoOriginal = signal<PublicationPhotoDTO | null>(null);
  readonly nombrePublicacion = signal('');

  readonly mensaje = signal('');
  readonly exito = signal(false);

  readonly cargando = signal(true);
  readonly guardando = signal(false);

  readonly urlVistaPrevia = signal('');
  readonly imagenCargada = signal(false);
  readonly errorImagen = signal(false);

  formPhoto;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private ppS: PublicationPhotoService,
    private publicationService: Publicationservice
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

    });

  }

  ngOnInit(): void {

    this.idPhoto = Number(
      this.route.snapshot.paramMap.get('id')
    );

    if (
      !Number.isInteger(this.idPhoto) ||
      this.idPhoto <= 0
    ) {

      this.mensaje.set('ID de fotografía inválido.');
      this.cargando.set(false);

      return;

    }

    this.ppS.getPublicationPhotoById(this.idPhoto).subscribe({

      next: data => {

        this.fotoOriginal.set(data);

        this.formPhoto.patchValue({

          urlPhoto: data.urlPhoto,
          descriptionPhoto: data.descriptionPhoto ?? ''

        });

        this.actualizarVistaPrevia();

        this.cargarPublicacion(data.idPublication);

        this.cargando.set(false);

      },

      error: error => {

        console.error('Error al cargar la fotografía:', error);

        this.mensaje.set(

          error.status === 404

            ? 'La fotografía no existe.'

            : 'No se pudo cargar la fotografía.'

        );

        this.cargando.set(false);

      }

    });

  }

  cargarPublicacion(id: number): void {

    this.publicationService.getPublicationById(id).subscribe({

      next: data => {

        this.nombrePublicacion.set(data.title);

      },

      error: () => {

        this.nombrePublicacion.set(`Publicación #${id}`);

      }

    });

  }

  actualizarVistaPrevia(): void {

    const control = this.formPhoto.controls.urlPhoto;
    const url = control.value.trim();

    if (!url || control.invalid) {

      this.urlVistaPrevia.set('');
      this.imagenCargada.set(false);
      this.errorImagen.set(false);

      return;

    }

    if (url === this.urlVistaPrevia()) return;

    this.imagenCargada.set(false);
    this.errorImagen.set(false);

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

  restaurar(): void {

    const original = this.fotoOriginal();

    if (!original || this.guardando()) return;

    this.formPhoto.reset({

      urlPhoto: original.urlPhoto,
      descriptionPhoto: original.descriptionPhoto ?? ''

    });

    this.actualizarVistaPrevia();

    this.mensaje.set('');
    this.exito.set(false);

  }

  actualizar(): void {

    if (this.guardando()) return;

    this.mensaje.set('');
    this.exito.set(false);

    const original = this.fotoOriginal();

    if (!original) {

      this.mensaje.set(
        'No se han cargado los datos de la fotografía.'
      );

      return;

    }

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

    const valores = this.formPhoto.getRawValue();

    const photo: PublicationPhotoDTO = {

      idPhoto: original.idPhoto,

      urlPhoto: valores.urlPhoto.trim(),

      descriptionPhoto: valores.descriptionPhoto.trim(),

      uploadDate: original.uploadDate,

      idPublication: original.idPublication,

    };

    this.guardando.set(true);

    this.ppS.updatePublicationPhoto(photo).subscribe({

      next: () => {

        this.fotoOriginal.set(photo);

        this.guardando.set(false);
        this.exito.set(true);

        this.mensaje.set(
          'Fotografía actualizada correctamente.'
        );

        this.formPhoto.markAsPristine();

      },

      error: error => {

        console.error(
          'Error al actualizar la fotografía:',
          error
        );

        this.guardando.set(false);
        this.exito.set(false);

        this.mensaje.set(

          error.status === 403

            ? 'No tienes permiso para modificar esta fotografía.'

            : 'No se pudo actualizar la fotografía.'

        );

      }

    });

  }

}