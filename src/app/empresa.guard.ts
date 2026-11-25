import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { Authservice } from './services/authservice';

export const empresaGuard: CanActivateFn = () => {
  const auth = inject(Authservice);
  const router = inject(Router);

  if (!auth.isAuthenticated) {
    return router.createUrlTree(['/login']);
  }

  return auth.session()?.role === 'Empresa'
    ? true
    : router.createUrlTree(['/productos/listar']);
};