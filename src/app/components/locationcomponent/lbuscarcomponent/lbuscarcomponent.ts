import {
  AfterViewInit,
  Component,
  DestroyRef,
  ElementRef,
  OnDestroy,
  ViewChild,
  inject,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { Observable, map } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import * as L from 'leaflet';

import { LocationService } from '../../../services/locationservice';
import { LocationDTO } from '../../../models/locationDTO';

@Component({
  selector: 'app-lbuscarcomponent',
  imports: [
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
  ],
  templateUrl: './lbuscarcomponent.html',
  styleUrl: './lbuscarcomponent.css',
})
export class Lbuscarcomponent implements AfterViewInit, OnDestroy {
  @ViewChild('mapa')
  private mapaElemento!: ElementRef<HTMLDivElement>;

  private readonly service = inject(LocationService);
  private readonly destroyRef = inject(DestroyRef);

  private mapa?: L.Map;
  private readonly puntos = L.featureGroup();
  private observador?: ResizeObserver;

  idLocation: number | null = null;
  department = '';

  readonly cargando = signal(false);
  readonly mensaje = signal('Busca una ubicación por ID o departamento.');
  readonly error = signal('');
  readonly cantidad = signal(0);

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

    this.puntos.addTo(this.mapa);

    this.observador = new ResizeObserver(() => {
      this.mapa?.invalidateSize();
    });

    this.observador.observe(this.mapaElemento.nativeElement);
  }

  buscar(): void {
    if (this.cargando()) return;

    const id = this.idLocation;

    if (id === null || !Number.isSafeInteger(id) || id <= 0) {
      this.error.set('Ingresa un ID entero mayor que cero.');
      return;
    }

    this.consultar(
      this.service.getLocationById(id).pipe(
        map((ubicacion) => [ubicacion]),
      ),
    );
  }

  buscarPorDepartamento(): void {
    if (this.cargando()) return;

    const departamento = this.department.trim();

    if (
      !departamento ||
      !/^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ ]+$/.test(departamento)
    ) {
      this.error.set('Ingresa un departamento usando letras y espacios.');
      return;
    }

    this.consultar(
      this.service.getLocationsByDepartment(departamento),
    );
  }

  private consultar(request: Observable<LocationDTO[]>): void {
    this.cargando.set(true);
    this.error.set('');
    this.mensaje.set('');
    this.cantidad.set(0);

    this.mapa?.closePopup();
    this.puntos.clearLayers();

    request
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (ubicaciones) => {
          const validas = ubicaciones.filter((ubicacion) =>
            ubicacion.latitude != null &&
            ubicacion.longitude != null &&
            Number.isFinite(ubicacion.latitude) &&
            Number.isFinite(ubicacion.longitude) &&
            Math.abs(ubicacion.latitude) <= 90 &&
            Math.abs(ubicacion.longitude) <= 180
          );

          validas.forEach((ubicacion) => {
            this.agregarPunto(ubicacion);
          });

          this.cantidad.set(validas.length);
          this.cargando.set(false);

          if (!ubicaciones.length) {
            this.mensaje.set('No se encontraron ubicaciones.');
            return;
          }

          if (!validas.length) {
            this.mensaje.set(
              'Los resultados no tienen coordenadas válidas para mostrarse.',
            );
            return;
          }

          const omitidas = ubicaciones.length - validas.length;

          this.mensaje.set(
            `${validas.length} ${
              validas.length === 1
                ? 'ubicación encontrada'
                : 'ubicaciones encontradas'
            }.` +
            (omitidas > 0
              ? ` ${omitidas} sin coordenadas válidas.`
              : ''),
          );

          this.verResultados();
        },
        error: (error) => {
          this.cargando.set(false);

          this.error.set(
            error.status === 404
              ? 'No existe una ubicación con ese ID.'
              : error.status === 401
                ? 'Inicia sesión para buscar ubicaciones.'
                : error.status === 403
                  ? 'No tienes permiso para consultar ubicaciones.'
                  : 'No se pudo realizar la búsqueda. Intenta nuevamente.',
          );
        },
      });
  }

  private agregarPunto(ubicacion: LocationDTO): void {
    const icono = L.divIcon({
      className: '',
      html: `
        <span style="
          display:block;
          width:22px;
          height:22px;
          box-sizing:border-box;
          border:3px solid white;
          border-radius:50%;
          background:#087f5b;
          box-shadow:0 0 0 6px rgba(8,127,91,.2);
        "></span>
      `,
      iconSize: [22, 22],
      iconAnchor: [11, 11],
      popupAnchor: [0, -14],
      tooltipAnchor: [0, -14],
    });

    const marcador = L.marker(
      [ubicacion.latitude, ubicacion.longitude],
      {
        icon: icono,
        keyboard: true,
        title: `Ubicación ${ubicacion.idLocation}: ${ubicacion.referenceAddress}`,
        alt: `Ubicación en ${ubicacion.district}`,
      },
    );

    marcador.bindTooltip(this.crearTarjeta(ubicacion), {
      direction: 'top',
      opacity: 1,
    });

    marcador.bindPopup(this.crearTarjeta(ubicacion), {
      maxWidth: 290,
    });

    this.puntos.addLayer(marcador);
  }

  private crearTarjeta(ubicacion: LocationDTO): HTMLElement {
    const tarjeta = document.createElement('div');

    tarjeta.style.cssText =
      'white-space:normal;min-width:170px;max-width:260px;' +
      'color:#152b36;font:14px/1.5 Arial,sans-serif;';

    const titulo = document.createElement('strong');

    titulo.textContent =
      ubicacion.referenceAddress || `Ubicación ${ubicacion.idLocation}`;

    titulo.style.cssText =
      'display:block;color:#087f5b;margin-bottom:7px;font-size:15px;';

    tarjeta.appendChild(titulo);

    const datos: Array<[string, string]> = [
      ['ID', String(ubicacion.idLocation)],
      ['Departamento', ubicacion.department],
      ['Provincia', ubicacion.province],
      ['Distrito', ubicacion.district],
    ];

    datos.forEach(([etiqueta, valor]) => {
      const fila = document.createElement('div');
      const nombre = document.createElement('b');

      nombre.textContent = `${etiqueta}: `;
      fila.appendChild(nombre);
      fila.appendChild(
        document.createTextNode(valor || 'Sin información'),
      );

      tarjeta.appendChild(fila);
    });

    return tarjeta;
  }

  verResultados(): void {
    if (!this.mapa || !this.puntos.getLayers().length) return;

    this.mapa.invalidateSize();

    this.mapa.fitBounds(this.puntos.getBounds(), {
      padding: [50, 50],
      maxZoom: 16,
    });
  }

  ngOnDestroy(): void {
    this.observador?.disconnect();
    this.mapa?.remove();
    this.mapa = undefined;
  }
}