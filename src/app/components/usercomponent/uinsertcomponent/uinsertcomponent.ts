import { Component } from '@angular/core';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';

import { UserRegister } from '../../../models/user-register.model';
import { Userservice } from '../../../services/userservice';

@Component({
  selector: 'app-uinsertcomponent',
  imports: [
    ReactiveFormsModule,
    RouterLink,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
  ],
  templateUrl: './uinsertcomponent.html',
  styleUrl: './uinsertcomponent.css',
})
export class Uinsertcomponent {
  form;
  guardando = false;

  constructor(
    private fb: FormBuilder,
    private uS: Userservice,
    private router: Router,
  ) {
    this.form = this.fb.nonNullable.group({
      nameUser: ['', [Validators.required, Validators.maxLength(80)]],
      lastNameUser: ['', Validators.maxLength(80)],
      emailUser: [
        '',
        [
          Validators.required,
          Validators.email,
          Validators.maxLength(254),
        ],
      ],
      passwordUser: [
        '',
        [
          Validators.required,
          Validators.minLength(6),
          Validators.maxLength(100),
        ],
      ],
      phoneUser: ['', Validators.maxLength(20)],
      companyNameUser: ['', Validators.maxLength(100)],
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

    const user: UserRegister = this.form.getRawValue();

    this.guardando = true;

    this.uS.insertUser(user).subscribe({
      next: () => {
        this.guardando = false;
        alert('Usuario registrado correctamente.');
        this.router.navigate(['/usuarios/listar']);
      },
      error: (error) => {
        this.guardando = false;

        if (error.status === 400) {
          alert('Revisa los datos ingresados.');
        } else if (error.status === 409) {
          alert('El registro presenta un conflicto. Revisa los datos.');
        } else if (error.status === 401 || error.status === 403) {
          alert('El backend no permitió registrar al usuario.');
        } else {
          alert('No se pudo registrar el usuario.');
        }

        console.error(error);
      },
    });
  }
}