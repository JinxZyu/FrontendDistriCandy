import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ActualizarPerfilRequest {
  id_usuario: number;
  nombre: string;
  apellido: string;
  celular: string;
  username?: string;
}

export interface ActualizarClienteRequest {
  id_usuario: number;
  pais?: string;
  departamento?: string;
  ciudad?: string;
  barrio?: string;
  direccion?: string;
   informacion_adicional?:string;

}

export interface CambiarClaveRequest {
  correo_usuario: string;
  clave_actual: string;
  nueva_clave: string;
}

export interface RespuestaCambioClave {
  exito: boolean;
  mensaje?: string;
  error?: string;
}

export interface RespuestaActualizacion {
  exito: boolean;
  mensaje?: string;
  error?: string;
  usuario?: any;
}

export interface PerfilCompleto {
  exito: boolean;
  perfil?: {
    id_usuario: number;
    username: string;
    correo_usuario: string;
    nombre: string;
    apellido: string;
    celular: string;
    tipo_documento: string;
    identificacion: string;
    id_cliente: number;
    pais?: string;
    departamento?: string;
    ciudad?: string;
    barrio?: string;
    direccion?: string;
    informacion_adicional?:string;
  };
  error?: string;
}

@Injectable({
  providedIn: 'root'
})
export class PerfilService {
  private urlBase = 'http://localhost:8093/DistriCandy/usuario';

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Content-Type': 'application/json'
    });
  }

  obtenerPerfilCompleto(idUsuario: number): Observable<PerfilCompleto> {
    return this.http.get<PerfilCompleto>(
      `${this.urlBase}/perfil/${idUsuario}`, 
      { headers: this.getHeaders() }
    );
  }

  actualizarPerfil(datos: ActualizarPerfilRequest): Observable<RespuestaActualizacion> {
    return this.http.post<RespuestaActualizacion>(
      `${this.urlBase}/actualizarPerfil`, 
      datos, 
      { headers: this.getHeaders() }
    );
  }

  cambiarClave(datos: CambiarClaveRequest): Observable<RespuestaCambioClave> {
    return this.http.post<RespuestaCambioClave>(
      `${this.urlBase}/cambiarClave`, 
      datos, 
      { headers: this.getHeaders() }
    );
  }

  actualizarDatosCliente(datos: ActualizarClienteRequest): Observable<RespuestaActualizacion> {
    return this.http.post<RespuestaActualizacion>(
      `${this.urlBase}/actualizarCliente`, 
      datos, 
      { headers: this.getHeaders() }
    );
  }
}