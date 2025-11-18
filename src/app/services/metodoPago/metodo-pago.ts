import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface MetodoPago {
  idMetodoPago: number;
  nombre: string;
  descripcion?: string;
  activo?: boolean;
}

export interface MetodoPagoRequest {
  nombre: string;
  descripcion?: string;
  activo?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class MetodoPagoService {
  private urlBase = 'http://localhost:8093/DistriCandy/metodoPago';

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    return new HttpHeaders({ 'Content-Type': 'application/json' });
  }

  obtenerMetodosPago(): Observable<MetodoPago[]> {
    return this.http.get<MetodoPago[]>(
      `${this.urlBase}/obtenerTodosMetodo`,
      { headers: this.getHeaders() }
    );
  }

  obtenerMetodoPagoPorId(id: number): Observable<MetodoPago> {
    return this.http.get<MetodoPago>(
      `${this.urlBase}/findRecord/${id}`,
      { headers: this.getHeaders() }
    );
  }

  crearMetodoPago(request: MetodoPagoRequest): Observable<MetodoPago> {
    return this.http.post<MetodoPago>(
      `${this.urlBase}/crearMetodoPago`,
      request,
      { headers: this.getHeaders() }
    );
  }

  eliminarMetodoPago(id: number): Observable<MetodoPago> {
    return this.http.delete<MetodoPago>(
      `${this.urlBase}/eliminarMetodoPago/${id}`,
      { headers: this.getHeaders() }
    );
  }
}