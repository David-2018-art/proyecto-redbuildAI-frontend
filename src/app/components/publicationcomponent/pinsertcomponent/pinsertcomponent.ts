import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { forkJoin, of } from 'rxjs';

import { Publicationservice } from '../../../services/publicationservice';
import { Productservice } from '../../../services/productservice';
import { LocationService } from '../../../services/locationservice';
import { Authservice } from '../../../services/authservice';
import { PublicationDTO } from '../../../models/publicationDTO';
import { Product } from '../../../models/product.model';
import { LocationDTO } from '../../../models/locationDTO';

@Component({
  selector: 'app-pinsertcomponent',
  imports: [
    ReactiveFormsModule, RouterLink, MatFormFieldModule,
    MatInputModule, MatSelectModule, MatButtonModule,
  ],
  templateUrl: './pinsertcomponent.html',
  styleUrl: './pinsertcomponent.css',
})
export class Pinsertcomponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly service = inject(Publicationservice);
  private readonly productService = inject(Productservice);
  private readonly locationService = inject(LocationService);
  private readonly auth = inject(Authservice);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  readonly editando = this.route.snapshot.paramMap.has('id');
  readonly id = Number(this.route.snapshot.paramMap.get('id'));
  readonly cargando = signal(true);
  readonly listo = signal(false);
  readonly guardando = signal(false);
  readonly mensaje = signal('');

  productos: Product[] = [];
  ubicaciones: LocationDTO[] = [];
  private original?: PublicationDTO;

  readonly form = this.fb.nonNullable.group({
    title: ['', [
      Validators.required, Validators.pattern(/\S/),
      Validators.maxLength(120),
    ]],
    observations: ['', Validators.maxLength(500)],
    operationType: ['Venta', Validators.required],
    status: ['Disponible', Validators.required],
    productId: [0, [Validators.required, Validators.min(1)]],
    locationId: [0, [Validators.required, Validators.min(1)]],
  });

  ngOnInit(): void {
    const session = this.auth.session();

    if (!session) {
      this.cargando.set(false);
      this.mensaje.set('Debes iniciar sesión.');
      return;
    }

    if (this.editando && (!Number.isSafeInteger(this.id) || this.id <= 0)) {
      this.cargando.set(false);
      this.mensaje.set('ID inválido.');
      return;
    }

    forkJoin({
      productos: this.productService.getProducts(),
      ubicaciones: this.locationService.getLocation(),
      publicacion: this.editando
        ? this.service.getPublicationById(this.id)
        : of(null),
    }).subscribe({
      next: ({ productos, ubicaciones, publicacion }) => {
        this.productos = productos.filter(product =>
          session.role === 'Administrador' || product.idUser === session.idUser
        );
        this.ubicaciones = ubicaciones;

        if (publicacion) {
          if (
            session.role !== 'Administrador' &&
            publicacion.publisherUserId !== session.idUser
          ) {
            this.cargando.set(false);
            this.mensaje.set('No tienes permiso para editar esta publicación.');
            return;
          }

          this.original = publicacion;
          this.form.patchValue({
            ...publicacion,
            observations: publicacion.observations ?? '',
          });
          this.form.controls.productId.disable();
        }

        this.cargando.set(false);
        this.listo.set(true);

        if (!this.productos.length || !this.ubicaciones.length) {
          this.mensaje.set('Necesitas un producto propio y una ubicación.');
        }
      },
      error: (error) => this.error(error),
    });
  }

  guardar(): void {
    if (this.guardando() || !this.listo()) return;

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.getRawValue();
    const propietario = this.original?.publisherUserId ??
      this.productos.find(product => product.idProduct === value.productId)?.idUser;

    if (!propietario) {
      this.mensaje.set('Selecciona un producto válido.');
      return;
    }

    const dto: PublicationDTO = {
      ...value,
      title: value.title.trim(),
      observations: value.observations.trim(),
      publisherUserId: propietario,
      ...(this.editando ? { id: this.id } : {}),
    };

    this.guardando.set(true);
    this.mensaje.set('');

    const request = this.editando
      ? this.service.updatePublication(this.id, dto)
      : this.service.createPublication(dto);

    request.subscribe({
      next: () => this.router.navigate(['/publicaciones/listar']),
      error: (error) => this.error(error),
    });
  }

  private error(error: any): void {
    this.cargando.set(false);
    this.guardando.set(false);

    this.mensaje.set(
      error.status === 401 ? 'Debes iniciar sesión nuevamente.'
      : error.status === 403 ? 'No tienes permiso para gestionar esta publicación.'
      : error.status === 404 ? 'La publicación o un registro relacionado no existe.'
      : error.error?.message ?? 'No se pudo completar la operación.'
    );
  }
}