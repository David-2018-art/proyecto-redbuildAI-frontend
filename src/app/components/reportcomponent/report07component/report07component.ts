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
  TransactionCountByStatusDTO,
} from '../../../models/reportes.model';

import {
  Reportservice,
  mensajeErrorReporte,
} from '../../../services/reportservice';

@Component({
  selector: 'app-report07component',
  imports: [BaseChartDirective, MatButtonModule],
  templateUrl: './report07component.html',
  styleUrl: '../report-card.css',
})
export class Report07component implements OnInit {

  private readonly service = inject(Reportservice);
  private readonly destroyRef = inject(DestroyRef);

  readonly cargando = signal(false);
  readonly mensaje = signal('');

  readonly lista = signal<TransactionCountByStatusDTO[]>([]);

  readonly total = computed(() =>
    this.lista().reduce(
      (suma, item) => suma + item.quantityTransactions,
      0,
    ),
  );

  readonly completadas = computed(() =>
    this.lista().find(
      (item) => item.status === 'Completada',
    )?.quantityTransactions ?? 0,
  );

  readonly pendientes = computed(() =>
    this.lista()
      .filter(
        (item) =>
          item.status === 'Solicitada' ||
          item.status === 'Reservada',
      )
      .reduce(
        (suma, item) => suma + item.quantityTransactions,
        0,
      ),
  );

  readonly tasaFinalizacion = computed(() =>
    this.porcentaje(this.completadas()),
  );

  readonly chartData = signal<ChartData<'doughnut'>>({
    labels: [],
    datasets: [],
  });

  readonly chartOptions: ChartOptions<'doughnut'> = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '65%',

    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: '#b8cad1',
          padding: 18,
          usePointStyle: true,
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

  obtener(): void {

    if (this.cargando()) return;

    this.cargando.set(true);
    this.mensaje.set('');

    this.service.transaccionesPorEstado()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({

        next: (data) => {

          const filas = data.map((item) => ({
            ...item,
            quantityTransactions:
              Number(item.quantityTransactions),
          }));

          this.lista.set(filas);

          this.chartData.set({

            labels: filas.map((item) => item.status),

            datasets: [
              {
                label: 'Transacciones',

                data: filas.map(
                  (item) => item.quantityTransactions,
                ),

                backgroundColor: [
                  '#eab54c',
                  '#72d8ed',
                  '#64e6b1',
                  '#ec7777',
                  '#8796ab',
                ],

                borderWidth: 0,
                hoverOffset: 8,
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