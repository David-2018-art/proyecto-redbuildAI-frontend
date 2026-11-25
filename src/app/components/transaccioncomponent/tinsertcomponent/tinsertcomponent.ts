import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';

import { Publicationservice } from '../../../services/publicationservice';
import { Transaccionservice } from '../../../services/transaccionservice';
import { Authservice } from '../../../services/authservice';
import { PublicationDTO } from '../../../models/publicationDTO';

import { Productservice } from '../../../services/productservice';
import { Product } from '../../../models/product.model';
import { forkJoin } from 'rxjs';
import { DecimalPipe } from '@angular/common';

@Component({
  selector: 'app-tinsertcomponent',
  imports: [
    ReactiveFormsModule,
    RouterLink,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    DecimalPipe
  ],
  templateUrl: './tinsertcomponent.html',
  styleUrl: './tinsertcomponent.css',
})
export class Tinsertcomponent implements OnInit {

  private readonly fb = inject(FormBuilder);
  private readonly publicationService = inject(Publicationservice);
  private readonly transactionService = inject(Transaccionservice);
  private readonly auth = inject(Authservice);
  private readonly router = inject(Router);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly productService = inject(Productservice);

productos: Product[] = [];
productoSeleccionado: Product | undefined;
cargando = true;

  publications: PublicationDTO[] = [];
  guardando = false;

  form = this.fb.nonNullable.group({
    idPublication: [0, [Validators.required, Validators.min(1)]],

    typeTransaction: [
      { value: 'Venta' as 'Venta' | 'Donacion', disabled: true },
      Validators.required
    ],

    quantityTransaction: [
      1, [Validators.required, Validators.min(0.001)]
    ],

    agreedUnitPrice: [
      { value: 0, disabled: true },
      [Validators.required, Validators.min(0)]
    ],

    descriptionTransaction: ['', Validators.maxLength(500)],
  });

 ngOnInit(): void {

  const session = this.auth.session();

  if (!session) {
    this.router.navigate(['/login']);
    return;
  }

  forkJoin({
    publicaciones: this.publicationService.getPublications(),
    productos: this.productService.getProducts()
  }).subscribe({

    next: ({ publicaciones, productos }) => {

      this.productos = productos;

      this.publications = publicaciones.filter(p =>
        p.status === 'Disponible' &&
        p.publisherUserId !== session.idUser &&
        productos.some(producto =>
          producto.idProduct === p.productId &&
          producto.statusProduct === 'Activo' &&
          producto.quantityProduct > 0
        )
      ).sort((a, b) => (a.id ?? 0) - (b.id ?? 0));

      this.cargando = false;
      this.cdr.detectChanges();
    },

    error: () => {
      this.cargando = false;
      alert('No se pudieron cargar las publicaciones.');
      this.cdr.detectChanges();
    }
  });
}

  seleccionarPublicacion(id: number): void {

  const publicacion = this.publications.find(
    p => p.id === id
  );

  this.productoSeleccionado = this.productos.find(
    p => p.idProduct === publicacion?.productId
  );

  if (!publicacion || !this.productoSeleccionado) {
    this.form.controls.idPublication.setValue(0);
    this.form.controls.agreedUnitPrice.disable();
    return;
  }

  const producto = this.productoSeleccionado;

  this.form.controls.quantityTransaction.setValidators([
    Validators.required,
    Validators.min(0.001),
    Validators.max(producto.quantityProduct)
  ]);

  this.form.controls.quantityTransaction.setValue(
    Math.min(1, producto.quantityProduct)
  );

  this.form.controls.quantityTransaction.updateValueAndValidity();

  const operacion = publicacion.operationType
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase();

  if (operacion === 'donacion') {

    this.form.controls.typeTransaction.setValue('Donacion');

    this.form.controls.agreedUnitPrice.setValue(0);
    this.form.controls.agreedUnitPrice.disable();

  } else if (operacion === 'venta') {

    this.form.controls.typeTransaction.setValue('Venta');

    this.form.controls.agreedUnitPrice.setValidators([
      Validators.required,
      Validators.min(0.01)
    ]);

    this.form.controls.agreedUnitPrice.setValue(
      producto.priceProduct
    );

    this.form.controls.agreedUnitPrice.enable();
    this.form.controls.agreedUnitPrice.updateValueAndValidity();

  } else {

    this.form.controls.idPublication.setValue(0);
    this.productoSeleccionado = undefined;
    this.form.controls.agreedUnitPrice.disable();

    alert('El tipo de operación no es válido.');
  }

  this.cdr.detectChanges();
}

get totalEstimado(): number {

  const cantidad =
    this.form.controls.quantityTransaction.value || 0;

  const precio =
    this.form.controls.agreedUnitPrice.value || 0;

  return cantidad * precio;
}

  publicar(): void {

    if (this.guardando) return;

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const session = this.auth.session();

    if (!session) return;
    const publicacion = this.publications.find(
  p => p.id === this.form.controls.idPublication.value
);

if (!publicacion) {
  alert('Selecciona una publicación válida.');
  return;
}

if (publicacion.publisherUserId === session.idUser) {
  alert('No puedes adquirir tus propias publicaciones.');
  return;
}

    this.guardando = true;

    const value = this.form.getRawValue();

    this.transactionService.insert({
      ...value,
      idUser: session.idUser,
      statusTransaction: 'Solicitada',
    }).subscribe({

      next: () => {
        this.guardando = false;

        alert('Transacción registrada correctamente.');

        this.router.navigate(['/transacciones/listar']);
      },

      error: (error) => {
        this.guardando = false;

        alert(
          error.error?.message ??
          'No se pudo registrar la transacción.'
        );

        this.cdr.detectChanges();
      },

    });
  }
}