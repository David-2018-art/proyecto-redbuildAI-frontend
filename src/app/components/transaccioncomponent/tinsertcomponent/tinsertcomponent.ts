import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { Publicationservice } from '../../../services/publicationservice';
import { Transaccionservice } from '../../../services/transaccionservice';
import { Authservice } from '../../../services/authservice';
import { PublicationDTO } from '../../../models/publicationDTO';

@Component({
  selector: 'app-tinsertcomponent',
  imports: [ReactiveFormsModule, RouterLink, MatFormFieldModule, MatInputModule, MatSelectModule, MatButtonModule],
  templateUrl: './tinsertcomponent.html',
})
export class Tinsertcomponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly publicationService = inject(Publicationservice);
  private readonly transactionService = inject(Transaccionservice);
  private readonly auth = inject(Authservice);
  private readonly router = inject(Router);

  publications: PublicationDTO[] = [];
  guardando = false;
  form = this.fb.nonNullable.group({
    idPublication: [0, [Validators.required, Validators.min(1)]],
    typeTransaction: ['Venta' as 'Venta' | 'Donacion', Validators.required],
    quantityTransaction: [1, [Validators.required, Validators.min(0.001)]],
    agreedUnitPrice: [0, [Validators.required, Validators.min(0)]],
    descriptionTransaction: ['', Validators.maxLength(500)],
  });

  ngOnInit(): void {
    this.publicationService.getPublications().subscribe({
      next: (data) => this.publications = data,
    });
  }

  publicar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const session = this.auth.session();
    if (!session) return;
    this.guardando = true;
    const value = this.form.getRawValue();
    this.transactionService.insert({
      ...value,
      idUser: session.idUser,
      statusTransaction: 'Solicitada',
    }).subscribe({
      next: () => this.router.navigate(['/transacciones/listar']),
      error: (error) => {
        this.guardando = false;
        alert(error.error?.message ?? 'No se pudo registrar la transacción.');
      },
    });
  }
}
