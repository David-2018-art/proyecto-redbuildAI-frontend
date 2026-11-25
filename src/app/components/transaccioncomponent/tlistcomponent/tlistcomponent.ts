import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { RouterLink } from '@angular/router';
import { forkJoin, map } from 'rxjs';

import { Transaccion } from '../../../models/transaccion.model';
import { Transaccionservice } from '../../../services/transaccionservice';
import { Authservice } from '../../../services/authservice';

import { PaginadorComponent } from '../../../shared/paginador.component';
import { Publicationservice } from '../../../services/publicationservice';
import { PublicationDTO } from '../../../models/publicationDTO';

import { Resenaservice } from '../../../services/resenaservice';
import { Resena } from '../../../models/resena.model';
@Component({
  selector: 'app-tlistcomponent',
  imports: [MatTableModule, MatButtonModule, RouterLink, PaginadorComponent],
  templateUrl: './tlistcomponent.html',
})
export class Tlistcomponent implements OnInit {
  private readonly service = inject(Transaccionservice);
  private readonly auth = inject(Authservice);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly publicationService = inject(Publicationservice);
  private readonly resenaService = inject(Resenaservice);
  
  misResenas: Resena[] = [];
resenasCargadas = false;
  
  publicaciones: PublicationDTO[] = [];

  displayedColumns = [
    'id', 'tipo', 'cantidad', 'precio', 'total',
    'estado', 'publicacion', 'acciones',
  ];
  dataSource: Transaccion[] = [];
  cargando = true;
  mensaje = '';

  ngOnInit(): void {

  this.publicationService.getPublications().subscribe({
    next: data => {
      this.publicaciones = data;
      this.cdr.detectChanges();
    }
  });

  const session = this.auth.session();

if (session) {
  this.resenaService.getByUser(session.idUser).subscribe({
    next: data => {
      this.misResenas = data;
      this.resenasCargadas = true;
      this.cdr.detectChanges();
    },
    error: () => {
      this.resenasCargadas = false;
      this.cdr.detectChanges();
    }
  });
}

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
    this.dataSource = [...data].sort(
      (a, b) => (a.idTransaccion ?? 0) - (b.idTransaccion ?? 0)
    );
    this.cargando = false;
    this.cdr.detectChanges();
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


  puedeCalificar(transaction: Transaccion): boolean {

  const session = this.auth.session();

  if (!session || !this.resenasCargadas) return false;

  if (transaction.statusTransaction !== 'Completada') {
    return false;
  }

  const yaCalificada = this.misResenas.some(
    r => r.idTransaccion === transaction.idTransaccion &&
         r.idUser === session.idUser
  );

  if (yaCalificada) return false;

  const publicacion = this.publicaciones.find(
    p => p.id === transaction.idPublication
  );

  if (!publicacion) return false;

  return transaction.idUser !== publicacion.publisherUserId &&
    (
      transaction.idUser === session.idUser ||
      publicacion.publisherUserId === session.idUser
    );
}

nombrePublicacion(id: number): string {

  return this.publicaciones.find(
    p => p.id === id
  )?.title ?? 'Publicación';
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