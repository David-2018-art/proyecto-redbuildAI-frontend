import {
  Component,
  DestroyRef,
  OnInit,
  inject,
  signal,
} from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { Empresaservice } from '../../services/empresaservice';
import { EmpresaResumen } from '../../models/empresa-resumen.model';

@Component({
  selector: 'app-empresacomponent',
  imports: [DecimalPipe, MatButtonModule],
  templateUrl: './empresacomponent.html',
  styleUrl: './empresacomponent.css',
})
export class Empresacomponent implements OnInit {
  private readonly service = inject(Empresaservice);
  private readonly destroyRef = inject(DestroyRef);

  readonly resumen = signal<EmpresaResumen | null>(null);
  readonly cargando = signal(false);
  readonly mensaje = signal('');

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    if (this.cargando()) return;

    this.cargando.set(true);
    this.mensaje.set('');
    this.resumen.set(null);

    this.service.obtenerMiResumen()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (data) => {
          this.resumen.set(data);
          this.cargando.set(false);
        },
        error: (error) => {
          this.cargando.set(false);

          this.mensaje.set(
            error.status === 401
              ? 'Tu sesión no es válida. Cierra sesión e ingresa nuevamente.'
              : error.status === 403
                ? 'Este resumen está disponible solo para cuentas Empresa activas.'
                : error.status === 0
                  ? 'No se pudo conectar con el backend.'
                  : 'No se pudo obtener el resumen. Intenta nuevamente.',
          );
        },
      });
  }
}