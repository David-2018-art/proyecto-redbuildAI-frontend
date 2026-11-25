import { Component, inject, signal } from '@angular/core';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';

import { Router, RouterLink } from '@angular/router';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';

import { Userservice } from '../../services/userservice';
import { UserRegister } from '../../models/user-register.model';

@Component({
  selector: 'app-registrocomponent',
  imports: [
    ReactiveFormsModule,
    RouterLink,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
  ],
  templateUrl: './registrocomponent.html',
  styleUrl: './registrocomponent.css',
})
export class Registrocomponent {

  private readonly fb = inject(FormBuilder);
  private readonly uS = inject(Userservice);
  private readonly router = inject(Router);

  readonly tipoCuenta = signal<'Cliente' | 'Empresa'>('Cliente');

  readonly guardando = signal(false);
  readonly mensaje = signal('');
  readonly registroExitoso = signal(false);

  readonly mostrarPassword = signal(false);

  form = this.fb.nonNullable.group({

    nameUser: [
      '',
      [Validators.required, Validators.maxLength(80)]
    ],

    lastNameUser: [
      '',
      Validators.maxLength(80)
    ],

    emailUser: [
      '',
      [
        Validators.required,
        Validators.email,
        Validators.maxLength(254)
      ]
    ],

    phoneUser: [
      '',
      Validators.maxLength(20)
    ],

    companyNameUser: [
      '',
      Validators.maxLength(100)
    ],

    passwordUser: [
      '',
      [
        Validators.required,
        Validators.minLength(6),
        Validators.maxLength(72)
      ]
    ],

    confirmarPassword: [
      '',
      Validators.required
    ],

  });

  seleccionarTipo(tipo: 'Cliente' | 'Empresa'): void {

    if (this.guardando()) return;

    this.tipoCuenta.set(tipo);
    this.mensaje.set('');

    const empresa = this.form.controls.companyNameUser;

    if (tipo === 'Empresa') {

      empresa.setValidators([
        Validators.required,
        Validators.maxLength(100)
      ]);

    } else {

      empresa.setValidators([
        Validators.maxLength(100)
      ]);

      empresa.setValue('');

    }

    empresa.updateValueAndValidity();

  }

  registrar(): void {

    if (this.guardando() || this.registroExitoso()) return;

    this.mensaje.set('');

    if (this.form.invalid) {

      this.form.markAllAsTouched();

      this.mensaje.set(
        'Completa correctamente los campos obligatorios.'
      );

      return;

    }

    const valores = this.form.getRawValue();

    if (valores.passwordUser !== valores.confirmarPassword) {

      this.mensaje.set('Las contraseñas no coinciden.');

      return;

    }

    if (new TextEncoder().encode(valores.passwordUser).length > 72) {

      this.mensaje.set(
        'La contraseña excede el tamaño permitido.'
      );

      return;

    }

    if (!valores.nameUser.trim()) {

      this.mensaje.set('Ingresa un nombre válido.');

      return;

    }

    if (
      this.tipoCuenta() === 'Empresa' &&
      !valores.companyNameUser.trim()
    ) {

      this.mensaje.set('Ingresa el nombre de tu empresa.');

      return;

    }

    const user: UserRegister = {

      nameUser: valores.nameUser.trim(),
      lastNameUser: valores.lastNameUser.trim(),
      emailUser: valores.emailUser.trim(),
      passwordUser: valores.passwordUser,
      phoneUser: valores.phoneUser.trim(),

      companyNameUser:
        this.tipoCuenta() === 'Empresa'
          ? valores.companyNameUser.trim()
          : '',

      tipoCuenta: this.tipoCuenta(),

    };

    this.guardando.set(true);
    this.form.disable();

    this.uS.insertUser(user).subscribe({

      next: () => {

        this.guardando.set(false);

        this.form.reset();

        this.registroExitoso.set(true);

        this.mensaje.set('');

      },

      error: (error) => {

        this.guardando.set(false);
        this.form.enable();

        if (error.status === 400) {

          this.mensaje.set(
            'Revisa los datos ingresados e inténtalo nuevamente.'
          );

        } else if (error.status === 409) {

          this.mensaje.set(
            'Existe un conflicto con los datos ingresados. Verifica tu correo.'
          );

        } else if (error.status === 401 || error.status === 403) {

          this.mensaje.set(
            'El servidor no permitió realizar el registro.'
          );

        } else if (error.status === 0) {

          this.mensaje.set(
            'No se pudo conectar con el servidor.'
          );

        } else {

          this.mensaje.set(
            'No se pudo crear la cuenta. Inténtalo nuevamente.'
          );

        }

        console.error('Error de registro:', error.status);

      },

    });

  }

  irAlLogin(): void {

    this.router.navigate(['/login']);

  }

}