import { Component } from '@angular/core';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';

import { Role } from '../../../models/role';
import { Roleservice } from '../../../services/roleservice';

@Component({
  selector: 'app-rinsertcomponent',
  imports: [
    ReactiveFormsModule,
    RouterLink,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
  ],
  templateUrl: './rinsertcomponent.html',
  styleUrl: './rinsertcomponent.css',
})
export class Rinsertcomponent {
  form;
  guardando = false;

  constructor(
    private fb: FormBuilder,
    private rS: Roleservice,
    private router: Router,
  ) {
    this.form = this.fb.nonNullable.group({
      nameRole: ['', [Validators.required, Validators.maxLength(100)]],
      descriptionRole: [
        '',
        [Validators.required, Validators.maxLength(150)],
      ],
      statusRole: ['Activo', Validators.required],
    });
  }

  registrar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    if (this.guardando) {
      return;
    }

    const role: Role = {
      idRole: 0,
      ...this.form.getRawValue(),
    };

    this.guardando = true;

    this.rS.insertRole(role).subscribe({
      next: () => {
        this.guardando = false;
        alert('Rol registrado correctamente.');
        this.router.navigate(['/roles/listar']);
      },
      error: (error) => {
        this.guardando = false;

        if (error.status === 401) {
          alert('Debes iniciar sesión para registrar roles.');
        } else if (error.status === 403) {
          alert('Necesitas permisos de administrador.');
        } else {
          alert('No se pudo registrar el rol.');
        }

        console.error(error);
      },
    });
  }
}