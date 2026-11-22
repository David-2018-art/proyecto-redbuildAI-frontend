import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
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

import { Category } from '../../../models/category.model';
import { Categoryservice } from '../../../services/categoryservice';

@Component({
  selector: 'app-cupdatecomponent',
  imports: [
    ReactiveFormsModule,
    RouterLink,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
  ],
  templateUrl: './cupdatecomponent.html',
  styleUrl: './cupdatecomponent.css',
})
export class Cupdatecomponent implements OnInit {
  form;
  idCategory = 0;
  cargando = true;
  categoriaCargada = false;
  guardando = false;
  mensaje = '';

  constructor(
    private fb: FormBuilder,
    private cS: Categoryservice,
    private route: ActivatedRoute,
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

  ngOnInit(): void {
    this.idCategory = Number(this.route.snapshot.paramMap.get('id'));

    if (!Number.isInteger(this.idCategory) || this.idCategory <= 0) {
      this.mensaje = 'El ID de la categoría no es válido.';
      this.cargando = false;
      return;
    }

    this.cS.getCategoryById(this.idCategory).subscribe({
      next: (category) => {
        this.form.patchValue({
          nameCategory: category.nameCategory,
          descriptionCategory: category.descriptionCategory,
          statusCategory: category.statusCategory,
        });

        this.categoriaCargada = true;
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        this.cargando = false;

        if (error.status === 404) {
          this.mensaje = 'La categoría no existe.';
        } else if (error.status === 401) {
          this.mensaje = 'Debes iniciar sesión.';
        } else if (error.status === 403) {
          this.mensaje = 'No tienes permisos para consultar esta categoría.';
        } else {
          this.mensaje = 'No se pudo cargar la categoría.';
        }

        console.error(error);
        this.cdr.detectChanges();
      },
    });
  }

  actualizar(): void {
    if (this.guardando || !this.categoriaCargada) return;

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.getRawValue();

    const category: Category = {
      idCategory: this.idCategory,
      ...value,
      nameCategory: value.nameCategory.trim(),
      descriptionCategory: value.descriptionCategory.trim(),
    };

    this.guardando = true;
    this.mensaje = '';

    this.cS.updateCategory(category).subscribe({
      next: () => {
        this.guardando = false;
        alert('Categoría actualizada correctamente.');
        this.router.navigate(['/categorias/listar']);
      },
      error: (error) => {
        this.guardando = false;

        if (error.status === 401) {
          this.mensaje = 'Debes iniciar sesión.';
        } else if (error.status === 403) {
          this.mensaje = 'Solo un administrador puede actualizar categorías.';
        } else if (error.status === 404) {
          this.mensaje = 'La categoría ya no existe.';
        } else if (error.status === 400) {
          this.mensaje = 'Revisa los datos ingresados.';
        } else {
          this.mensaje = 'No se pudo actualizar la categoría.';
        }

        console.error(error);
        this.cdr.detectChanges();
      },
    });
  }
}