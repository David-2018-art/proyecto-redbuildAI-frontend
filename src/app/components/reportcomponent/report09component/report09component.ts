import {
  Component,
  computed,
  inject,
  OnInit,
  signal,
  DestroyRef,
} from '@angular/core';

import { BaseChartDirective } from 'ng2-charts';
import { ChartData, ChartOptions } from 'chart.js';
import { MatButtonModule } from '@angular/material/button';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import {
  PhotoCountByPublicationDTO,
} from '../../../models/reportes.model';

import {
  Reportservice,
  mensajeErrorReporte,
} from '../../../services/reportservice';

@Component({
  selector: 'app-report09component',
  imports: [BaseChartDirective, MatButtonModule],
  templateUrl: './report09component.html',
  styleUrl: '../report-card.css',
})
export class Report09component implements OnInit {

  private readonly service = inject(Reportservice);
  private readonly destroyRef = inject(DestroyRef);

  readonly cargando = signal(false);
  readonly mensaje = signal('');

  readonly lista = signal<PhotoCountByPublicationDTO[]>([]);

  readonly total = computed(() =>
    this.lista().reduce(
      (suma, item) => suma + item.quantityPhotos,
      0,
    ),
  );

  readonly totalPublicaciones = computed(() =>
    this.lista().length,
  );

  readonly publicacionesConFotos = computed(() =>
    this.lista().filter(
      (item) => item.quantityPhotos > 0,
    ).length,
  );

  readonly publicacionesSinFotos = computed(() =>
    this.lista().filter(
      (item) => item.quantityPhotos === 0,
    ).length,
  );

  readonly coberturaFotografica = computed(() => {

    if (this.totalPublicaciones() === 0) {
      return '0.0';
    }

    return (
      (this.publicacionesConFotos() /
        this.totalPublicaciones()) * 100
    ).toFixed(1);

  });

  readonly chartData = signal<ChartData<'bar'>>({
    labels: [],
    datasets: [],
  });

  readonly chartOptions: ChartOptions<'bar'> = {

    indexAxis: 'y',

    responsive: true,
    maintainAspectRatio: false,

    plugins: {
      legend: {
        display: false,
      },
    },

    scales: {

      x: {
        beginAtZero: true,

        ticks: {
          color: '#b8cad1',
          precision: 0,
        },

        grid: {
          color: 'rgba(135, 184, 201, 0.12)',
        },
      },

      y: {
        ticks: {
          color: '#b8cad1',
          autoSkip: false,
        },

        grid: {
          display: false,
        },
      },

    },

  };

  ngOnInit(): void {
    this.obtener();
  }

  obtener(): void {

    if (this.cargando()) return;

    this.cargando.set(true);
    this.mensaje.set('');

    this.service.fotografiasPorPublicacion()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({

        next: (data) => {

          const filas = data.map((item) => ({

            ...item,

            quantityPhotos: Number(item.quantityPhotos),

          }));

          this.lista.set(filas);

          const top10 = filas.slice(0, 10);

          this.chartData.set({

            labels: top10.map(
              (item) => item.titlePublication,
            ),

            datasets: [
              {
                label: 'Cantidad de fotografías',

                data: top10.map(
                  (item) => item.quantityPhotos,
                ),

                backgroundColor: '#64e6b1',

                hoverBackgroundColor: '#72d8ed',

                borderRadius: 6,

                maxBarThickness: 38,
              },
            ],

          });

          this.cargando.set(false);

        },

        error: (error) => {

          this.mensaje.set(mensajeErrorReporte(error));
          this.cargando.set(false);

        },

      });

  }

}