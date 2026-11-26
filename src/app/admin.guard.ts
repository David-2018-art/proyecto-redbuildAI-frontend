import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Authservice } from './services/authservice';

export const adminGuard: CanActivateFn = () => {

  const auth = inject(Authservice);
  const router = inject(Router);

  const session = auth.session();

  if (!auth.isAuthenticated || !session) {
    return router.createUrlTree(['/login']);
  }

  if (session.role !== 'Administrador') {
    return router.createUrlTree(['/transacciones/listar']);
  }

  return true;
};