import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { RouterLink } from '@angular/router';
import { forkJoin, map } from 'rxjs';

import { Transaccion } from '../../../models/transaccion.model';
import { Transaccionservice } from '../../../services/transaccionservice';
import { Authservice } from '../../../services/authservice';

import { PaginadorComponent } from '../../../shared/paginador.component';
@Component({
  selector: 'app-tlistcomponent',
  imports: [MatTableModule, MatButtonModule, RouterLink, PaginadorComponent],
  templateUrl: './tlistcomponent.html',
})
export class Tlistcomponent implements OnInit {
  private readonly service = inject(Transaccionservice);
  private readonly auth = inject(Authservice);
  private readonly cdr = inject(ChangeDetectorRef);

  displayedColumns = [
    'id', 'tipo', 'cantidad', 'precio', 'total',
    'estado', 'publicacion', 'acciones',
  ];
  dataSource: Transaccion[] = [];
  cargando = true;
  mensaje = '';

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    const session = this.auth.session();

    if (!session) {
      this.cargando = false;
      this.mensaje = 'Debes iniciar sesión.';
      return;
    }

    this.cargando = true;
    this.mensaje = '';

    const request = session.role === 'Administrador'
      ? this.service.getAll()
      : forkJoin([
          this.service.getByUser(session.idUser),
          this.service.getReceived(),
        ]).pipe(
          map(([propias, recibidas]) => Array.from(
            new Map(
              [...propias, ...recibidas].map(t => [t.idTransaccion, t])
            ).values()
          ))
        );

    request.subscribe({
      next: data => {
        this.dataSource = data;
        this.cargando = false;
        this.cdr.markForCheck();
      },
      error: error => {
        this.cargando = false;
        this.mensaje = error.status === 401
          ? 'Inicia sesión nuevamente.'
          : 'No se pudieron cargar las transacciones.';
        this.cdr.markForCheck();
      },
    });
  }

  puedeGestionar(transaction: Transaccion): boolean {
    return ['Solicitada', 'Reservada'].includes(transaction.statusTransaction);
  }

  puedeEliminar(transaction: Transaccion): boolean {
    const session = this.auth.session();
    return session?.role === 'Administrador' ||
      transaction.idUser === session?.idUser;
  }

  eliminar(transaction: Transaccion): void {
    if (!transaction.idTransaccion || !this.puedeEliminar(transaction)) return;
    if (!confirm('¿Eliminar esta transacción?')) return;

    this.service.delete(transaction.idTransaccion).subscribe({
      next: () => this.cargar(),
      error: error => alert(
        error.status === 409
          ? 'No se puede eliminar porque tiene reseñas asociadas.'
          : 'No se pudo eliminar la transacción.'
      ),
    });
  }
}