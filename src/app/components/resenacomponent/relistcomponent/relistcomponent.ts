import { Component, OnInit, inject } from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Resena } from '../../../models/resena.model';
import { Resenaservice } from '../../../services/resenaservice';
import { Authservice } from '../../../services/authservice';

@Component({
  selector: 'app-relistcomponent',
  imports: [MatTableModule, MatButtonModule, RouterLink, DatePipe],
  templateUrl: './relistcomponent.html',
})
export class Relistcomponent implements OnInit {
  private readonly service = inject(Resenaservice);
  private readonly auth = inject(Authservice);
  displayedColumns = ['id', 'titulo', 'calificacion', 'comentario', 'fecha', 'estado', 'transaccion', 'acciones'];
  dataSource: Resena[] = [];
  cargando = true;
  mensaje = '';

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    this.cargando = true;
    this.service.getAll().subscribe({
      next: (data) => {
        this.dataSource = data;
        this.cargando = false;
      },
      error: () => {
        this.cargando = false;
        this.mensaje = 'No se pudieron cargar las reseñas.';
      },
    });
  }

  eliminar(resena: Resena): void {
    if (!resena.idResena || !confirm('¿Deseas eliminar esta reseña?')) return;
    this.service.delete(resena.idResena).subscribe({
      next: () => this.cargar(),
      error: () => alert('No se pudo eliminar la reseña.'),
    });
  }
}
