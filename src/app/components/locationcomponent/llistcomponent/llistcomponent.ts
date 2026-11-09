import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LocationDTO } from '../../../models/locationDTO';
import { LocationService } from '../../../services/locationservice';

@Component({
  imports: [CommonModule],
  selector: 'app-llistcomponent',
  styleUrl: './llistcomponent.css',
  templateUrl: './llistcomponent.html',
})
export class Llistcomponent implements OnInit {
  listaUbicaciones: LocationDTO[] = [];

  constructor(private locationService: LocationService) {}

  ngOnInit(): void {
    this.listarUbicaciones();
}

listarUbicaciones(): void {
  this.locationService.getLocation().subscribe({
    next: (data) => {
      this.listaUbicaciones = data;
    },
    error: (err) => {
      console.error('Error al obtener las ubicaciones:', err);
    }
  });
}
}
