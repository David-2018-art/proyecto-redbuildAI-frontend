import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  OnDestroy,
  ViewChild,
} from '@angular/core';

import * as L from 'leaflet';
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
export class Linsertcomponent implements AfterViewInit, OnDestroy{
  
  @ViewChild('mapa')
private mapaElemento!: ElementRef<HTMLDivElement>;

private mapa?: L.Map;
private marcador?: L.CircleMarker;
  
  mensaje: string = '';

  formLocation: any;

  constructor(
    private fb: FormBuilder,
    private lS: LocationService,
    private cdr: ChangeDetectorRef,
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

  ngAfterViewInit(): void {
  this.mapa = L.map(this.mapaElemento.nativeElement, {
    scrollWheelZoom: false,
  }).setView([-12.0464, -77.0428], 12);

  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">' +
      'OpenStreetMap</a> contributors',
  }).addTo(this.mapa);

  this.mapa.on('click', (evento: L.LeafletMouseEvent) => {
    const punto = evento.latlng.wrap();
    const latitud = Number(punto.lat.toFixed(6));
    const longitud = Number(punto.lng.toFixed(6));

    this.formLocation.patchValue({
      latitude: latitud,
      longitude: longitud,
    });

    this.formLocation.get('latitude')?.markAsDirty();
    this.formLocation.get('longitude')?.markAsDirty();

    this.dibujarPunto(latitud, longitud);
    this.cdr.markForCheck();
  });
}

private dibujarPunto(latitud: number, longitud: number): void {
  if (!this.mapa) {
    return;
  }

  const punto: L.LatLngTuple = [latitud, longitud];

  if (this.marcador) {
    this.marcador.setLatLng(punto);
  } else {
    this.marcador = L.circleMarker(punto, {
      radius: 9,
      color: '#ffffff',
      weight: 3,
      fillColor: '#237a42',
      fillOpacity: 1,
    }).addTo(this.mapa);
  }
}

actualizarPuntoDesdeCampos(): void {
  const latitud = this.formLocation.get('latitude');
  const longitud = this.formLocation.get('longitude');

  if (
    !latitud ||
    !longitud ||
    latitud.invalid ||
    longitud.invalid
  ) {
    this.marcador?.remove();
    this.marcador = undefined;
    return;
  }

  const lat = Number(latitud.value);
  const lng = Number(longitud.value);

  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return;
  }

  this.dibujarPunto(lat, lng);
  this.mapa?.panTo([lat, lng]);
}

ngOnDestroy(): void {
  this.mapa?.remove();
  this.mapa = undefined;
}

  registrar(): void {
    if (this.formLocation.invalid) {
       this.formLocation.markAllAsTouched();
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

    this.marcador?.remove();
    this.marcador = undefined;

    this.cdr.markForCheck();
  },
  error: (error) => {
    console.error('Error al registrar la ubicación:', error);

    this.mensaje =
      error.status === 401
        ? 'Debes iniciar sesión para registrar una ubicación.'
        : error.status === 403
          ? 'Tu cuenta no tiene permiso para registrar ubicaciones.'
          : 'No se pudo registrar la ubicación. Revisa los datos e intenta nuevamente.';

    this.cdr.markForCheck();
  },
});
  }
}
