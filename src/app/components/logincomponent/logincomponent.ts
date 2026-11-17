import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { Authservice } from '../../services/authservice';

@Component({
  selector: 'app-logincomponent',
  imports: [ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatButtonModule],
  templateUrl: './logincomponent.html',
})
export class Logincomponent {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(Authservice);
  private readonly router = inject(Router);
  guardando = false;
  error = '';

  form = this.fb.nonNullable.group({
    emailUser: ['', [Validators.required, Validators.email]],
    passwordUser: ['', Validators.required],
  });

  ingresar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.guardando = true;
    this.error = '';
    this.auth.login(this.form.getRawValue()).subscribe({
      next: () => {
        this.guardando = false;
        this.router.navigate(['/transacciones/listar']);
      },
      error: () => {
        this.guardando = false;
        this.error = 'Correo o contraseña incorrectos.';
      },
    });
  }
}
