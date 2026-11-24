import {
  Component,
  computed,
  DestroyRef,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { BaseChartDirective } from 'ng2-charts';
import { ChartData, ChartOptions } from 'chart.js';
import { MatButtonModule } from '@angular/material/button';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { UserCountByRoleDTO } from '../../../models/reportes.model';
import {
  Reportservice,
  mensajeErrorReporte,
} from '../../../services/reportservice';

@Component({
  selector: 'app-report02component',
  imports: [BaseChartDirective, MatButtonModule],
  templateUrl: './report02component.html',
  styleUrl: '../report-card.css',
})
export class Report02component implements OnInit {
  private readonly service = inject(Reportservice);
  private readonly destroyRef = inject(DestroyRef);

  readonly cargando = signal(false);
  readonly mensaje = signal('');
  readonly lista = signal<UserCountByRoleDTO[]>([]);

  readonly total = computed(() =>
    this.lista().reduce((suma, item) => suma + item.quantityUsers, 0),
  );

  readonly chartData = signal<ChartData<'doughnut'>>({
    labels: [],
    datasets: [],
  });

  readonly chartOptions: ChartOptions<'doughnut'> = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '68%',
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: '#e9f3f5',
          padding: 20,
          usePointStyle: true,
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

    this.service.usuariosPorRol()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (data) => {
          const filas = data.map((item) => ({
            ...item,
            quantityUsers: Number(item.quantityUsers),
          }));

          const colores = [
            '#64e6b1',
            '#72d8ed',
            '#b6a4ff',
            '#ffd580',
            '#ff9cae',
            '#7baaff',
          ];

          this.lista.set(filas);

          this.chartData.set({
            labels: filas.map((item) => item.nameRole),
            datasets: [
              {
                label: 'Usuarios registrados',
                data: filas.map((item) => item.quantityUsers),
                backgroundColor: filas.map(
                  (_, indice) => colores[indice % colores.length],
                ),
                borderColor: '#101f2b',
                borderWidth: 3,
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