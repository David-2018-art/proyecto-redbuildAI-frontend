
import { Component } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { Publicationservice } from '../../../services/publicationservice';

@Component({
  selector: 'app-pinsertcomponent',
  imports: [
    ReactiveFormsModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule
  ],
  templateUrl: './pinsertcomponent.html',
  styleUrl: './pinsertcomponent.css'
})
export class Pinsertcomponent {

  mensaje: string = '';

  formPublication: any;

  tiposOperacion = [
    { value: 'VENTA', viewValue: 'Venta' },
    { value: 'INTERCAMBIO', viewValue: 'Intercambio' },
    { value: 'GRATIS', viewValue: 'Entrega gratuita' }
  ];

  constructor(
    private fb: FormBuilder,
    private pS: Publicationservice
  ) {
    this.formPublication = this.fb.group({
      title: ['', Validators.required],
      observations: [''],
      operationType: ['', Validators.required],
      status: ['ACTIVA', Validators.required],
      productId: [null, Validators.required],
      locationId: [null, Validators.required],
      publisherUserId: [null, Validators.required]
    });
  }

  registrar(): void {
    if (this.formPublication.invalid) {
      this.mensaje = 'Complete los campos obligatorios';
      return;
    }

    this.mensaje = 'Formulario validado correctamente';
  }
}
