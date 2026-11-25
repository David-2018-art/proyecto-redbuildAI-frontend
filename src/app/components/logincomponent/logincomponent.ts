import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { Authservice } from '../../services/authservice';

@Component({
  selector: 'app-logincomponent',
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    RouterLink
  ],
  templateUrl: './logincomponent.html',
  styleUrl: './logincomponent.css',
})
export class Logincomponent {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(Authservice);
  private readonly router = inject(Router);
  private readonly cdr = inject(ChangeDetectorRef);
  guardando = false;
  error = '';

  form = this.fb.nonNullable.group({
    emailUser: ['', [Validators.required, Validators.email]],
    passwordUser: ['', Validators.required],
  });

  ingresar(): void {
  if (this.guardando) {
    return;
  }

  if (this.form.invalid) {
    this.form.markAllAsTouched();
    return;
  }

  this.guardando = true;
  this.error = '';

  this.auth.login(this.form.getRawValue()).subscribe({
    next: () => {
      this.guardando = false;
      this.cdr.markForCheck();
      this.router.navigate(['/transacciones/listar']);
    },
    error: () => {
      this.guardando = false;
      this.error = 'No se pudo iniciar sesión. Verifica tus credenciales e inténtalo nuevamente.';
      this.cdr.markForCheck();
    },
  });
}
}
