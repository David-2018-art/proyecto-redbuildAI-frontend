import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';

import { Resenaservice } from '../../../services/resenaservice';
import { Authservice } from '../../../services/authservice';
import { Resena } from '../../../models/resena.model';

@Component({
  selector: 'app-reupdatecomponent',
  imports: [
    ReactiveFormsModule, RouterLink, MatFormFieldModule,
    MatInputModule, MatSelectModule, MatButtonModule,
  ],
  templateUrl: './reupdatecomponent.html',
  styleUrl: './reupdatecomponent.css',
})
export class Reupdatecomponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly service = inject(Resenaservice);
  private readonly auth = inject(Authservice);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  private original?: Resena;
  readonly id = Number(this.route.snapshot.paramMap.get('id'));
  readonly cargando = signal(true);
  readonly listo = signal(false);
  readonly guardando = signal(false);
  readonly mensaje = signal('');

  readonly form = this.fb.nonNullable.group({
    titleResena: ['', [
      Validators.required, Validators.pattern(/\S/),
      Validators.maxLength(100),
    ]],
    descriptionResena: ['', Validators.maxLength(500)],
    scoreResena: [5, [
      Validators.required, Validators.min(1),
      Validators.max(5), Validators.pattern(/^[1-5]$/),
    ]],
    statusResena: [true, Validators.required],
  });

  ngOnInit(): void {
    if (!Number.isSafeInteger(this.id) || this.id <= 0) {
      this.cargando.set(false);
      this.mensaje.set('ID de reseña inválido.');
      return;
    }

    this.service.getById(this.id).subscribe({
      next: (resena) => {
        this.cargando.set(false);

        if (resena.idUser !== this.auth.session()?.idUser) {
          this.mensaje.set('Solo el autor puede editar esta reseña.');
          return;
        }

        this.original = resena;
        this.form.patchValue({
          ...resena,
          descriptionResena: resena.descriptionResena ?? '',
        });
        this.listo.set(true);
      },
      error: (error) => this.error(error),
    });
  }

  guardar(): void {
    if (this.guardando() || !this.original) return;

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.getRawValue();
    this.guardando.set(true);
    this.mensaje.set('');

    this.service.update({
      ...this.original,
      ...value,
      titleResena: value.titleResena.trim(),
      descriptionResena: value.descriptionResena.trim(),
    }).subscribe({
      next: () => this.router.navigate(['/resenas/listar']),
      error: (error) => this.error(error),
    });
  }

  private error(error: any): void {
    this.cargando.set(false);
    this.guardando.set(false);

    this.mensaje.set(
      error.status === 401 ? 'Inicia sesión nuevamente.'
      : error.status === 403 ? 'Solo el autor puede editar la reseña.'
      : error.status === 404 ? 'La reseña ya no existe.'
      : error.error?.message ?? 'No se pudo actualizar la reseña.'
    );
  }
}