
import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';

import { Publicationservice } from '../../../services/publicationservice';
import { PublicationDTO } from '../../../models/publicationDTO';

@Component({
  selector: 'app-pbuscarcomponent',
  imports: [
    FormsModule,
    MatInputModule,
    MatButtonModule
  ],
  templateUrl: './pbuscarcomponent.html',
  styleUrl: './pbuscarcomponent.css'
})
export class Pbuscarcomponent {

  private readonly publicationService = inject(Publicationservice);
  private readonly cdr = inject(ChangeDetectorRef);

  idPublication: number | null = null;
  publicacion: PublicationDTO | null = null;
  mensaje = '';
  cargando = false;

  buscar(): void {
    const id = this.idPublication;

    this.publicacion = null;
    this.mensaje = '';

    if (id === null || !Number.isInteger(id) || id <= 0) {
      this.mensaje = 'Ingrese un ID válido.';
      return;
    }

    this.cargando = true;

    this.publicationService.getPublicationById(id).subscribe({
      next: (data) => {
        this.publicacion = data;
        this.cargando = false;
        this.cdr.markForCheck();
      },
      error: (error) => {
        this.cargando = false;

        if (error.status === 404) {
          this.mensaje = 'No existe una publicación con ese ID.';
        } else if (error.status === 401) {
          this.mensaje = 'Debes iniciar sesión.';
        } else if (error.status === 403) {
          this.mensaje = 'No tienes permiso para consultar publicaciones.';
        } else {
          this.mensaje = 'Error al consultar la publicación.';
        }

        this.cdr.markForCheck();
      }
    });
  }
}
