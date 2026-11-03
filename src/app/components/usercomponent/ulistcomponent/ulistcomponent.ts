import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';

import { User } from '../../../models/user.model';
import { Userservice } from '../../../services/userservice';

@Component({
  selector: 'app-ulistcomponent',
  imports: [MatTableModule, MatButtonModule],
  templateUrl: './ulistcomponent.html',
  styleUrl: './ulistcomponent.css',
})
export class Ulistcomponent implements OnInit {
  displayedColumns: string[] = [
    'id',
    'nombre',
    'correo',
    'rol',
    'estado',
    'acciones',
  ];

  dataSource: User[] = [];
  cargando = true;
  mensaje = '';

  constructor(
    private uS: Userservice,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.obtenerUsuarios();
  }

  obtenerUsuarios(): void {
    this.cargando = true;
    this.mensaje = '';

    this.uS.getUsers().subscribe({
      next: (data) => {
        this.dataSource = data;
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        this.cargando = false;

        if (error.status === 401) {
          this.mensaje = 'Necesitas iniciar sesión para consultar usuarios.';
        } else if (error.status === 403) {
          this.mensaje = 'Necesitas permisos de administrador.';
        } else {
          this.mensaje = 'No se pudieron cargar los usuarios.';
        }

        console.error(error);
        this.cdr.detectChanges();
      },
    });
  }

  eliminar(user: User): void {
    if (user.idUser === undefined || user.idUser <= 0) {
      alert('Este usuario no tiene un ID válido.');
      return;
    }

    const confirmar = confirm(
      `¿Deseas eliminar al usuario "${user.nameUser}"?`
    );

    if (!confirmar) {
      return;
    }

    this.uS.deleteUser(user.idUser).subscribe({
      next: () => {
        alert('Usuario eliminado correctamente.');
        this.obtenerUsuarios();
      },
      error: (error) => {
        if (error.status === 409) {
          alert(
            'No se puede eliminar este usuario porque tiene registros asociados.'
          );
        } else if (error.status === 401) {
          alert('Debes iniciar sesión para eliminar usuarios.');
        } else if (error.status === 403) {
          alert('Necesitas permisos de administrador.');
        } else if (error.status === 404) {
          alert('El usuario ya no existe.');
          this.obtenerUsuarios();
        } else {
          alert('No se pudo eliminar el usuario.');
        }

        console.error(error);
      },
    });
  }
}