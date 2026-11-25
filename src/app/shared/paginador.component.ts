import {
  Component,
  Input,
  OnChanges,
} from '@angular/core';

import {
  MatPaginatorIntl,
  MatPaginatorModule,
  PageEvent,
} from '@angular/material/paginator';

function etiquetasPaginador(): MatPaginatorIntl {
  const etiquetas = new MatPaginatorIntl();

  etiquetas.itemsPerPageLabel = 'Registros por página:';
  etiquetas.nextPageLabel = 'Página siguiente';
  etiquetas.previousPageLabel = 'Página anterior';
  etiquetas.firstPageLabel = 'Primera página';
  etiquetas.lastPageLabel = 'Última página';

  etiquetas.getRangeLabel = (
    pagina: number,
    tamanio: number,
    total: number,
  ): string => {
    if (total === 0 || tamanio === 0) {
      return `0 de ${total}`;
    }

    const inicio = pagina * tamanio;
    const fin = Math.min(inicio + tamanio, total);

    return `${inicio + 1}–${fin} de ${total}`;
  };

  return etiquetas;
}

@Component({
  selector: 'app-paginador',
  standalone: true,
  exportAs: 'paginador',
  imports: [MatPaginatorModule],
  providers: [
    {
      provide: MatPaginatorIntl,
      useFactory: etiquetasPaginador,
    },
  ],
  template: `
    <mat-paginator
      [length]="datos.length"
      [pageSize]="tamanio"
      [pageIndex]="paginaActual"
      [pageSizeOptions]="[5, 10, 20]"
      [showFirstLastButtons]="true"
      (page)="cambiarPagina($event)"
      aria-label="Paginación del listado"
    ></mat-paginator>
  `,
  styles: [`
    :host {
      display: block;
      margin-top: 16px;
    }

    mat-paginator {
      background: #101f2b;
      color: #e9f3f5;
      border: 1px solid #2b4654;
      border-radius: 12px;
    }
  `],
})
export class PaginadorComponent<T> implements OnChanges {
  @Input() datos: readonly T[] = [];

  tamanio = 5;
  private indice = 0;

  ngOnChanges(): void {
    // Cuando llega un nuevo listado, comienza en la primera página.
    this.indice = 0;
  }

  get paginaActual(): number {
    const ultima = Math.max(
      0,
      Math.ceil(this.datos.length / this.tamanio) - 1,
    );

    return Math.min(this.indice, ultima);
  }

  get filas(): T[] {
    const inicio = this.paginaActual * this.tamanio;

    return this.datos.slice(
      inicio,
      inicio + this.tamanio,
    );
  }

  cambiarPagina(evento: PageEvent): void {
    this.indice = evento.pageIndex;
    this.tamanio = evento.pageSize;
  }
}