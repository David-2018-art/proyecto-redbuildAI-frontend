import { ChangeDetectorRef, Component } from '@angular/core';
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

import { Category } from '../../../models/category.model';
import { Categoryservice } from '../../../services/categoryservice';

@Component({
  selector: 'app-cinsertcomponent',
  imports: [
    ReactiveFormsModule,
    RouterLink,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
  ],
  templateUrl: './cinsertcomponent.html',
  styleUrl: './cinsertcomponent.css',
})
export class Cinsertcomponent {
  form;
  guardando = false;
  mensaje = '';

  constructor(
    private fb: FormBuilder,
    private cS: Categoryservice,
    private router: Router,
    private cdr: ChangeDetectorRef,
  ) {
    this.form = this.fb.nonNullable.group({
      nameCategory: [
        '',
        [
          Validators.required,
          Validators.maxLength(60),
          Validators.pattern(/\S/),
        ],
      ],
      descriptionCategory: [
        '',
        [
          Validators.required,
          Validators.maxLength(150),
          Validators.pattern(/\S/),
        ],
      ],
      statusCategory: [
        'Activo' as Category['statusCategory'],
        Validators.required,
      ],
    });
  }

  registrar(): void {
    if (this.guardando) return;

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.getRawValue();

    const category: Category = {
      ...value,
      nameCategory: value.nameCategory.trim(),
      descriptionCategory: value.descriptionCategory.trim(),
    };

    this.guardando = true;
    this.mensaje = '';

    this.cS.insertCategory(category).subscribe({
      next: () => {
        this.guardando = false;
        alert('Categoría registrada correctamente.');
        this.router.navigate(['/categorias/listar']);
      },
      error: (error) => {
        this.guardando = false;

        if (error.status === 401) {
          this.mensaje = 'Debes iniciar sesión.';
        } else if (error.status === 403) {
          this.mensaje = 'Solo un administrador puede registrar categorías.';
        } else if (error.status === 400) {
          this.mensaje = 'Revisa los datos ingresados.';
        } else {
          this.mensaje = 'No se pudo registrar la categoría.';
        }

        console.error(error);
        this.cdr.detectChanges();
      },
    });
  }
}