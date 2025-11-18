import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators'; // Importar map

export interface Proveedor {
  idProveedor: number;  // Hacer obligatorio
  id?: number;          // Mantener por compatibilidad
  nit: string;
  nombre: string;
  celular: string;
  correo: string;
  direccion: string;
  estado: number;
}

export interface ProveedorRequest {
  nit: string;
  nombre: string;
  celular: string;
  correo: string;
  direccion: string;
  estado: number;
}

@Injectable({
  providedIn: 'root'
})
export class ProveedorService {
  private baseUrl = 'http://localhost:8093/DistriCandy/proveedor';

  constructor(private http: HttpClient) {}


  obtenerProveedores(): Observable<Proveedor[]> {
    return this.http.get<Proveedor[]>(`${this.baseUrl}/obtenerTodasProveedor`).pipe(
      map(proveedores => proveedores.map(prov => ({
        ...prov,
        // Asegurar que idProveedor tenga el valor correcto
        idProveedor: prov.idProveedor || prov.id || 0
      })))
    );
  }


  crearProveedor(proveedor: ProveedorRequest): Observable<Proveedor> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });
    return this.http.post<Proveedor>(`${this.baseUrl}/crearProveedor`, proveedor, { headers });
  }

  actualizarProveedor(id: number, proveedor: Proveedor): Observable<Proveedor> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });
    return this.http.put<Proveedor>(`${this.baseUrl}/actualizar/${id}`, proveedor, { headers });
  }
  

  cambiarEstado(id: number): Observable<Proveedor> {
    return this.http.post<Proveedor>(`${this.baseUrl}/cambiarEstado/${id}`, {});
  }
}