import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';

export const authGuard: CanActivateFn = () => {
  const token = localStorage.getItem('auth_token');
  if (!token) {
    const router = inject(Router);
    router.navigateByUrl('/login');
    return false;
  }
  return true;
};


