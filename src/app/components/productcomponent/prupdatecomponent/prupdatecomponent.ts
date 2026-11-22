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
import { forkJoin } from 'rxjs';

import { Product } from '../../../models/product.model';
import { Category } from '../../../models/category.model';
import { Productservice } from '../../../services/productservice';
import { Categoryservice } from '../../../services/categoryservice';
import { Authservice } from '../../../services/authservice';

@Component({
  selector: 'app-prupdatecomponent',
  imports: [
    ReactiveFormsModule,
    RouterLink,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
  ],
  templateUrl: './prupdatecomponent.html',
  styleUrl: './prupdatecomponent.css',
})
export class Prupdatecomponent implements OnInit {
  form;
  categorias: Category[] = [];

  condiciones: Product['statusMaterial'][] = [
    'Nuevo',
    'Como nuevo',
    'Bueno',
    'Regular',
  ];

  idProduct = 0;
  productoOriginal: Product | null = null;
  cargando = true;
  guardando = false;
  mensaje = '';

  constructor(
    private fb: FormBuilder,
    private pS: Productservice,
    private cS: Categoryservice,
    private auth: Authservice,
    private route: ActivatedRoute,
    private router: Router,
    private cdr: ChangeDetectorRef,
  ) {
    this.form = this.fb.nonNullable.group({
      nameProduct: [
        '',
        [
          Validators.required,
          Validators.maxLength(100),
          Validators.pattern(/\S/),
        ],
      ],
      descriptionProduct: [
        '',
        [
          Validators.required,
          Validators.maxLength(500),
          Validators.pattern(/\S/),
        ],
      ],
      material: [
        '',
        [
          Validators.required,
          Validators.maxLength(80),
          Validators.pattern(/\S/),
        ],
      ],
      colour: [
        '',
        [
          Validators.required,
          Validators.maxLength(40),
          Validators.pattern(/\S/),
        ],
      ],
      statusMaterial: [
        'Nuevo' as Product['statusMaterial'],
        Validators.required,
      ],
      quantityProduct: [
        0,
        [
          Validators.required,
          Validators.min(0),
          Validators.max(999999999.999),
          Validators.pattern(/^\d+(\.\d{1,3})?$/),
        ],
      ],
      unidadMedidaProduct: [
        '',
        [
          Validators.required,
          Validators.maxLength(30),
          Validators.pattern(/\S/),
        ],
      ],
      priceProduct: [
        0,
        [
          Validators.required,
          Validators.min(0),
          Validators.max(9999999999.99),
          Validators.pattern(/^\d+(\.\d{1,2})?$/),
        ],
      ],
      statusProduct: [
        'Activo' as Product['statusProduct'],
        Validators.required,
      ],
      idCategory: [0, [Validators.required, Validators.min(1)]],
    });
  }

  ngOnInit(): void {
    this.idProduct = Number(this.route.snapshot.paramMap.get('id'));

    if (!Number.isInteger(this.idProduct) || this.idProduct <= 0) {
      this.cargando = false;
      this.mensaje = 'El ID del producto no es válido.';
      return;
    }

    if (!this.auth.session()) {
      this.cargando = false;
      this.mensaje = 'Debes iniciar sesión para editar productos.';
      return;
    }

    forkJoin({
      producto: this.pS.getProductById(this.idProduct),
      categorias: this.cS.getCategories(),
    }).subscribe({
      next: ({ producto, categorias }) => {
        this.cargando = false;

        if (!this.puedeEditar(producto)) {
          this.mensaje =
            'Solo el propietario o administrador puede editar este producto.';
          this.cdr.detectChanges();
          return;
        }

        this.productoOriginal = producto;
        this.categorias = categorias;

        this.form.patchValue({
          nameProduct: producto.nameProduct,
          descriptionProduct: producto.descriptionProduct,
          material: producto.material,
          colour: producto.colour,
          statusMaterial: producto.statusMaterial,
          quantityProduct: producto.quantityProduct,
          unidadMedidaProduct: producto.unidadMedidaProduct,
          priceProduct: producto.priceProduct,
          statusProduct: producto.statusProduct,
          idCategory: producto.idCategory,
        });

        this.cdr.detectChanges();
      },
      error: (error) => {
        this.cargando = false;

        if (error.status === 401) {
          this.mensaje = 'Debes iniciar sesión nuevamente.';
        } else if (error.status === 403) {
          this.mensaje = 'No tienes permisos para consultar estos datos.';
        } else if (error.status === 404) {
          this.mensaje = 'No se encontró el recurso solicitado.';
        } else {
          this.mensaje = 'No se pudo cargar el producto o sus categorías.';
        }

        console.error(error);
        this.cdr.detectChanges();
      },
    });
  }

  puedeEditar(producto: Product): boolean {
    const session = this.auth.session();

    return session !== null && (
      session.role === 'Administrador' ||
      session.idUser === producto.idUser
    );
  }

  actualizar(): void {
    if (this.guardando || !this.productoOriginal) return;

    if (!this.puedeEditar(this.productoOriginal)) {
      this.mensaje = 'Tu sesión no permite actualizar este producto.';
      return;
    }

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.getRawValue();

    const product: Product = {
      ...value,
      idProduct: this.idProduct,
      idUser: this.productoOriginal.idUser,
      nameProduct: value.nameProduct.trim(),
      descriptionProduct: value.descriptionProduct.trim(),
      material: value.material.trim(),
      colour: value.colour.trim(),
      unidadMedidaProduct: value.unidadMedidaProduct.trim(),
    };

    this.guardando = true;
    this.mensaje = '';

    this.pS.updateProduct(product).subscribe({
      next: () => {
        this.guardando = false;
        alert('Producto actualizado correctamente.');
        this.router.navigate(['/productos/listar']);
      },
      error: (error) => {
        this.guardando = false;

        if (error.status === 401) {
          this.mensaje = 'Debes iniciar sesión nuevamente.';
        } else if (error.status === 403) {
          this.mensaje = 'No tienes permisos para actualizar este producto.';
        } else if (error.status === 404) {
          this.mensaje = 'El producto o la categoría ya no existe.';
        } else if (error.status === 409) {
          this.mensaje =
            'La actualización presenta un conflicto. No se permite cambiar el propietario.';
        } else if (error.status === 400) {
          this.mensaje =
            error.error?.message ?? 'Revisa los datos ingresados.';
        } else {
          this.mensaje = 'No se pudo actualizar el producto.';
        }

        console.error(error);
        this.cdr.detectChanges();
      },
    });
  }
}