import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DecimalPipe } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { catchError, forkJoin, of } from 'rxjs';

import { Product } from '../../../models/product.model';
import { Productservice } from '../../../services/productservice';
import { Categoryservice } from '../../../services/categoryservice';
import { Authservice } from '../../../services/authservice';

@Component({
  selector: 'app-prlistcomponent',
  imports: [
    RouterLink,
    DecimalPipe,
    MatTableModule,
    MatButtonModule,
  ],
  templateUrl: './prlistcomponent.html',
  styleUrl: './prlistcomponent.css',
})
export class Prlistcomponent implements OnInit {
  displayedColumns = [
    'id',
    'nombre',
    'categoria',
    'material',
    'condicion',
    'cantidad',
    'precio',
    'estado',
    'propietario',
    'acciones',
  ];

  dataSource: Product[] = [];
  categorias = new Map<number, string>();
  cargando = true;
  mensaje = '';
  aviso = '';
  eliminandoId: number | null = null;

  constructor(
    private pS: Productservice,
    private cS: Categoryservice,
    private auth: Authservice,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.obtenerProductos();
  }

  obtenerProductos(): void {
    this.cargando = true;
    this.mensaje = '';
    this.aviso = '';

    forkJoin({
      productos: this.pS.getProducts(),
      categorias: this.cS.getCategories().pipe(
        catchError(() => {
          this.aviso =
            'No se pudieron cargar los nombres de las categorías. Se mostrarán sus IDs.';
          return of([]);
        }),
      ),
    }).subscribe({
      next: ({ productos, categorias }) => {
        this.dataSource = productos;
        this.categorias.clear();

        for (const categoria of categorias) {
          if (categoria.idCategory !== undefined) {
            this.categorias.set(
              categoria.idCategory,
              categoria.nameCategory,
            );
          }
        }

        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        this.cargando = false;

        if (error.status === 401) {
          this.mensaje = 'Debes iniciar sesión para consultar productos.';
        } else if (error.status === 403) {
          this.mensaje = 'No tienes permisos para consultar productos.';
        } else {
          this.mensaje = 'No se pudieron cargar los productos.';
        }

        console.error(error);
        this.cdr.detectChanges();
      },
    });
  }

  nombreCategoria(id: number): string {
    return this.categorias.get(id) ?? `Categoría #${id}`;
  }

  puedeGestionar(product: Product): boolean {
    const session = this.auth.session();

    return session !== null && (
      session.role === 'Administrador' ||
      session.idUser === product.idUser
    );
  }

  eliminar(product: Product): void {
    const id = product.idProduct;

    if (id === undefined || id <= 0) {
      alert('El producto no tiene un ID válido.');
      return;
    }

    if (!this.puedeGestionar(product)) {
      alert('No tienes permisos para eliminar este producto.');
      return;
    }

    if (this.eliminandoId !== null) return;

    const confirmar = confirm(
      `¿Deseas eliminar el producto "${product.nameProduct}"?`
    );

    if (!confirmar) return;

    this.eliminandoId = id;

    this.pS.deleteProduct(id).subscribe({
      next: () => {
        this.eliminandoId = null;
        alert('Producto eliminado correctamente.');
        this.obtenerProductos();
      },
      error: (error) => {
        this.eliminandoId = null;

        if (error.status === 409) {
          alert(
            'No se puede eliminar el producto porque tiene publicaciones u otros registros asociados.'
          );
        } else if (error.status === 401) {
          alert('Debes iniciar sesión.');
        } else if (error.status === 403) {
          alert('Solo el propietario o administrador puede eliminarlo.');
        } else if (error.status === 404) {
          alert('El producto ya no existe.');
          this.obtenerProductos();
        } else {
          alert('No se pudo eliminar el producto.');
        }

        console.error(error);
        this.cdr.detectChanges();
      },
    });
  }
}