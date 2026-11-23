import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';

import { Roleservice } from '../../../services/roleservice';

@Component({
  selector: 'app-rupdatecomponent',
  imports: [
    ReactiveFormsModule,
    RouterLink,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
  ],
  templateUrl: './rupdatecomponent.html',
  styleUrl: './rupdatecomponent.css',
})
export class Rupdatecomponent {
  private readonly fb = inject(FormBuilder);
  private readonly rS = inject(Roleservice);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  readonly cargando = signal(true);
  readonly guardando = signal(false);
  readonly listo = signal(false);
  readonly mensaje = signal('');

  private idRole = 0;

  readonly form = this.fb.nonNullable.group({
    nameRole: [
      '',
      [
        Validators.required,
        Validators.maxLength(100),
        Validators.pattern(/\S/),
      ],
    ],
    descriptionRole: [
      '',
      [
        Validators.required,
        Validators.maxLength(150),
        Validators.pattern(/\S/),
      ],
    ],
    statusRole: ['Activo', Validators.required],
  });

  constructor() {
    this.route.paramMap
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((params) => {
        this.idRole = Number(params.get('id'));
        this.cargarRol();
      });
  }

  private cargarRol(): void {
    this.listo.set(false);
    this.mensaje.set('');

    if (!Number.isSafeInteger(this.idRole) || this.idRole <= 0) {
      this.cargando.set(false);
      this.mensaje.set('El ID del rol no es válido.');
      return;
    }

    this.cargando.set(true);
    const idSolicitado = this.idRole;

    this.rS.getRoleById(idSolicitado)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (role) => {
          if (idSolicitado !== this.idRole) return;

          this.form.reset({
            nameRole: role.nameRole,
            descriptionRole: role.descriptionRole,
            statusRole: role.statusRole,
          });

          this.cargando.set(false);
          this.listo.set(true);
        },
        error: (error) => {
          if (idSolicitado !== this.idRole) return;

          this.cargando.set(false);
          this.mostrarError(error.status);
        },
      });
  }

  guardar(): void {
    if (this.guardando() || !this.listo()) return;

    const value = this.form.getRawValue();

    this.form.patchValue({
      nameRole: value.nameRole.trim(),
      descriptionRole: value.descriptionRole.trim(),
    });

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.guardando.set(true);
    this.mensaje.set('');

    this.rS.updateRole({
      idRole: this.idRole,
      ...this.form.getRawValue(),
    })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.guardando.set(false);
          alert('Rol actualizado correctamente.');
          this.router.navigate(['/roles/listar']);
        },
        error: (error) => {
          this.guardando.set(false);
          this.mostrarError(error.status);
        },
      });
  }

  private mostrarError(status: number): void {
    switch (status) {
      case 400:
        this.mensaje.set('Revisa el nombre, descripción y estado.');
        break;
      case 401:
        this.mensaje.set('Debes iniciar sesión nuevamente.');
        break;
      case 403:
        this.mensaje.set('No tienes permiso para realizar esta operación.');
        break;
      case 404:
        this.mensaje.set('El rol ya no existe.');
        break;
      case 409:
        this.mensaje.set('Los cambios entran en conflicto con los datos existentes.');
        break;
      default:
        this.mensaje.set('No se pudo completar la operación. Intenta nuevamente.');
    }
  }
}