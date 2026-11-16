import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { LocationService } from '../../../services/locationservice';
import { LocationDTO } from '../../../models/locationDTO';

@Component({
  imports: [FormsModule, MatInputModule, MatButtonModule],
  selector: 'app-lbuscarcomponent',
  styleUrl: './lbuscarcomponent.css',
  templateUrl: './lbuscarcomponent.html',
})
export class Lbuscarcomponent {
  idLocation: number | null = null;
  mensaje: string = '';
  ubicacion: LocationDTO | null = null;

  constructor(private lS: LocationService) {}

  buscar(): void {
    this.ubicacion = null;
    this.mensaje = '';

    if (this.idLocation == null || !Number.isInteger(this.idLocation) || this.idLocation <= 0) {
      this.mensaje = 'Ingrese un ID válido';
      return;
    }

    this.lS.getLocationById(this.idLocation).subscribe({
      next: (data: LocationDTO) => {
        this.ubicacion = data;
        this.mensaje = 'Ubicación encontrada correctamente';
      },
      error: (error) => {
        console.error('Error al buscar la ubicación:', error);
        this.mensaje = 'No se pudo consultar la ubicación';
      },
    });
  }
}
