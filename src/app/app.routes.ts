import { Routes } from '@angular/router';
import { AdminComponent } from './admin/admin';


export const routes: Routes = [
  { path: '', redirectTo: '/admin', pathMatch: 'full' },
  { path: 'admin', component: AdminComponent }
  // Aquí agregarás más rutas después
];