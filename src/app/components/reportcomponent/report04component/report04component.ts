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
  ProductPublicationCountDTO,
} from '../../../models/reportes.model';

import {
  Reportservice,
  mensajeErrorReporte,
} from '../../../services/reportservice';

@Component({
  selector: 'app-report04component',
  imports: [BaseChartDirective, MatButtonModule],
  templateUrl: './report04component.html',
  styleUrl: '../report-card.css',
})
export class Report04component implements OnInit {

  private readonly service = inject(Reportservice);
  private readonly destroyRef = inject(DestroyRef);

  readonly cargando = signal(false);
  readonly mensaje = signal('');

  readonly lista = signal<ProductPublicationCountDTO[]>([]);

  readonly total = computed(() =>
    this.lista().reduce(
      (suma, item) => suma + item.quantityPublications,
      0,
    ),
  );

  readonly totalProductos = computed(() =>
    this.lista().length,
  );

  readonly productosSinPublicaciones = computed(() =>
    this.lista().filter(
      (item) => item.quantityPublications === 0,
    ).length,
  );

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

    this.service.publicacionesPorProducto()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({

        next: (data) => {

          const filas = data.map((item) => ({
            ...item,
            quantityPublications: Number(
              item.quantityPublications,
            ),
          }));

          this.lista.set(filas);

          const principales = filas
            .filter((item) => item.quantityPublications > 0)
            .slice(0, 10);

          this.chartData.set({

            labels: principales.map(
              (item) => item.nameProduct,
            ),

            datasets: [
              {
                label: 'Publicaciones asociadas',

                data: principales.map(
                  (item) => item.quantityPublications,
                ),

                backgroundColor: '#64e6b1',
                hoverBackgroundColor: '#72d8ed',
                borderRadius: 6,
                maxBarThickness: 40,
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