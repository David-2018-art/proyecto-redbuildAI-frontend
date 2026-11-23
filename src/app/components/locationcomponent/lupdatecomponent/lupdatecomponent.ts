import { ChangeDetectorRef, Component, OnInit } from '@angular/core';import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { LocationService } from '../../../services/locationservice';
import { LocationDTO } from '../../../models/locationDTO';

@Component({
  imports: [ReactiveFormsModule, MatInputModule, MatButtonModule],
  selector: 'app-lupdatecomponent',
  styleUrl: './lupdatecomponent.css',
  templateUrl: './lupdatecomponent.html',
})
export class Lupdatecomponent implements OnInit {
  idLocation: number = 0;
  formLocation: any;
  mensaje: string = '';
  cargando: boolean = true;
  ubicacionCargada: boolean = false;
constructor(
  private fb: FormBuilder,
  private route: ActivatedRoute,
  private lS: LocationService,
  private cdr: ChangeDetectorRef,
) {}
  ngOnInit(): void {
    this.idLocation = Number(this.route.snapshot.paramMap.get('id'));

    this.formLocation = this.fb.group({
      idLocation: [this.idLocation],
      department: ['', Validators.required],
      province: ['', Validators.required],
      district: ['', Validators.required],
      referenceAddress: ['', Validators.required],
      latitude: [null, [Validators.required, Validators.min(-90), Validators.max(90)]],
      longitude: [null, [Validators.required, Validators.min(-180), Validators.max(180)]],
    });

    if (!Number.isInteger(this.idLocation) || this.idLocation <= 0) {
      this.mensaje = 'ID de ubicación inválido';
      this.cargando = false;
      return;
    }

    this.lS.getLocationById(this.idLocation).subscribe({
  next: (data: LocationDTO) => {
    this.formLocation.patchValue(data);
    this.ubicacionCargada = true;
    this.cargando = false;
    this.cdr.markForCheck();
  },
  error: (error) => {
    console.error('Error al cargar la ubicación:', error);
    this.mensaje = 'No se pudo cargar la ubicación';
    this.ubicacionCargada = false;
    this.cargando = false;
    this.cdr.markForCheck();
  },
});
  }

  actualizar(): void {
    if (this.formLocation.invalid) {
      this.mensaje = 'Complete los campos obligatorios';
      return;
    }

    if (!Number.isInteger(this.idLocation) || this.idLocation <= 0) {
      this.mensaje = 'ID de ubicación inválido';
      return;
    }

    const location: LocationDTO = {
      ...this.formLocation.value,
      idLocation: this.idLocation,
    };

    this.lS.updateLocation(location).subscribe({
  next: () => {
    this.mensaje = 'Ubicación actualizada correctamente';
    this.cdr.markForCheck();
  },
  error: (error) => {
    console.error('Error al actualizar la ubicación:', error);
    this.mensaje = 'No se pudo actualizar la ubicación';
    this.cdr.markForCheck();
  },
});
  }
}
