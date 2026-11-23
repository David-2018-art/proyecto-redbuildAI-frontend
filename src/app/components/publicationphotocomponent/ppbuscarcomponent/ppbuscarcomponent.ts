import { ChangeDetectorRef, Component } from '@angular/core';import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { PublicationPhotoService } from '../../../services/publicationphotoservice';
import { PublicationPhotoDTO } from '../../../models/publicationPhotoDTO';

@Component({
  imports: [FormsModule, MatInputModule, MatButtonModule],
  selector: 'app-ppbuscarcomponent',
  styleUrl: './ppbuscarcomponent.css',
  templateUrl: './ppbuscarcomponent.html',
})
export class Ppbuscarcomponent {
  idPhoto: number | null = null;
  idPublication: number | null = null;

  foto: PublicationPhotoDTO | null = null;
  fotos: PublicationPhotoDTO[] = [];
  mensaje: string = '';

 constructor(
  private ppS: PublicationPhotoService,
  private cdr: ChangeDetectorRef,
) {}

  buscarPorId(): void {
    this.foto = null;
    this.fotos = [];
    this.mensaje = '';

    if (this.idPhoto === null || !Number.isInteger(this.idPhoto) || this.idPhoto <= 0) {
      this.mensaje = 'Ingrese un ID de foto válido';
      return;
    }

    this.ppS.getPublicationPhotoById(this.idPhoto).subscribe({
  next: (data: PublicationPhotoDTO) => {
    this.foto = data;
    this.mensaje = 'Foto encontrada correctamente';
    this.cdr.markForCheck();
  },
  error: (error) => {
    console.error('Error al buscar la foto:', error);

    this.mensaje = error.status === 404
      ? 'No existe una foto con ese ID.'
      : 'No se pudo consultar la foto.';

    this.cdr.markForCheck();
  },
});
  }

  buscarPorPublicacion(): void {
    this.foto = null;
    this.fotos = [];
    this.mensaje = '';

    if (
      this.idPublication === null ||
      !Number.isInteger(this.idPublication) ||
      this.idPublication <= 0
    ) {
      this.mensaje = 'Ingrese un ID de publicación válido';
      return;
    }

   this.ppS.getPhotosByPublicationId(this.idPublication).subscribe({
  next: (data: PublicationPhotoDTO[]) => {
    this.fotos = data;

    this.mensaje = data.length > 0
      ? 'Fotos encontradas correctamente'
      : 'No hay fotos registradas para esta publicación';

    this.cdr.markForCheck();
  },
  error: (error) => {
    console.error('Error al buscar las fotos:', error);

    this.mensaje = error.status === 404
      ? 'No se encontró la publicación o el recurso solicitado.'
      : 'No se pudieron consultar las fotos.';

    this.cdr.markForCheck();
  },
});
  }
}
