import { Routes } from '@angular/router';
import { AdminComponent } from './admin/admin';
import { guardRol } from './role-guard';
import { autorizacionRedirectGuard } from './autorizacion-redirect-guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/autorizacion', 
    pathMatch: 'full'
  },
  {
  path: 'autorizacion',  
  canActivate: [autorizacionRedirectGuard],
  loadComponent: () => import('./autorizacion/autorizacion').then(m => m.AutorizacionComponent)
},


  {
    path: 'carrito',
    canActivate: [guardRol],
    loadComponent: () => import('./carrito/carrito').then(m => m.CarritoComponent)
  },

    {
    path: 'verificar',
    canActivate: [guardRol],
    loadComponent: () => import('./verificar/verificar').then(m => m.VerificarComponent)
  },

  
    {
    path: 'perfil',
    canActivate: [guardRol],
    loadComponent: () => import('./perfil/perfil').then(m => m.PerfilComponent)
  },

{
path: 'admin',  
  canActivate: [guardRol],
  loadComponent: () => import('./admin/admin').then(m => m.AdminComponent)
},

  {
    path: 'tienda',
    canActivate: [guardRol],
    loadComponent: () => import('./tienda/tienda').then(m => m.TiendaComponent)
  },
//   {
//     path: 'dulces',
//     canActivate: [guardRol],
//     loadComponent: () => import('./dulces/dulces.component').then(m => m.DulcesComponent)
//   },

  {
    path: '**',
    redirectTo: '/autorizacion'
  }
]

