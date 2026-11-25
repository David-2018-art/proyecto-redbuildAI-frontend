import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Authservice } from './services/authservice';

export const authInterceptor: HttpInterceptorFn = (request, next) => {
  const token = inject(Authservice).token;
  if (!token) return next(request);

  const authorizedRequest = request.clone({
    setHeaders: { Authorization: 'Bearer ' + token },
  });

  return next(authorizedRequest);
};
