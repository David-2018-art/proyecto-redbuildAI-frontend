import { Component, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { PublicationPhotoService } from '../../../services/publicationphotoservice';
import { PublicationPhotoDTO } from '../../../models/publicationPhotoDTO';

@Component({
  imports: [ReactiveFormsModule, MatInputModule, MatButtonModule],
  selector: 'app-ppupdatecomponent',
  styleUrl: './ppupdatecomponent.css',
  templateUrl: './ppupdatecomponent.html',
})
export class Ppupdatecomponent implements OnInit {
  idPhoto: number = 0;
  formPhoto: any;
  mensaje: string = '';
  cargando: boolean = true;
  fotoCargada: boolean = false;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private ppS: PublicationPhotoService,
  ) {}

  ngOnInit(): void {
    this.idPhoto = Number(this.route.snapshot.paramMap.get('id'));

    this.formPhoto = this.fb.group({
      idPhoto: [this.idPhoto],
      urlPhoto: ['', [Validators.required, Validators.pattern(/^https?:\/\/\S+$/i)]],
      descriptionPhoto: [''],
      uploadDate: ['', Validators.required],
      idPublication: [
        null,
        [Validators.required, Validators.min(1), Validators.pattern(/^[1-9]\d*$/)],
      ],
    });

    if (!Number.isInteger(this.idPhoto) || this.idPhoto <= 0) {
      this.mensaje = 'ID de foto inválido';
      this.cargando = false;
      return;
    }

    this.ppS.getPublicationPhotoById(this.idPhoto).subscribe({
      next: (data: PublicationPhotoDTO) => {
        this.formPhoto.patchValue({
          ...data,
          uploadDate: data.uploadDate ? data.uploadDate.substring(0, 16) : '',
        });

        this.fotoCargada = true;
        this.cargando = false;
      },
      error: (error) => {
        console.error('Error al cargar la foto:', error);
        this.mensaje = 'No se pudo cargar la foto';
        this.cargando = false;
      },
    });
  }

  actualizar(): void {
    if (this.formPhoto.invalid) {
      this.mensaje = 'Complete correctamente los campos obligatorios';
      return;
    }

    if (!this.fotoCargada) {
      this.mensaje = 'No se han cargado los datos de la foto';
      return;
    }

    const photo: PublicationPhotoDTO = {
      ...this.formPhoto.value,
      idPhoto: this.idPhoto,
    };

    this.ppS.updatePublicationPhoto(photo).subscribe({
      next: () => {
        this.mensaje = 'Foto actualizada correctamente';
      },
      error: (error) => {
        console.error('Error al actualizar la foto:', error);
        this.mensaje = 'No se pudo actualizar la foto';
      },
    });
  }
}
