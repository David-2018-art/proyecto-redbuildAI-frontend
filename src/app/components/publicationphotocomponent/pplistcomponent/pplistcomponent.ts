import { Component, OnInit } from '@angular/core';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { Router } from '@angular/router';
import { PublicationPhotoService } from '../../../services/publicationphotoservice';
import { PublicationPhotoDTO } from '../../../models/publicationPhotoDTO';
import { PaginadorComponent } from '../../../shared/paginador.component';

@Component({
  imports: [MatTableModule, MatButtonModule,PaginadorComponent],
  selector: 'app-pplistcomponent',
  styleUrl: './pplistcomponent.css',
  templateUrl: './pplistcomponent.html',
})
export class Pplistcomponent implements OnInit {
  dataSource = new MatTableDataSource<PublicationPhotoDTO>();

  displayedColumns: string[] = [
    'idPhoto',
    'urlPhoto',
    'descriptionPhoto',
    'uploadDate',
    'idPublication',
    'acciones',
  ];

  constructor(
    private ppS: PublicationPhotoService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.listar();
  }

  listar(): void {
    this.ppS.getPublicationPhotos().subscribe({
      next: (data: PublicationPhotoDTO[]) => {
        this.dataSource.data = data;
      },
      error: (error) => {
        console.error('Error al listar las fotos:', error);
      },
    });
  }

  editar(id: number): void {
    this.router.navigate(['/fotos-publicaciones/editar', id]);
  }

  eliminar(id: number): void {
    if (confirm('¿Está seguro de eliminar esta foto?')) {
      this.ppS.deletePublicationPhoto(id).subscribe({
        next: () => {
          this.listar();
        },
        error: (error) => {
          console.error('Error al eliminar la foto:', error);
        },
      });
    }
  }
}
