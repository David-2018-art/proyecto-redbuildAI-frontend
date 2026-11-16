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
  department: string = '';
  ubicaciones: LocationDTO[] = [];
  mensajeDepartamento: string = '';

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

  buscarPorDepartamento(): void {
    this.ubicaciones = [];
    this.mensajeDepartamento = '';

    const departamento = this.department.trim();

    if (!departamento) {
      this.mensajeDepartamento = 'Ingrese un departamento válido';
      return;
    }

    if (!/^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ ]+$/.test(departamento)) {
      this.mensajeDepartamento = 'El departamento solo debe contener letras y espacios';
      return;
    }

    this.lS.getLocationsByDepartment(departamento).subscribe({
      next: (data: LocationDTO[]) => {
        this.ubicaciones = data;

        if (data.length > 0) {
          this.mensajeDepartamento = 'Ubicaciones encontradas correctamente';
        } else {
          this.mensajeDepartamento = 'No se encontraron ubicaciones en ese departamento';
        }
      },
      error: (error) => {
        console.error('Error al buscar por departamento:', error);
        this.mensajeDepartamento = 'No se pudieron consultar las ubicaciones';
      },
    });
  }
}
