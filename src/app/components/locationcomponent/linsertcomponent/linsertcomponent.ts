import { Component } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { LocationService } from '../../../services/locationservice';
import { LocationDTO } from '../../../models/locationDTO';

@Component({
  imports: [ReactiveFormsModule, MatInputModule, MatButtonModule],
  selector: 'app-linsertcomponent',
  styleUrl: './linsertcomponent.css',
  templateUrl: './linsertcomponent.html',
})
export class Linsertcomponent {
  mensaje: string = '';

  formLocation: any;

  constructor(
    private fb: FormBuilder,
    private lS: LocationService,
  ) {
    this.formLocation = this.fb.group({
      department: [
        '',
        [
          Validators.required,
          Validators.pattern(/^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ ]+$/),
          Validators.pattern(/.*\S.*/),
        ],
      ],
      province: [
        '',
        [
          Validators.required,
          Validators.pattern(/^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ ]+$/),
          Validators.pattern(/.*\S.*/),
        ],
      ],
      district: [
        '',
        [
          Validators.required,
          Validators.pattern(/^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ ]+$/),
          Validators.pattern(/.*\S.*/),
        ],
      ],
      referenceAddress: ['', Validators.required],
      latitude: [null, [Validators.required, Validators.min(-90), Validators.max(90)]],
      longitude: [null, [Validators.required, Validators.min(-180), Validators.max(180)]],
    });
  }

  registrar(): void {
    if (this.formLocation.invalid) {
      if (
        ['department', 'province', 'district'].some((campo) =>
          this.formLocation.get(campo)?.hasError('pattern'),
        )
      ) {
        this.mensaje = 'Departamento, provincia y distrito solo deben contener letras y espacios';
      } else if (
        this.formLocation.get('latitude')?.hasError('min') ||
        this.formLocation.get('latitude')?.hasError('max')
      ) {
        this.mensaje = 'La latitud debe estar entre -90 y 90';
      } else if (
        this.formLocation.get('longitude')?.hasError('min') ||
        this.formLocation.get('longitude')?.hasError('max')
      ) {
        this.mensaje = 'La longitud debe estar entre -180 y 180';
      } else {
        this.mensaje = 'Complete los campos obligatorios';
      }
      return;
    }

    const location: LocationDTO = {
      idLocation: 0,
      ...this.formLocation.value,
    };

    this.lS.insertLocation(location).subscribe({
      next: () => {
        this.mensaje = 'Ubicación registrada correctamente';
        this.formLocation.reset();
      },
      error: (error) => {
        console.error('Error al registrar la ubicación:', error);
        this.mensaje = 'Error al registrar la ubicación';
      },
    });
  }
}
