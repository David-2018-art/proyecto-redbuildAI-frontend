import {
  ChangeDetectorRef,
  Component,
  OnInit,
  AfterViewInit,
  OnDestroy,
  ElementRef,
  ViewChild
} from '@angular/core';

import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { Router } from '@angular/router';
import { LocationService } from '../../../services/locationservice';
import { LocationDTO } from '../../../models/locationDTO';

import * as L from 'leaflet';

@Component({
  imports: [MatTableModule, MatButtonModule],
  selector: 'app-llistcomponent',
  styleUrl: './llistcomponent.css',
  templateUrl: './llistcomponent.html',
})
export class Llistcomponent implements OnInit, AfterViewInit, OnDestroy {

  @ViewChild('mapa')
  mapaElemento!: ElementRef<HTMLDivElement>;

  private mapa?: L.Map;
  private marcador?: L.CircleMarker;

  ubicacionSeleccionada: LocationDTO | null = null;

  ubicaciones: LocationDTO[] = [];

  displayedColumns: string[] = [
    'idLocation',
    'department',
    'province',
    'district',
    'referenceAddress',
    'latitude',
    'longitude',
    'mapa',
    'acciones',
  ];

  constructor(
    private lS: LocationService,
    private router: Router,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.listar();
  }

  ngAfterViewInit(): void {

    this.mapa = L.map(this.mapaElemento.nativeElement, {
      scrollWheelZoom: false,
    }).setView([-12.0464, -77.0428], 12);

    L.tileLayer(
      'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
      {
        maxZoom: 19,
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }
    ).addTo(this.mapa);

  }

  verMapa(ubicacion: LocationDTO): void {

    if (
      !this.mapa ||
      ubicacion.latitude == null ||
      ubicacion.longitude == null ||
      !Number.isFinite(ubicacion.latitude) ||
      !Number.isFinite(ubicacion.longitude) ||
      Math.abs(ubicacion.latitude) > 90 ||
      Math.abs(ubicacion.longitude) > 180
    ) {
      return;
    }

    this.ubicacionSeleccionada = ubicacion;

    const punto: L.LatLngTuple = [
      ubicacion.latitude,
      ubicacion.longitude
    ];

    this.marcador?.remove();

    this.marcador = L.circleMarker(punto, {
      radius: 9,
      color: '#ffffff',
      weight: 3,
      fillColor: '#237a42',
      fillOpacity: 1,
    }).addTo(this.mapa);

    this.mapa.setView(punto, 16);

    this.mapaElemento.nativeElement.scrollIntoView({
      behavior: 'smooth',
      block: 'center'
    });
  }

  ngOnDestroy(): void {
    this.mapa?.remove();
  }

  listar(): void {
    this.lS.getLocation().subscribe({
      next: (data: LocationDTO[]) => {
        this.ubicaciones = data;
        this.cdr.markForCheck();
      },
      error: (error) => {
        console.error('Error al listar las ubicaciones:', error);
        alert('No se pudieron cargar las ubicaciones.');
        this.cdr.markForCheck();
      },
    });
  }

  editar(id: number | undefined): void {
    if (id == undefined) {
      return;
    }

    this.router.navigate(['/ubicaciones/editar', id]);
  }

  eliminar(id: number | undefined): void {
    if (id == undefined) {
      return;
    }

    const confirmar = confirm(
      '¿Está seguro de que desea eliminar esta ubicación? ' + id + '?'
    );

    if (confirmar) {
      this.lS.deleteLocation(id).subscribe({
        next: () => {

          if (this.ubicacionSeleccionada?.idLocation === id) {
            this.ubicacionSeleccionada = null;
            this.marcador?.remove();
          }

          alert('Ubicación eliminada correctamente');
          this.listar();
        },
        error: (error) => {
          console.error('Error al eliminar la ubicación:', error);
          alert('Error al eliminar la ubicación');
        },
      });
    }
  }
}


