import { Component } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { PublicationPhotoService } from '../../../services/publicationphotoservice';
import { PublicationPhotoDTO } from '../../../models/publicationPhotoDTO';

@Component({
  imports: [ReactiveFormsModule, MatInputModule, MatButtonModule],
  selector: 'app-ppinsertcomponent',
  styleUrl: './ppinsertcomponent.css',
  templateUrl: './ppinsertcomponent.html',
})
export class Ppinsertcomponent {
  mensaje: string = '';
  formPhoto: any;

  constructor(
    private fb: FormBuilder,
    private ppS: PublicationPhotoService,
  ) {
    this.formPhoto = this.fb.group({
      urlPhoto: ['', [Validators.required, Validators.pattern(/^https?:\/\/\S+$/i)]],
      descriptionPhoto: [''],
      uploadDate: ['', Validators.required],
      idPublication: [
        null,
        [Validators.required, Validators.min(1), Validators.pattern(/^[1-9]\d*$/)],
      ],
    });
  }

  registrar(): void {
    if (this.formPhoto.invalid) {
      this.mensaje = 'Complete correctamente los campos obligatorios';
      return;
    }

    const photo: PublicationPhotoDTO = {
      idPhoto: 0,
      ...this.formPhoto.value,
    };

    this.ppS.insertPublicationPhoto(photo).subscribe({
      next: () => {
        this.mensaje = 'Foto registrada correctamente';
        this.formPhoto.reset();
      },
      error: (error) => {
        console.error('Error al registrar la foto:', error);
        this.mensaje = 'Error al registrar la foto';
      },
    });
  }
}
