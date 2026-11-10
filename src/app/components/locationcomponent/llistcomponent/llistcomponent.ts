import { Component, OnInit } from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { Router } from '@angular/router';
import { LocationService } from '../../../services/locationservice';
import { LocationDTO } from '../../../models/locationDTO';

@Component({
  imports: [MatTableModule, MatButtonModule],
  selector: 'app-llistcomponent',
  styleUrl: './llistcomponent.css',
  templateUrl: './llistcomponent.html',
})
export class Llistcomponent implements OnInit {
  ubicaciones: LocationDTO[] = [];
  displayedColumns: string[] = [
    'idLocation',
    'department',
    'province',
    'district',
    'referenceAddress',
    'latitude',
    'longitude',
    'acciones',
  ];

  constructor(
    private lS: LocationService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.listar();
  }

  listar(): void {
    this.lS.getLocation().subscribe({
      next: (data: LocationDTO[]) => {
        this.ubicaciones = data;
      },
      error: (error) => {
        console.error('Error al listar las ubicaciones:', error);
      },
    });
  }

  editar(id: number | undefined): void {
    if (id == undefined) {
      return;
    }

    this.router.navigate(['/ubicaciones/editar', id]);
  }

  eliminar(id: number | undefined): void {
    if (id == undefined) {
      return;
    }

    const confirmar = confirm('Está seguro de que desea eliminar esta ubicación? ' + id + '?');

    if (confirmar) {
      this.lS.deleteLocation(id).subscribe({
        next: () => {
          alert('Ubicación eliminada correctamente');
          this.listar();
        },
        error: (error) => {
          console.error('Error al eliminar la ubicación:', error);
          alert('Error al eliminar la ubicación');
        },
      });
    }
  }
}
