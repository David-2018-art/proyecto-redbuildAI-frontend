import {
  AfterViewInit,
  Component,
  DestroyRef,
  ElementRef,
  OnDestroy,
  ViewChild,
  computed,
  inject,
  signal,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import * as L from 'leaflet';

import { LocationService } from '../../../services/locationservice';
import { Authservice } from '../../../services/authservice';
import { LocationDTO } from '../../../models/locationDTO';

@Component({
  selector: 'app-llistcomponent',
  imports: [RouterLink, MatButtonModule],
  templateUrl: './llistcomponent.html',
  styleUrl: './llistcomponent.css',
})
export class Llistcomponent implements AfterViewInit, OnDestroy {
  @ViewChild('mapa')
  private mapaElemento!: ElementRef<HTMLDivElement>;

  private readonly service = inject(LocationService);
  private readonly auth = inject(Authservice);
  private readonly destroyRef = inject(DestroyRef);

  private mapa?: L.Map;
  private puntos = L.featureGroup();
  private observador?: ResizeObserver;

  readonly cargando = signal(false);
  readonly eliminando = signal(false);
  readonly mensaje = signal('');
  readonly cantidad = signal(0);
  readonly omitidas = signal(0);
  readonly seleccionada = signal<LocationDTO | null>(null);

  readonly esAdmin = computed(
    () => this.auth.session()?.role === 'Administrador',
  );

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

    this.cargar();
  }

  cargar(): void {
    if (this.cargando() || this.eliminando()) return;

    this.cargando.set(true);
    this.mensaje.set('');

    this.service.getLocation()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (ubicaciones) => {
          this.puntos.clearLayers();
          this.seleccionada.set(null);

          const validas = ubicaciones.filter(
            (ubicacion) => this.coordenadasValidas(ubicacion),
          );

          this.cantidad.set(validas.length);
          this.omitidas.set(ubicaciones.length - validas.length);

          validas.forEach((ubicacion) => {
            this.agregarPunto(ubicacion);
          });

          this.cargando.set(false);
          this.verTodas();
        },
        error: (error) => {
          this.cargando.set(false);
          this.mensaje.set(
            error.status === 401
              ? 'Inicia sesión para consultar las ubicaciones.'
              : 'No se pudieron actualizar las ubicaciones. Intenta nuevamente.',
          );
        },
      });
  }

  private coordenadasValidas(ubicacion: LocationDTO): boolean {
    return (
      ubicacion.latitude != null &&
      ubicacion.longitude != null &&
      Number.isFinite(ubicacion.latitude) &&
      Number.isFinite(ubicacion.longitude) &&
      Math.abs(ubicacion.latitude) <= 90 &&
      Math.abs(ubicacion.longitude) <= 180
    );
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
          border:3px solid #ffffff;
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

    marcador.on('click', () => {
      this.seleccionada.set(ubicacion);
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

    const filas: Array<[string, string]> = [
      ['Departamento', ubicacion.department],
      ['Provincia', ubicacion.province],
      ['Distrito', ubicacion.district],
      ['ID', String(ubicacion.idLocation)],
    ];

    filas.forEach(([etiqueta, valor]) => {
      const fila = document.createElement('div');
      const nombre = document.createElement('b');

      nombre.textContent = `${etiqueta}: `;
      fila.appendChild(nombre);
      fila.appendChild(document.createTextNode(valor || 'Sin información'));
      tarjeta.appendChild(fila);
    });

    return tarjeta;
  }

  verTodas(): void {
    if (!this.mapa || !this.puntos.getLayers().length) return;

    this.mapa.invalidateSize();
    this.mapa.fitBounds(this.puntos.getBounds(), {
      padding: [45, 45],
      maxZoom: 15,
    });
  }

  eliminarSeleccionada(): void {
    const ubicacion = this.seleccionada();

    if (
      !ubicacion ||
      !this.esAdmin() ||
      this.eliminando() ||
      this.cargando()
    ) {
      return;
    }

    if (!confirm(`¿Eliminar la ubicación "${ubicacion.referenceAddress}"?`)) {
      return;
    }

    this.eliminando.set(true);
    this.mensaje.set('');

    this.service.deleteLocation(ubicacion.idLocation)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.eliminando.set(false);
          this.cargar();
        },
        error: (error) => {
          this.eliminando.set(false);
          this.mensaje.set(
            error.status === 409
              ? 'No puedes eliminar una ubicación con publicaciones asociadas.'
              : error.status === 403
                ? 'No tienes permiso para eliminar esta ubicación.'
                : error.status === 401
                  ? 'Inicia sesión nuevamente.'
                  : 'No se pudo eliminar la ubicación.',
          );
        },
      });
  }

  ngOnDestroy(): void {
    this.observador?.disconnect();
    this.mapa?.remove();
    this.mapa = undefined;
  }
}