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
  ReviewCountByScoreDTO,
} from '../../../models/reportes.model';

import {
  Reportservice,
  mensajeErrorReporte,
} from '../../../services/reportservice';

@Component({
  selector: 'app-report08component',
  imports: [BaseChartDirective, MatButtonModule],
  templateUrl: './report08component.html',
  styleUrl: '../report-card.css',
})
export class Report08component implements OnInit {

  private readonly service = inject(Reportservice);
  private readonly destroyRef = inject(DestroyRef);

  readonly cargando = signal(false);
  readonly mensaje = signal('');

  readonly lista = signal<ReviewCountByScoreDTO[]>([]);

  readonly total = computed(() =>
    this.lista().reduce(
      (suma, item) => suma + item.quantityReviews,
      0,
    ),
  );

  readonly promedio = computed(() => {

    if (this.total() === 0) {
      return '0.0';
    }

    const sumaCalificaciones = this.lista().reduce(
      (suma, item) =>
        suma + item.score * item.quantityReviews,
      0,
    );

    return (sumaCalificaciones / this.total()).toFixed(1);

  });

  readonly positivas = computed(() =>
    this.lista()
      .filter((item) => item.score >= 4)
      .reduce(
        (suma, item) => suma + item.quantityReviews,
        0,
      ),
  );

  readonly negativas = computed(() =>
    this.lista()
      .filter((item) => item.score <= 2)
      .reduce(
        (suma, item) => suma + item.quantityReviews,
        0,
      ),
  );

  readonly porcentajePositivas = computed(() =>
    this.porcentaje(this.positivas()),
  );

  readonly chartData = signal<ChartData<'bar'>>({
    labels: [],
    datasets: [],
  });

  readonly chartOptions: ChartOptions<'bar'> = {

    responsive: true,
    maintainAspectRatio: false,

    plugins: {
      legend: {
        display: false,
      },
    },

    scales: {

      x: {
        ticks: {
          color: '#b8cad1',
        },
        grid: {
          display: false,
        },
      },

      y: {
        beginAtZero: true,
        ticks: {
          color: '#b8cad1',
          precision: 0,
        },
        grid: {
          color: 'rgba(135, 184, 201, 0.12)',
        },
      },

    },

  };

  ngOnInit(): void {
    this.obtener();
  }

  porcentaje(cantidad: number): string {

    if (this.total() === 0) {
      return '0.0';
    }

    return ((cantidad / this.total()) * 100).toFixed(1);

  }

  estrellas(score: number): string {

    return '★'.repeat(score) + '☆'.repeat(5 - score);

  }

  obtener(): void {

    if (this.cargando()) return;

    this.cargando.set(true);
    this.mensaje.set('');

    this.service.resenasPorCalificacion()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({

        next: (data) => {

          const filas = data.map((item) => ({
            ...item,
            quantityReviews: Number(item.quantityReviews),
          }));

          this.lista.set(filas);

          this.chartData.set({

            labels: filas.map(
              (item) => `${item.score} ★`,
            ),

            datasets: [
              {
                label: 'Cantidad de reseñas',

                data: filas.map(
                  (item) => item.quantityReviews,
                ),

                backgroundColor: [
                  '#ec7777',
                  '#e99a62',
                  '#eab54c',
                  '#72d8ed',
                  '#64e6b1',
                ],

                borderRadius: 6,
                maxBarThickness: 65,
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