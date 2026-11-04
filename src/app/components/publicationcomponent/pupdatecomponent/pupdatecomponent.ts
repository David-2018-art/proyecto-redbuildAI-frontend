
import { Component, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-pupdatecomponent',
  imports: [
    ReactiveFormsModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule
  ],
  templateUrl: './pupdatecomponent.html',
  styleUrl: './pupdatecomponent.css'
})
export class Pupdatecomponent implements OnInit {

  idPublication: number = 0;
  formPublication: any;
  mensaje: string = '';

  tiposOperacion = [
    { value: 'VENTA', viewValue: 'Venta' },
    { value: 'INTERCAMBIO', viewValue: 'Intercambio' },
    { value: 'GRATIS', viewValue: 'Entrega gratuita' }
  ];

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.idPublication = Number(
      this.route.snapshot.paramMap.get('id')
    );

    this.formPublication = this.fb.group({
      id: [this.idPublication],
      title: ['', Validators.required],
      observations: [''],
      operationType: ['', Validators.required],
      status: ['ACTIVA', Validators.required],
      productId: [null, Validators.required],
      locationId: [null, Validators.required],
      publisherUserId: [null, Validators.required]
    });

    if (!this.idPublication || this.idPublication <= 0) {
      this.mensaje = 'ID de publicación inválido';
    }
  }

  actualizar(): void {
    if (this.formPublication.invalid) {
      this.mensaje = 'Complete los campos obligatorios';
      return;
    }

    if (!this.idPublication || this.idPublication <= 0) {
      this.mensaje = 'ID de publicación inválido';
      return;
    }

    this.mensaje = 'Formulario de actualización validado. ID: '
      + this.idPublication;
  }
}
