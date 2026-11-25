import {
  Component,
  OnInit,
  inject,
  ChangeDetectorRef
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { Resenaservice } from '../../../services/resenaservice';
import { Transaccionservice } from '../../../services/transaccionservice';
import { Authservice } from '../../../services/authservice';
import { Transaccion } from '../../../models/transaccion.model';
import { forkJoin } from 'rxjs';
import { Publicationservice } from '../../../services/publicationservice';
import { PublicationDTO } from '../../../models/publicationDTO';
import { Userservice } from '../../../services/userservice';

@Component({
  selector: 'app-reinsertcomponent',
  imports: [ReactiveFormsModule, RouterLink, MatFormFieldModule, MatInputModule, MatSelectModule, MatButtonModule],
  templateUrl: './reinsertcomponent.html',
  styleUrl: './reinsertcomponent.css',
})
export class Reinsertcomponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly service = inject(Resenaservice);
  private readonly transaccionService = inject(Transaccionservice);
  private readonly auth = inject(Authservice);
  private readonly userService = inject(Userservice);
  private readonly router = inject(Router);
  private readonly publicationService = inject(Publicationservice);
  private readonly route = inject(ActivatedRoute);
  private readonly cdr = inject(ChangeDetectorRef);
  
  transacciones: Transaccion[] = [];
  guardando = false;

  publicaciones: PublicationDTO[] = [];
  cargando = true;
  mensaje = '';
  usuarioCalificado = '';

  form = this.fb.nonNullable.group({
    idTransaccion: [0, [Validators.required, Validators.min(1)]],
    idRatedUser: [
  { value: 0, disabled: true },
  [Validators.required, Validators.min(1)]
],
    titleResena: ['', [Validators.required, Validators.maxLength(100)]],
    descriptionResena: ['', Validators.maxLength(500)],
    scoreResena: [5, [Validators.required, Validators.min(1), Validators.max(5)]],
  });

  ngOnInit(): void {

  const session = this.auth.session();

  if (!session) {
    this.cargando = false;
    return;
  }

  forkJoin({
  propias: this.transaccionService.getByUser(session.idUser),
  recibidas: this.transaccionService.getReceived(),
  publicaciones: this.publicationService.getPublications(),
  resenas: this.service.getByUser(session.idUser)
}).subscribe({

next: ({ propias, recibidas, publicaciones, resenas }) => {
      this.publicaciones = publicaciones;

      const todas = Array.from(
        new Map(
          [...propias, ...recibidas].map(
            t => [t.idTransaccion, t]
          )
        ).values()
      );

      this.transacciones = todas.filter(t => {

        const yaCalificada = resenas.some(
  r => r.idTransaccion === t.idTransaccion &&
       r.idUser === session.idUser
);

if (yaCalificada) return false;

        const publicacion = publicaciones.find(
          p => p.id === t.idPublication
        );

        if (!publicacion) return false;

        return t.statusTransaction === 'Completada' &&
          t.idUser !== publicacion.publisherUserId &&
          (
            t.idUser === session.idUser ||
            publicacion.publisherUserId === session.idUser
          );

      });

      const id = Number(
        this.route.snapshot.queryParamMap.get('idTransaccion')
      );

      if (id > 0 && this.transacciones.some(
        t => t.idTransaccion === id
      )) {

        this.form.controls.idTransaccion.setValue(id);
        this.seleccionarTransaccion(id);

      }

      this.cargando = false;
      this.cdr.detectChanges();
    },

    error: () => {
      this.cargando = false;
      this.mensaje = 'No se pudieron cargar las transacciones.';
      this.cdr.detectChanges();
    }

  });
}

seleccionarTransaccion(id: number): void {

  const session = this.auth.session();

  this.form.controls.idRatedUser.setValue(0);
  this.usuarioCalificado = '';

  if (!session) return;

  const transaccion = this.transacciones.find(
    t => t.idTransaccion === id
  );

  if (!transaccion) return;

  const publicacion = this.publicaciones.find(
    p => p.id === transaccion.idPublication
  );

  if (!publicacion) return;

  const idCalificado =
    transaccion.idUser === session.idUser
      ? publicacion.publisherUserId
      : transaccion.idUser;

  if (!idCalificado || idCalificado === session.idUser) {
    return;
  }

  this.form.controls.idRatedUser.setValue(idCalificado);

  this.usuarioCalificado = 'Cargando nombre...';

this.userService.getNombreUsuario(idCalificado).subscribe({

  next: (data) => {

    if (this.form.controls.idRatedUser.value !== idCalificado) {
      return;
    }

    this.usuarioCalificado = data.nombreCompleto;
    this.cdr.detectChanges();

  },

  error: () => {

    if (this.form.controls.idRatedUser.value !== idCalificado) {
      return;
    }

    this.usuarioCalificado =
      transaccion.idUser === session.idUser
        ? 'Vendedor de la publicación'
        : 'Comprador de la publicación';

    this.cdr.detectChanges();

  }

});

this.cdr.detectChanges();
}

nombrePublicacion(id: number): string {

  return this.publicaciones.find(
    p => p.id === id
  )?.title ?? 'Publicación';
}

  registrar(): void {

  if (this.guardando) return;

  if (this.form.invalid) {
    this.form.markAllAsTouched();
    return;
  }

  const session = this.auth.session();

  if (!session) return;

  this.seleccionarTransaccion(
    this.form.controls.idTransaccion.value
  );

  const value = this.form.getRawValue();

  if (
    value.idRatedUser <= 0 ||
    value.idRatedUser === session.idUser
  ) {
    alert('Selecciona una transacción válida.');
    return;
  }

  this.guardando = true;

  this.service.insert({
    ...value,
    idUser: session.idUser,
    statusResena: true
  }).subscribe({

    next: () => {

      this.guardando = false;

      alert('Reseña registrada correctamente.');

      this.router.navigate(['/resenas/listar']);
    },

    error: (error) => {

      this.guardando = false;

      alert(
        error.error?.message ??
        'No se pudo registrar la reseña.'
      );

      this.cdr.detectChanges();
    }

  });
}
}
