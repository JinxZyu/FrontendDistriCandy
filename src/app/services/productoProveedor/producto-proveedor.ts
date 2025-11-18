import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ProductoProveedor {
  idProductoProveedor?: number;
  precioCompra: number;
  cantidad: number;
  fecha: string;
  estado?: number;
  proveedor?: {
    idProveedor: number;
    nombre: string;
  };
  producto?: {
    idProducto: number;
    nombre: string;
    referencia: string;
  };
}

export interface ProductoProveedorRequest {
  idProducto: number;
  idProveedor: number;
  precioCompra: number;
  cantidad: number;
  fechaCompra: string;
}

export interface VerificarReferenciaResponse {
  existe: boolean;
  producto?: {
    idProducto: number;
    nombre: string;
    referencia: string;
    precioUnitario: number;
    descripcion: string;
    existencia: number;
    fotoProducto?: string;
  };
  mensaje?: string;
  error?: string;
}

export interface RegistrarCompraResponse {
  exito: boolean;
  mensaje?: string;
  error?: string;
  compra?: ProductoProveedor;
}

@Injectable({
  providedIn: 'root'
})
export class ProductoProveedorService {
  private urlBase = 'http://localhost:8093/DistriCandy/productoProveedor';

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    return new HttpHeaders({ 'Content-Type': 'application/json' });
  }

  verificarReferencia(referencia: string): Observable<VerificarReferenciaResponse> {
    return this.http.get<VerificarReferenciaResponse>(
      `${this.urlBase}/verificarReferencia/${referencia}`,
      { headers: this.getHeaders() }
    );
  }

  registrarCompra(request: ProductoProveedorRequest): Observable<RegistrarCompraResponse> {
    return this.http.post<RegistrarCompraResponse>(
      `${this.urlBase}/registrarCompra`,
      request,
      { headers: this.getHeaders() }
    );
  }


  
  obtenerTodas(): Observable<ProductoProveedor[]> {
    return this.http.get<ProductoProveedor[]>(
      `${this.urlBase}/obtenerTodoProveedorProducto`,
      { headers: this.getHeaders() }
    );
  }

  cambiarEstado(id: number): Observable<ProductoProveedor> {
    return this.http.post<ProductoProveedor>(
      `${this.urlBase}/cambiarEstado/${id}`,
      {},
      { headers: this.getHeaders() }
    );
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(
      `${this.urlBase}/eliminarProveedorProducto/${id}`,
      { headers: this.getHeaders() }
    );
  }
}