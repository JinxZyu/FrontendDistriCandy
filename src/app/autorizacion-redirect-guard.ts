import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { UsuarioService } from './services/usuario/usuario';

export const autorizacionRedirectGuard: CanActivateFn = (route, state) => {
  const usuarioService = inject(UsuarioService);
  const router = inject(Router);
  if (usuarioService.estaAutenticado()) {
    const rol = usuarioService.obtenerRol();
    
    if (rol === 'admin') {
      console.log('Usuario ya autenticado como admin, redirigiendo a /admin');
      router.navigate(['/admin']);
    } else {
      console.log('Usuario ya autenticado, redirigiendo a /tienda');
      router.navigate(['/tienda']);
    }
    
    return false; 
  }

  console.log('Usuario no autenticado, permitiendo acceso a página de autenticación');
  return true;
};