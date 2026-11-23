import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';

import { Transaccionservice } from '../../../services/transaccionservice';
import { Publicationservice } from '../../../services/publicationservice';
import { Authservice } from '../../../services/authservice';
import { Transaccion } from '../../../models/transaccion.model';

@Component({
  selector: 'app-tupdatecomponent',
  imports: [
    ReactiveFormsModule, RouterLink, MatFormFieldModule,
    MatInputModule, MatButtonModule,
  ],
  templateUrl: './tupdatecomponent.html',
  styleUrl: './tupdatecomponent.css',
})
export class Tupdatecomponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly service = inject(Transaccionservice);
  private readonly publications = inject(Publicationservice);
  private readonly auth = inject(Authservice);
  private readonly route = inject(ActivatedRoute);

  readonly id = Number(this.route.snapshot.paramMap.get('id'));
  readonly cargando = signal(true);
  readonly listo = signal(false);
  readonly guardando = signal(false);
  readonly mensaje = signal('');

  original?: Transaccion;
  puedeEditarContenido = false;
  estados: Transaccion['statusTransaction'][] = [];

  readonly form = this.fb.nonNullable.group({
    quantityTransaction: [1, [
      Validators.required, Validators.min(0.001),
      Validators.max(999999999.999),
      Validators.pattern(/^\d+(\.\d{1,3})?$/),
    ]],
    agreedUnitPrice: [0, [
      Validators.required, Validators.min(0),
      Validators.max(9999999999.99),
      Validators.pattern(/^\d+(\.\d{1,2})?$/),
    ]],
    descriptionTransaction: ['', Validators.maxLength(500)],
  });

  ngOnInit(): void {
    if (!Number.isSafeInteger(this.id) || this.id <= 0) {
      this.cargando.set(false);
      this.mensaje.set('ID de transacción inválido.');
      return;
    }
    this.cargar();
  }

  cargar(): void {
    this.cargando.set(true);
    this.listo.set(false);

    this.service.getById(this.id).subscribe({
      next: transaction => {
        this.publications.getPublicationById(transaction.idPublication)
          .subscribe({
            next: publication => {
              const session = this.auth.session();
              const admin = session?.role === 'Administrador';
              const comprador = session?.idUser === transaction.idUser;
              const vendedor = session?.idUser === publication.publisherUserId;
              const gestor = admin || vendedor;

              this.original = transaction;

              this.form.reset({
                quantityTransaction: transaction.quantityTransaction,
                agreedUnitPrice: transaction.agreedUnitPrice,
                descriptionTransaction: transaction.descriptionTransaction ?? '',
              });

              this.puedeEditarContenido =
                transaction.statusTransaction === 'Solicitada' &&
                (comprador || admin);

              this.form.enable();

              if (!this.puedeEditarContenido) {
                this.form.disable();
              } else if (transaction.typeTransaction === 'Donacion') {
                this.form.controls.agreedUnitPrice.disable();
              }

              this.estados = [];

              if (transaction.statusTransaction === 'Solicitada') {
                if (gestor) this.estados.push('Reservada', 'Rechazada');
                if (comprador || gestor) this.estados.push('Cancelada');
              }

              if (transaction.statusTransaction === 'Reservada') {
                if (gestor) this.estados.push('Completada');
                if (comprador || gestor) this.estados.push('Cancelada');
              }

              this.cargando.set(false);
              this.listo.set(true);
            },
            error: error => this.error(error),
          });
      },
      error: error => this.error(error),
    });
  }

  guardar(): void {
    if (this.guardando() || !this.original || !this.puedeEditarContenido) return;

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.getRawValue();

    if (this.original.typeTransaction === 'Venta' && value.agreedUnitPrice <= 0) {
      this.mensaje.set('Una venta requiere un precio mayor que cero.');
      return;
    }

    this.enviar({
      ...this.original,
      ...value,
      agreedUnitPrice: this.original.typeTransaction === 'Donacion'
        ? 0 : value.agreedUnitPrice,
    });
  }

  cambiarEstado(estado: Transaccion['statusTransaction']): void {
    if (this.guardando() || !this.original || !this.estados.includes(estado)) return;

    if (this.form.dirty) {
      this.mensaje.set('Guarda primero los cambios del contenido.');
      return;
    }

    if (!confirm(`¿Cambiar el estado a ${estado}?`)) return;

    this.enviar({
      ...this.original,
      statusTransaction: estado,
    });
  }

  private enviar(transaction: Transaccion): void {
    this.guardando.set(true);
    this.mensaje.set('');

    this.service.update(transaction).subscribe({
      next: () => {
        this.guardando.set(false);
        this.mensaje.set('Transacción actualizada correctamente.');
        this.cargar();
      },
      error: error => this.error(error),
    });
  }

  private error(error: any): void {
    this.cargando.set(false);
    this.guardando.set(false);

    this.mensaje.set(
      error.status === 401 ? 'Inicia sesión nuevamente.'
      : error.status === 403 ? 'No tienes permiso para esta operación.'
      : error.status === 409 ? 'El estado cambió o la operación no está permitida. Recarga la pantalla.'
      : error.error?.message ?? 'No se pudo actualizar la transacción.'
    );
  }
}