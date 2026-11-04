
import { Component, OnInit } from '@angular/core';
import { Publicationservice } from '../../../services/publicationservice';
import { PublicationDTO } from '../../../models/publicationDTO';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { Router } from '@angular/router';

@Component({
  selector: 'app-plistcomponent',
  imports: [MatTableModule, MatButtonModule],
  templateUrl: './plistcomponent.html',
  styleUrl: './plistcomponent.css'
})
export class Plistcomponent implements OnInit {

  publicaciones: PublicationDTO[] = [];

  displayedColumns: string[] = [
    'id',
    'title',
    'operationType',
    'status',
    'productId',
    'locationId',
    'acciones'
  ];

  constructor(
    private pS: Publicationservice,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.listar();
  }

  listar(): void {
    this.pS.getPublications().subscribe({
      next: (data: PublicationDTO[]) => {
        this.publicaciones = data;
      },
      error: (error) => {
        console.error('Error al listar publicaciones:', error);
      }
    });
  }

  editar(id: number | undefined): void {
    if (id === undefined) {
      return;
    }

    this.router.navigate(['/publicaciones/editar', id]);
  }

  eliminar(id: number | undefined): void {
    if (id === undefined) {
      return;
    }

    const confirmar = confirm(
      '¿Está seguro de eliminar la publicación ' + id + '?'
    );

    if (confirmar) {
      alert('Eliminación pendiente de conexión con el backend');
    }
  }

}
