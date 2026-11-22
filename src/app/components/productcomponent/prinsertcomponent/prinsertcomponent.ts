import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
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
import { forkJoin, of } from 'rxjs';

import { Product } from '../../../models/product.model';
import { Category } from '../../../models/category.model';
import { User } from '../../../models/user.model';
import { Productservice } from '../../../services/productservice';
import { Categoryservice } from '../../../services/categoryservice';
import { Userservice } from '../../../services/userservice';
import { Authservice } from '../../../services/authservice';

@Component({
  selector: 'app-prinsertcomponent',
  imports: [
    ReactiveFormsModule,
    RouterLink,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
  ],
  templateUrl: './prinsertcomponent.html',
  styleUrl: './prinsertcomponent.css',
})
export class Prinsertcomponent implements OnInit {
  form;
  categorias: Category[] = [];
  usuarios: User[] = [];

  condiciones: Product['statusMaterial'][] = [
    'Nuevo',
    'Como nuevo',
    'Bueno',
    'Regular',
  ];

  esAdministrador = false;
  nombrePropietario = '';
  cargando = true;
  datosCargados = false;
  guardando = false;
  mensaje = '';

  constructor(
    private fb: FormBuilder,
    private pS: Productservice,
    private cS: Categoryservice,
    private uS: Userservice,
    private auth: Authservice,
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
      idUser: [0, [Validators.required, Validators.min(1)]],
    });
  }

  ngOnInit(): void {
    const session = this.auth.session();

    if (!session) {
      this.cargando = false;
      this.mensaje = 'Debes iniciar sesión para registrar productos.';
      return;
    }

    this.esAdministrador = session.role === 'Administrador';
    this.nombrePropietario = session.nameUser;
    this.form.controls.idUser.setValue(session.idUser);

    forkJoin({
      categorias: this.cS.getCategories(),
      usuarios: this.esAdministrador
        ? this.uS.getUsers()
        : of<User[]>([]),
    }).subscribe({
      next: ({ categorias, usuarios }) => {
        this.categorias = categorias;
        this.usuarios = usuarios;
        this.cargando = false;
        this.datosCargados = true;

        if (categorias.length === 0) {
          this.mensaje =
            'Primero debe existir una categoría para registrar productos.';
        }

        this.cdr.detectChanges();
      },
      error: (error) => {
        this.cargando = false;

        if (error.status === 401) {
          this.mensaje = 'Tu sesión no es válida. Inicia sesión nuevamente.';
        } else if (error.status === 403) {
          this.mensaje =
            'No tienes permisos para cargar los datos del formulario.';
        } else {
          this.mensaje =
            'No se pudieron cargar las categorías o los usuarios.';
        }

        console.error(error);
        this.cdr.detectChanges();
      },
    });
  }

  registrar(): void {
    if (this.guardando || !this.datosCargados) return;

    const session = this.auth.session();

    if (!session) {
      this.mensaje = 'Debes iniciar sesión.';
      return;
    }

    // Para usuarios y empresas, el propietario es la cuenta actual.
    if (session.role !== 'Administrador') {
      this.form.controls.idUser.setValue(session.idUser);
    }

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.getRawValue();

    const product: Product = {
      ...value,
      nameProduct: value.nameProduct.trim(),
      descriptionProduct: value.descriptionProduct.trim(),
      material: value.material.trim(),
      colour: value.colour.trim(),
      unidadMedidaProduct: value.unidadMedidaProduct.trim(),
    };

    this.guardando = true;
    this.mensaje = '';

    this.pS.insertProduct(product).subscribe({
      next: () => {
        this.guardando = false;
        alert('Producto registrado correctamente.');
        this.router.navigate(['/productos/listar']);
      },
      error: (error) => {
        this.guardando = false;

        if (error.status === 401) {
          this.mensaje = 'Debes iniciar sesión nuevamente.';
        } else if (error.status === 403) {
          this.mensaje =
            'No tienes permisos para registrar productos para ese usuario.';
        } else if (error.status === 404) {
          this.mensaje = 'La categoría o el propietario ya no existe.';
        } else if (error.status === 400) {
          this.mensaje =
            error.error?.message ?? 'Revisa los datos ingresados.';
        } else {
          this.mensaje = 'No se pudo registrar el producto.';
        }

        console.error(error);
        this.cdr.detectChanges();
      },
    });
  }
}