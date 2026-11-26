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
  CompletedTransactionSummaryDTO,
} from '../../../models/reportes.model';

import {
  Reportservice,
  mensajeErrorReporte,
} from '../../../services/reportservice';

@Component({
  selector: 'app-report10component',
  imports: [BaseChartDirective, MatButtonModule],
  templateUrl: './report10component.html',
  styleUrl: '../report-card.css',
})
export class Report10component implements OnInit {

  private readonly service = inject(Reportservice);
  private readonly destroyRef = inject(DestroyRef);

  readonly cargando = signal(false);
  readonly mensaje = signal('');

  readonly lista = signal<CompletedTransactionSummaryDTO[]>([]);

  readonly total = computed(() =>
    this.lista().reduce(
      (suma, item) => suma + item.quantityTransactions,
      0,
    ),
  );

  readonly totalVentas = computed(() =>
    this.lista().find(
      (item) => item.typeTransaction === 'Venta',
    )?.quantityTransactions ?? 0,
  );

  readonly totalDonaciones = computed(() =>
    this.lista().find(
      (item) => item.typeTransaction === 'Donacion',
    )?.quantityTransactions ?? 0,
  );

  readonly montoTotalVentas = computed(() =>
    this.lista().find(
      (item) => item.typeTransaction === 'Venta',
    )?.totalAmount ?? 0,
  );

  readonly montoTotal = computed(() =>
    this.lista().reduce(
      (suma, item) => suma + item.totalAmount,
      0,
    ),
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

  formatoMoneda(monto: number): string {

    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN',
      minimumFractionDigits: 2,
    }).format(monto);

  }

  nombreOperacion(tipo: string): string {

    return tipo === 'Venta' ? 'Ventas' : 'Donaciones';

  }

  obtener(): void {

    if (this.cargando()) return;

    this.cargando.set(true);
    this.mensaje.set('');

    this.service.ventasYDonacionesCompletadas()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({

        next: (data) => {

          const filas = data.map((item) => ({

            ...item,

            quantityTransactions:
              Number(item.quantityTransactions),

            totalAmount:
              Number(item.totalAmount),

          }));

          this.lista.set(filas);

          this.chartData.set({

            labels: filas.map(
              (item) => this.nombreOperacion(
                item.typeTransaction,
              ),
            ),

            datasets: [
              {
                label: 'Operaciones completadas',

                data: filas.map(
                  (item) => item.quantityTransactions,
                ),

                backgroundColor: [
                  '#64e6b1',
                  '#72d8ed',
                ],

                borderRadius: 6,
                maxBarThickness: 100,
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