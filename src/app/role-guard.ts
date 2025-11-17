import { inject } from '@angular/core';
import { CanActivateFn, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { UsuarioService } from './services/usuario/usuario';  

export const guardRol: CanActivateFn = (
  ruta: ActivatedRouteSnapshot, 
  estado: RouterStateSnapshot
): boolean => {
  const usuarioService = inject(UsuarioService); 
  const router = inject(Router);

  const estaAutenticado = usuarioService.estaAutenticado();
  console.log('GuardRol - estaAutenticado:', estaAutenticado);
  
  if (!estaAutenticado) {
    router.navigate(['/autorizacion']);
    return false;
  }

  const rol = usuarioService.obtenerRol();
  const urlActual = estado.url;

  // Verificar rutas de admin
  if (urlActual.startsWith('/admin')) {
    if (rol !== 'admin') {
      console.log('No es admin, redirigiendo a tienda');
      router.navigate(['/tienda']);
      return false;
    }
    console.log('Es admin, permitiendo acceso');
    return true;
  }

  if (
    urlActual.startsWith('/dulces') || 
    urlActual.startsWith('/tienda') || 
    urlActual.startsWith('/transaccion') || 
    urlActual.startsWith('/mi-cuenta') || 
    urlActual.startsWith('/mis-transacciones')
  ) {
    if (rol === 'admin') {
      console.log('Es admin intentando ir a usuario, redirigiendo a admin');
      router.navigate(['/admin']);
      return false;
    }
    console.log('Es usuario normal, permitiendo acceso');
    return true;
  }

  console.log('Ruta sin restricciones, permitiendo acceso');
  return true;
};