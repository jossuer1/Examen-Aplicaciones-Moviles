import { inject } from '@angular/core';
import type { CanActivateFn, UrlTree } from '@angular/router';
import { Router } from '@angular/router';

import { AuthService } from '../services/auth';

/**
 * Espera a que termine la carga inicial de Firebase Auth con un tiempo límite de seguridad.
 */
async function esperarCargaAuth(auth: AuthService): Promise<void> {
  if (!auth.loading()) {
    return;
  }

  return new Promise<void>((resolve) => {
    const intervalo = setInterval(() => {
      if (!auth.loading()) {
        clearInterval(intervalo);
        resolve();
      }
    }, 40);

    setTimeout(() => {
      clearInterval(intervalo);
      resolve();
    }, 2000);
  });
}

/**
 * Protege rutas que requieren que el usuario esté autenticado.
 */
export const authGuard: CanActivateFn = async (): Promise<boolean | UrlTree> => {
  const auth = inject(AuthService);
  const router = inject(Router);

  await esperarCargaAuth(auth);

  if (auth.isAuthenticated()) {
    return true;
  }

  return router.createUrlTree(['/login']);
};

/**
 * Evita que usuarios ya autenticados vuelvan a la pantalla de login.
 */
export const publicGuard: CanActivateFn = async (): Promise<boolean | UrlTree> => {
  const auth = inject(AuthService);
  const router = inject(Router);

  await esperarCargaAuth(auth);

  if (auth.isAuthenticated()) {
    return router.createUrlTree(['/tabs/inicio']);
  }

  return true;
};
