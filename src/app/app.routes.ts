import { Routes } from '@angular/router';
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


//   {
//     path: 'login',
//     canActivate: [autorizacionRedirectGuard],
//     loadComponent: () => import('./login/login.component').then(m => m.LoginComponent)
//   },
//   {
//     path: 'registro',
//     canActivate: [autorizacionRedirectGuard],
//     loadComponent: () => import('./registro/registro.component').then(m => m.RegistroComponent)
//   },

//   {
//     path: 'admin',
//     canActivate: [guardRol],
//     loadComponent: () => import('./admin/admin.component').then(m => m.AdminComponent)
//   },
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