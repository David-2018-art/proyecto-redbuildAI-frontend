
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';

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

  idPublication: number | null = null;
  mensaje: string = '';

  buscar(): void {

    if (this.idPublication === null ||
        this.idPublication <= 0) {
      this.mensaje = 'Ingrese un ID válido';
      return;
    }

    this.mensaje =
      'Formulario de búsqueda validado. ID: ' +
      this.idPublication;
  }
}
