import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'tabs',
    loadComponent: () => import('./tabs/tabs.page').then(m => m.TabsPage),
    children: [
      { path: 'inicio', loadComponent: () => import('./pages/inicio/inicio.page').then(m => m.InicioPage) },
      { path: 'incidencias', loadComponent: () => import('./pages/incidencias/incidencias.page').then(m => m.IncidenciasPage) },
      { path: 'seguimiento', loadComponent: () => import('./pages/seguimiento/seguimiento.page').then(m => m.SeguimientoPage) },
      { path: 'nueva', loadComponent: () => import('./pages/nueva/nueva.page').then(m => m.NuevaPage) },
      { path: '', redirectTo: 'inicio', pathMatch: 'full' },
    ],
  },
  { path: 'detalle/:id', loadComponent: () => import('./pages/detalle/detalle.page').then(m => m.DetallePage) },
  { path: '', redirectTo: 'tabs/inicio', pathMatch: 'full' },
];