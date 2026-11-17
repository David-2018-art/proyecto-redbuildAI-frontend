import { Component, OnInit, inject } from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { RouterLink } from '@angular/router';
import { Transaccion } from '../../../models/transaccion.model';
import { Transaccionservice } from '../../../services/transaccionservice';
import { Authservice } from '../../../services/authservice';

@Component({
  selector: 'app-tlistcomponent',
  imports: [MatTableModule, MatButtonModule, RouterLink],
  templateUrl: './tlistcomponent.html',
})
export class Tlistcomponent implements OnInit {
  private readonly service = inject(Transaccionservice);
  private readonly auth = inject(Authservice);
  displayedColumns = ['id', 'tipo', 'cantidad', 'precio', 'total', 'estado', 'publicacion', 'acciones'];
  dataSource: Transaccion[] = [];
  cargando = true;
  mensaje = '';

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    const session = this.auth.session();
    if (!session) return;
    this.cargando = true;
    const request = session.role === 'Administrador'
      ? this.service.getAll()
      : this.service.getByUser(session.idUser);
    request.subscribe({
      next: (data) => {
        this.dataSource = data;
        this.cargando = false;
      },
      error: () => {
        this.cargando = false;
        this.mensaje = 'No se pudieron cargar las transacciones.';
      },
    });
  }

  eliminar(transaccion: Transaccion): void {
    if (!transaccion.idTransaccion || !confirm('¿Deseas eliminar esta transacción?')) return;
    this.service.delete(transaccion.idTransaccion).subscribe({
      next: () => this.cargar(),
      error: () => alert('No se pudo eliminar la transacción.'),
    });
  }
}
