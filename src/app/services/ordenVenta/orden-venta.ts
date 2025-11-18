import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface DetalleVentaRequest {
  id_producto: number;
  cantidad: number;
  precio: number;
  descuento: number;
}

export interface OrdenVentaRequest {
  fecha_orden?: string;
  id_cliente: number;
  detalle_ventas: DetalleVentaRequest[];
}

export interface OrdenVentaResponse {
  idVenta: number;
  fechaOrden: string;
  valorVenta: number;
  valorDescuento: number;
  montoTotal: number;
  estado: number;
  cliente: any;
  detalleVentas: any[];
}

@Injectable({
  providedIn: 'root'
})
export class OrdenVentaService {
  private urlBase = 'http://localhost:8093/DistriCandy/ordenesVenta';

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    return new HttpHeaders({ 'Content-Type': 'application/json' });
  }

  crearOrdenVenta(request: OrdenVentaRequest): Observable<OrdenVentaResponse> {
    return this.http.post<OrdenVentaResponse>(
      this.urlBase, 
      request, 
      { headers: this.getHeaders() }
    );
  }

  obtenerOrdenVenta(id: number): Observable<OrdenVentaResponse> {
    return this.http.get<OrdenVentaResponse>(
      `${this.urlBase}/${id}`,
      { headers: this.getHeaders() }
    );
  }
}