import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { Resenaservice } from '../../../services/resenaservice';
import { Transaccionservice } from '../../../services/transaccionservice';
import { Authservice } from '../../../services/authservice';
import { Transaccion } from '../../../models/transaccion.model';

@Component({
  selector: 'app-reinsertcomponent',
  imports: [ReactiveFormsModule, RouterLink, MatFormFieldModule, MatInputModule, MatSelectModule, MatButtonModule],
  templateUrl: './reinsertcomponent.html',
})
export class Reinsertcomponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly service = inject(Resenaservice);
  private readonly transaccionService = inject(Transaccionservice);
  private readonly auth = inject(Authservice);
  private readonly router = inject(Router);
  transacciones: Transaccion[] = [];
  guardando = false;

  form = this.fb.nonNullable.group({
    idTransaccion: [0, [Validators.required, Validators.min(1)]],
    idRatedUser: [0, [Validators.required, Validators.min(1)]],
    titleResena: ['', [Validators.required, Validators.maxLength(100)]],
    descriptionResena: ['', Validators.maxLength(500)],
    scoreResena: [5, [Validators.required, Validators.min(1), Validators.max(5)]],
  });

  ngOnInit(): void {
    const session = this.auth.session();
    if (!session) return;
    const request = session.role === 'Administrador'
      ? this.transaccionService.getAll()
      : this.transaccionService.getByUser(session.idUser);
    request.subscribe({
      next: (data) => this.transacciones = data,
    });
  }

  registrar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const session = this.auth.session();
    if (!session) return;
    this.guardando = true;
    this.service.insert({
      ...this.form.getRawValue(),
      idUser: session.idUser,
      statusResena: true,
    }).subscribe({
      next: () => this.router.navigate(['/resenas/listar']),
      error: (error) => {
        this.guardando = false;
        alert(error.error?.message ?? 'No se pudo registrar la reseña.');
      },
    });
  }
}
