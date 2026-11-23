import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { forkJoin, of } from 'rxjs';

import { Userservice } from '../../../services/userservice';
import { Roleservice } from '../../../services/roleservice';
import { Authservice } from '../../../services/authservice';
import { Role } from '../../../models/role';

@Component({
  selector: 'app-uupdatecomponent',
  imports: [
    ReactiveFormsModule, RouterLink, MatFormFieldModule,
    MatInputModule, MatSelectModule, MatButtonModule,
  ],
  templateUrl: './uupdatecomponent.html',
  styleUrl: './uupdatecomponent.css',
})
export class Uupdatecomponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly service = inject(Userservice);
  private readonly rolesService = inject(Roleservice);
  private readonly auth = inject(Authservice);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  readonly id = Number(this.route.snapshot.paramMap.get('id'));
  readonly admin = this.auth.session()?.role === 'Administrador';

  readonly cargando = signal(true);
  readonly listo = signal(false);
  readonly guardando = signal(false);
  readonly mensaje = signal('');
  roles: Role[] = [];

  readonly form = this.fb.nonNullable.group({
    nameUser: ['', [
      Validators.required, Validators.pattern(/\S/),
      Validators.maxLength(80),
    ]],
    lastNameUser: ['', Validators.maxLength(80)],
    emailUser: ['', [
      Validators.required, Validators.email,
      Validators.maxLength(254),
    ]],
    phoneUser: ['', Validators.maxLength(20)],
    companyNameUser: ['', Validators.maxLength(100)],
    idRole: [0, [Validators.required, Validators.min(1)]],
    statusUser: ['Activo', Validators.required],
  });

  ngOnInit(): void {
    if (!Number.isSafeInteger(this.id) || this.id <= 0) {
      this.cargando.set(false);
      this.mensaje.set('ID de usuario inválido.');
      return;
    }

    forkJoin({
      user: this.service.getUserById(this.id),
      roles: this.admin ? this.rolesService.getRoles() : of<Role[]>([]),
    }).subscribe({
      next: ({ user, roles }) => {
        this.roles = roles;
        this.form.patchValue({
          ...user,
          lastNameUser: user.lastNameUser ?? '',
          phoneUser: user.phoneUser ?? '',
          companyNameUser: user.companyNameUser ?? '',
        });

        if (!this.admin) {
          this.form.controls.idRole.disable();
          this.form.controls.statusUser.disable();
        }

        this.cargando.set(false);
        this.listo.set(true);
      },
      error: (error) => this.error(error),
    });
  }

  guardar(): void {
    if (this.guardando() || !this.listo()) return;

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.getRawValue();
    this.guardando.set(true);
    this.mensaje.set('');

    this.service.updateUser({
      ...value,
      idUser: this.id,
      nameUser: value.nameUser.trim(),
      lastNameUser: value.lastNameUser.trim(),
      emailUser: value.emailUser.trim(),
      phoneUser: value.phoneUser.trim(),
      companyNameUser: value.companyNameUser.trim(),
    }).subscribe({
      next: () => {
        this.guardando.set(false);

        if (this.id === this.auth.session()?.idUser) {
          this.auth.logout();
          alert('Datos actualizados. Inicia sesión nuevamente.');
          this.router.navigate(['/login']);
        } else {
          this.router.navigate(['/usuarios/listar']);
        }
      },
      error: (error) => this.error(error),
    });
  }

  private error(error: any): void {
    this.cargando.set(false);
    this.guardando.set(false);

    this.mensaje.set(
      error.status === 401 ? 'Debes iniciar sesión nuevamente.'
      : error.status === 403 ? 'No tienes permiso para editar este usuario.'
      : error.status === 404 ? 'El usuario o el rol ya no existe.'
      : error.error?.message ?? 'No se pudieron guardar los datos.'
    );
  }
}