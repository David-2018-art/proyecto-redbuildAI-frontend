import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import { Role } from '../../../models/role';
import { Roleservice } from '../../../services/roleservice';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-rlistcomponent',
  imports: [MatTableModule, MatButtonModule],
  templateUrl: './rlistcomponent.html',
  styleUrl: './rlistcomponent.css',
})
export class Rlistcomponent implements OnInit {
  displayedColumns: string[] = ['C1', 'C2', 'C3', 'C4', 'C5'];
  dataSource: Role[] = [];
  cargando: boolean = true;
  mensaje: string = '';

  constructor(
    private rS: Roleservice,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.obtenerRoles();
  }

  obtenerRoles(): void {
    this.cargando = true;
    this.mensaje = '';

    this.rS.getRoles().subscribe({
      next: (data) => {
        this.dataSource = data;
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        this.cargando = false;

        if (error.status === 401) {
          this.mensaje = 'Necesitas autenticarte para consultar los roles.';
        } else if (error.status === 403) {
          this.mensaje = 'No tienes permisos para consultar los roles.';
        } else {
          this.mensaje = 'No se pudieron cargar los roles.';
        }

        console.error(error);
        this.cdr.detectChanges();
      },
    });
  }

  eliminar(role: Role): void {
  if (role.idRole === undefined) {
    alert('Este rol no tiene un ID válido.');
    return;
  }

  const confirmar = confirm(
    `¿Deseas eliminar el rol "${role.nameRole}"?`
  );

  // Aquí continúa el código que ya tienes.

  if (!confirmar) {
    return;
  }

  this.rS.deleteRole(role.idRole).subscribe({
    next: () => {
      alert('Rol eliminado correctamente.');
      this.obtenerRoles();
    },
    error: (error) => {
      if (error.status === 409) {
        alert(
          'No se puede eliminar este rol porque tiene usuarios asociados.'
        );
      } else if (error.status === 401) {
        alert('Debes iniciar sesión para eliminar roles.');
      } else if (error.status === 403) {
        alert('Necesitas permisos de administrador.');
      } else if (error.status === 404) {
        alert('El rol ya no existe.');
        this.obtenerRoles();
      } else {
        alert('No se pudo eliminar el rol.');
      }

      console.error(error);
    },
  });
}


}