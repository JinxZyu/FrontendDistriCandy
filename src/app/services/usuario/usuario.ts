import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Usuario, TipoUsuario, CredencialesLogin, RespuestaLogin } from '../../models/usuario.model';

interface SolicitudCodigo {
  correo: string;
}

interface RespuestaRecuperacion {
  exito: boolean;
  mensaje?: string;
  error?: string;
}

interface RestablecerContrasena {
  correo: string;
  codigo: string;
  nueva_clave: string;
}

@Injectable({
  providedIn: 'root',
})
export class UsuarioService {
  private urlBase = 'http://localhost:8093/DistriCandy/usuario';
  private claveToken = 'auth_token';
  private claveUsuario = 'auth_user';

  constructor(private http: HttpClient) {}


  iniciarSesion(credenciales: CredencialesLogin): Observable<RespuestaLogin> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    return this.http.post<RespuestaLogin>(`${this.urlBase}/iniciarSesion`, credenciales, { headers }).pipe(
      tap((respuesta) => {
        if (respuesta.exito && respuesta.usuario) {

          if (respuesta.isAdmin === true) {
            localStorage.setItem(this.claveToken, 'admin-token');
          } else {
            localStorage.setItem(this.claveToken, 'user-token');
          }
  
          localStorage.setItem(this.claveUsuario, JSON.stringify(respuesta.usuario));
        }
      })
    );
  }

  registrarCliente(datos: any): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    return this.http.post<any>(`${this.urlBase}/registro`, datos, { headers });
  }

  cerrarSesion(): void {
    localStorage.removeItem(this.claveToken);
    localStorage.removeItem(this.claveUsuario);
  }


  solicitarCodigoRecuperacion(correo: string): Observable<RespuestaRecuperacion> {
    const body: SolicitudCodigo = { correo };
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    return this.http.post<RespuestaRecuperacion>(`${this.urlBase}/recuperarClave`, body, { headers });
  }

  restablecerContrasena(correo: string, codigo: string, nuevaClave: string): Observable<RespuestaRecuperacion> {
    const body: RestablecerContrasena = {
      correo,
      codigo,
      nueva_clave: nuevaClave
    };
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    return this.http.post<RespuestaRecuperacion>(`${this.urlBase}/reestablecerClave`, body, { headers });
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

actualizarDatosLocalStorage(usuario: any): void {
  const usuarioActual = this.obtenerUsuario();
  if (usuarioActual) {
    const usuarioActualizado: Usuario = {
      ...usuarioActual,
      nombre: usuario.nombre || usuarioActual.nombre,
      apellido: usuario.apellido || usuarioActual.apellido,
      nombre_completo: usuario.nombre_completo || usuarioActual.nombre_completo,
      username: usuario.username || usuarioActual.username,
      celular: usuario.celular || usuarioActual.celular
    };
    localStorage.setItem('usuario', JSON.stringify(usuarioActualizado));
  }
}

  obtenerRol(): 'admin' | 'usuario' | null {
    const usuario = this.obtenerUsuario();
    
    if (!usuario) {
      return null;
    }


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