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
  RoleCountByStatusDTO,
} from '../../../models/reportes.model';

import {
  Reportservice,
  mensajeErrorReporte,
} from '../../../services/reportservice';

@Component({
  selector: 'app-report05component',
  imports: [BaseChartDirective, MatButtonModule],
  templateUrl: './report05component.html',
  styleUrl: '../report-card.css',
})
export class Report05component implements OnInit {

  private readonly service = inject(Reportservice);
  private readonly destroyRef = inject(DestroyRef);

  readonly cargando = signal(false);
  readonly mensaje = signal('');

  readonly lista = signal<RoleCountByStatusDTO[]>([]);

  readonly total = computed(() =>
    this.lista().reduce(
      (suma, item) => suma + item.quantityRoles,
      0,
    ),
  );

  readonly activos = computed(() =>
    this.lista().find(
      (item) => item.status === 'Activo',
    )?.quantityRoles ?? 0,
  );

  readonly inactivos = computed(() =>
    this.lista().find(
      (item) => item.status === 'Inactivo',
    )?.quantityRoles ?? 0,
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
          padding: 15,
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

    this.service.rolesPorEstado()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({

        next: (data) => {

          const filas = data.map((item) => ({
            ...item,
            quantityRoles: Number(item.quantityRoles),
          }));

          this.lista.set(filas);

          this.chartData.set({

            labels: filas.map((item) => item.status),

            datasets: [
              {
                label: 'Roles registrados',

                data: filas.map(
                  (item) => item.quantityRoles,
                ),

                backgroundColor: [
                  '#64e6b1',
                  '#ec7777',
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