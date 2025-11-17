import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Proveedor {
  id?: number;
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

  // Obtener todos los proveedores
  obtenerProveedores(): Observable<Proveedor[]> {
    return this.http.get<Proveedor[]>(`${this.baseUrl}/getAll`);
  }

  // Crear proveedor
  crearProveedor(proveedor: ProveedorRequest): Observable<Proveedor> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });
    return this.http.post<Proveedor>(`${this.baseUrl}/crearProveedor`, proveedor, { headers });
  }

  // Actualizar proveedor
  actualizarProveedor(id: number, proveedor: Proveedor): Observable<Proveedor> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });
    return this.http.put<Proveedor>(`${this.baseUrl}/update/${id}`, proveedor, { headers });
  }



  // Cambiar estado del proveedor
  cambiarEstado(id: number): Observable<Proveedor> {
    return this.http.post<Proveedor>(`${this.baseUrl}/cambiarEstado/${id}`, {});
  }
}