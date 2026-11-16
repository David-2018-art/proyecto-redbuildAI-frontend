import { Component } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { LocationService } from "../../../services/locationservice";
import { LocationDTO } from "../../../models/locationDTO";

@Component({
  imports: [
    ReactiveFormsModule,
    MatInputModule,
    MatButtonModule
  ],
  selector: 'app-linsertcomponent',
  styleUrl: './linsertcomponent.css',
  templateUrl: './linsertcomponent.html',
})
export class Linsertcomponent {

  mensaje: string = '';

  formLocation: any;

  constructor(
    private fb: FormBuilder,
    private lS: LocationService
  ) {
    this.formLocation = this.fb.group({
      department: ['', Validators.required],
      province: ['', Validators.required],
      district: ['', Validators.required],
      referenceAddress: ['', Validators.required],
      latitude: [null, Validators.required],
      longitude: [null, Validators.required]
    });
  }

  registrar(): void {
    if (this.formLocation.invalid) {
      this.mensaje = 'Complete los campos obligatorios';
      return;
    }

    const location: LocationDTO = {
      idLocation: 0,
      ...this.formLocation.value
    };

    this.lS.insertLocation(location).subscribe({
      next: () => {
        this.mensaje = 'Ubicación registrada correctamente';
        this.formLocation.reset();
    },
    error: (error) => {
      console.error('Error al registrar la ubicación:', error);
      this.mensaje = 'Error al registrar la ubicación';
    }
  });
  }
}
