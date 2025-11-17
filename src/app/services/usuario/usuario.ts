import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Usuario, TipoUsuario, CredencialesLogin, RespuestaLogin } from '../../models/usuario.model';

@Injectable({
  providedIn: 'root',
})
export class UsuarioService {
  private urlApi = 'http://localhost:8093/DistriCandy/usuario/iniciarSesion';
  private claveToken = 'auth_token';
  private claveUsuario = 'auth_user';

  constructor(private http: HttpClient) {}

  iniciarSesion(credenciales: CredencialesLogin): Observable<RespuestaLogin> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    return this.http.post<RespuestaLogin>(this.urlApi, credenciales, { headers }).pipe(
      tap((respuesta) => {
        if (respuesta.exito && respuesta.usuario) {
          // ✅ Guardar token (en el futuro debería ser JWT real)
          if (respuesta.isAdmin === true) {
            localStorage.setItem(this.claveToken, 'admin-token');
          } else {
            localStorage.setItem(this.claveToken, 'user-token');
          }
          
          // ✅ Guardar usuario (estructura consistente para admin y usuario)
          localStorage.setItem(this.claveUsuario, JSON.stringify(respuesta.usuario));
        }
      })
    );
  }

  cerrarSesion(): void {
    localStorage.removeItem(this.claveToken);
    localStorage.removeItem(this.claveUsuario);
  }

  obtenerToken(): string | null {
    return localStorage.getItem(this.claveToken);
  }

  obtenerUsuario(): Usuario | null {
    const datosGuardados = localStorage.getItem(this.claveUsuario);
    
    if (!datosGuardados || datosGuardados === 'undefined') {
      return null;
    }
    
    try {
      return JSON.parse(datosGuardados) as Usuario;
    } catch (error) {
      console.error('Error al parsear datos de usuario:', error);
      return null;
    }
  }

  obtenerRol(): 'admin' | 'usuario' | null {
    const usuario = this.obtenerUsuario();
    
    if (!usuario) {
      return null;
    }

    // ✅ Verificar usando el tipo_usuario (número)
    if (usuario.tipo_usuario === TipoUsuario.ADMIN) {
      return 'admin';
    }

    if (usuario.tipo_usuario === TipoUsuario.USUARIO) {
      return 'usuario';
    }

    return null;
  }

  estaAutenticado(): boolean {
    const token = this.obtenerToken();
    const usuario = this.obtenerUsuario();
    return !!(token && usuario);
  }

  // Métodos auxiliares
  esAdmin(): boolean {
    return this.obtenerRol() === 'admin';
  }

  esUsuario(): boolean {
    return this.obtenerRol() === 'usuario';
  }

  obtenerId(): number | null {
    const usuario = this.obtenerUsuario();
    return usuario ? usuario.id_usuario : null;
  }

  obtenerCorreo(): string | null {
    const usuario = this.obtenerUsuario();
    return usuario ? usuario.correo : null;
  }

  obtenerNombre(): string | null {
    const usuario = this.obtenerUsuario();
    return usuario ? usuario.nombre_completo : null;
  }
}