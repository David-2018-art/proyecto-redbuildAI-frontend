import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Authservice } from './services/authservice';

export const authGuard: CanActivateFn = () => {
  const auth = inject(Authservice);
  const router = inject(Router);
  return auth.isAuthenticated
    ? true
    : router.createUrlTree(['/login']);
};
