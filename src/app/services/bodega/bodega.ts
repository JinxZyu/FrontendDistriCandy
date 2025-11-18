import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Bodega {
  idBodega?: number;
  nombre: string;
  direccion: string;
  pais: string;
  ciudad: string;
  barrio: string;
  capacidadMax: number;
  informacionAdicional?: string;
  estado: number;
}

export interface BodegaResponse {
  exito: boolean;
  mensaje: string;
  bodega?: Bodega;
  error?: string;
}

@Injectable({
  providedIn: 'root'
})
export class BodegaService {
  private baseUrl = 'http://localhost:8093/DistriCandy/bodega';

  constructor(private http: HttpClient) {}

  obtenerBodegas(): Observable<Bodega[]> {
    return this.http.get<Bodega[]>(`${this.baseUrl}/obtenerTodasBodegas`);
  }

  crearBodega(bodega: any): Observable<BodegaResponse> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });
  
    const datosParaBackend = {
      nombre: bodega.nombre,
      direccion: bodega.direccion,
      pais: bodega.pais,
      ciudad: bodega.ciudad,
      barrio: bodega.barrio,
      capacidad_max: bodega.capacidadMax,  
      informacion_adicional: bodega.informacionAdicional || '' 
    };
    
    return this.http.post<BodegaResponse>(`${this.baseUrl}/crearBodega`, datosParaBackend, { headers });
  }

  actualizarBodega(id: number, bodega: any): Observable<BodegaResponse> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });
    
  
    const datosParaBackend = {
      nombre: bodega.nombre,
      direccion: bodega.direccion,
      pais: bodega.pais,
      ciudad: bodega.ciudad,
      barrio: bodega.barrio,
      capacidad_max: bodega.capacidadMax, 
      informacion_adicional: bodega.informacionAdicional || '' 
    };
    
    return this.http.post<BodegaResponse>(`${this.baseUrl}/actualizarBodega/${id}`, datosParaBackend, { headers });
  }

  cambiarEstado(id: number): Observable<BodegaResponse> {
    return this.http.post<BodegaResponse>(`${this.baseUrl}/cambiarEstado/${id}`, {});
  }
}