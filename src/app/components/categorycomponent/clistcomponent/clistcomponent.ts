
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';

import { Category } from '../../../models/category.model';
import { Categoryservice } from '../../../services/categoryservice';
import { PaginadorComponent } from '../../../shared/paginador.component';
import { Authservice } from '../../../services/authservice';

@Component({
  selector: 'app-clistcomponent',
  imports: [RouterLink, MatTableModule, MatButtonModule, PaginadorComponent],
  templateUrl: './clistcomponent.html',
  styleUrl: './clistcomponent.css',
})
export class Clistcomponent implements OnInit {

  get esAdministrador(): boolean {
    return this.auth.session()?.role === 'Administrador';
  }

  get displayedColumns(): string[] {
    return this.esAdministrador
      ? ['id', 'nombre', 'descripcion', 'estado', 'acciones']
      : ['id', 'nombre', 'descripcion', 'estado'];
  }

  dataSource: Category[] = [];
  cargando = true;
  mensaje = '';
  eliminandoId: number | null = null;

  constructor(
    private cS: Categoryservice,
    private cdr: ChangeDetectorRef,
    public auth: Authservice,
  ) {}

  ngOnInit(): void {
    this.obtenerCategorias();
  }

  obtenerCategorias(): void {
    this.cargando = true;
    this.mensaje = '';

    this.cS.getCategories().subscribe({
      next: (data) => {
        this.dataSource = data;
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        this.cargando = false;

        if (error.status === 401) {
          this.mensaje = 'Debes iniciar sesión para consultar categorías.';
        } else if (error.status === 403) {
          this.mensaje = 'No tienes permisos para consultar categorías.';
        } else {
          this.mensaje = 'No se pudieron cargar las categorías.';
        }

        console.error(error);
        this.cdr.detectChanges();
      },
    });
  }

  eliminar(category: Category): void {

    if (!this.esAdministrador) {
      alert('Solo un administrador puede eliminar categorías.');
      return;
    }

    const id = category.idCategory;

    if (id === undefined || id <= 0) {
      alert('La categoría no tiene un ID válido.');
      return;
    }

    if (this.eliminandoId !== null) {
      return;
    }

    const confirmar = confirm(
      `¿Deseas eliminar la categoría "${category.nameCategory}"?`
    );

    if (!confirmar) {
      return;
    }

    this.eliminandoId = id;

    this.cS.deleteCategory(id).subscribe({
      next: () => {
        this.eliminandoId = null;
        alert('Categoría eliminada correctamente.');
        this.obtenerCategorias();
      },
      error: (error) => {
        this.eliminandoId = null;

        if (error.status === 409) {
          alert(
            'No puedes eliminar esta categoría porque tiene productos asociados.'
          );
        } else if (error.status === 401) {
          alert('Debes iniciar sesión para eliminar categorías.');
        } else if (error.status === 403) {
          alert('Solo un administrador puede eliminar categorías.');
        } else if (error.status === 404) {
          alert('La categoría ya no existe.');
          this.obtenerCategorias();
        } else {
          alert('No se pudo eliminar la categoría.');
        }

        console.error(error);
        this.cdr.detectChanges();
      },
    });
  }
}
