import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { BaseChartDirective } from 'ng2-charts';
import { ChartData, ChartOptions } from 'chart.js';
import { MatButtonModule } from '@angular/material/button';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DestroyRef } from '@angular/core';

import { CategoryProductCountDTO } from '../../../models/reportes.model';
import {
  Reportservice,
  mensajeErrorReporte,
} from '../../../services/reportservice';

@Component({
  selector: 'app-report01component',
  imports: [BaseChartDirective, MatButtonModule],
  templateUrl: './report01component.html',
  styleUrl: '../report-card.css',
})
export class Report01component implements OnInit {
  private readonly service = inject(Reportservice);
  private readonly destroyRef = inject(DestroyRef);

  readonly cargando = signal(false);
  readonly mensaje = signal('');
  readonly lista = signal<CategoryProductCountDTO[]>([]);

  readonly total = computed(() =>
    this.lista().reduce((suma, item) => suma + item.quantityProducts, 0),
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

  obtener(): void {
    if (this.cargando()) return;

    this.cargando.set(true);
    this.mensaje.set('');

    this.service.productosPorCategoria()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (data) => {
          const filas = data.map((item) => ({
            ...item,
            quantityProducts: Number(item.quantityProducts),
          }));

          this.lista.set(filas);

          this.chartData.set({
            labels: filas.map((item) => item.nameCategory),
            datasets: [
              {
                label: 'Productos registrados',
                data: filas.map((item) => item.quantityProducts),
                backgroundColor: '#64e6b1',
                hoverBackgroundColor: '#72d8ed',
                borderRadius: 6,
                maxBarThickness: 48,
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