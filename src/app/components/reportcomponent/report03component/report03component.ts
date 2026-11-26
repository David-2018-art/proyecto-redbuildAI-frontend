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
  PublicationCountByStatusDTO,
} from '../../../models/reportes.model';

import {
  Reportservice,
  mensajeErrorReporte,
} from '../../../services/reportservice';

@Component({
  selector: 'app-report03component',
  imports: [BaseChartDirective, MatButtonModule],
  templateUrl: './report03component.html',
  styleUrl: '../report-card.css',
})
export class Report03component implements OnInit {

  private readonly service = inject(Reportservice);
  private readonly destroyRef = inject(DestroyRef);

  readonly cargando = signal(false);
  readonly mensaje = signal('');

  readonly lista = signal<PublicationCountByStatusDTO[]>([]);

  readonly total = computed(() =>
    this.lista().reduce(
      (suma, item) => suma + item.quantityPublications,
      0,
    ),
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

  obtener(): void {

    if (this.cargando()) return;

    this.cargando.set(true);
    this.mensaje.set('');

    this.service.publicacionesPorEstado()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({

        next: (data) => {

          const filas = data.map((item) => ({
            ...item,
            quantityPublications: Number(item.quantityPublications),
          }));

          this.lista.set(filas);

          this.chartData.set({
            labels: filas.map((item) => item.status),
            datasets: [
              {
                label: 'Publicaciones registradas',
                data: filas.map(
                  (item) => item.quantityPublications,
                ),
                backgroundColor: [
                  '#64e6b1',
                  '#eab54c',
                  '#72d8ed',
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