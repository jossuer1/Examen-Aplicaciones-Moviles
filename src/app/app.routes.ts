import type { Routes } from '@angular/router';

import { authGuard, publicGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    canActivate: [publicGuard],
    loadComponent: () => import('./pages/login/login.page').then((m) => m.LoginPage),
  },
  {
    path: 'tabs',
    canActivate: [authGuard],
    loadComponent: () => import('./tabs/tabs.page').then((m) => m.TabsPage),
    children: [
      { path: 'inicio', loadComponent: () => import('./pages/inicio/inicio.page').then((m) => m.InicioPage) },
      { path: 'incidencias', loadComponent: () => import('./pages/incidencias/incidencias.page').then((m) => m.IncidenciasPage) },
      { path: 'seguimiento', loadComponent: () => import('./pages/seguimiento/seguimiento.page').then((m) => m.SeguimientoPage) },
      { path: 'nueva', loadComponent: () => import('./pages/nueva/nueva.page').then((m) => m.NuevaPage) },
      { path: '', redirectTo: 'inicio', pathMatch: 'full' },
    ],
  },
  {
    path: 'detalle/:id',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/detalle/detalle.page').then((m) => m.DetallePage),
  },
  { path: '', redirectTo: 'tabs/inicio', pathMatch: 'full' },
  { path: '**', redirectTo: 'tabs/inicio' },
];
