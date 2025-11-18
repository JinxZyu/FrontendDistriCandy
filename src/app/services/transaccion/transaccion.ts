import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface TransaccionRequest {
  id_venta: number;
  id_metodo_pago: number;
  id_tipo_cliente: number;
  franquicia?: string;
  banco?: string;
  tipo_documento?: string;
  identificacion: string;
  valor_tx: number;
}

export interface TransaccionResponse {
  exito: boolean;
  mensaje?: string;
  error?: string;
  transaccion?: any;
}

@Injectable({
  providedIn: 'root'
})
export class TransaccionService {
  private urlBase = 'http://localhost:8093/DistriCandy/transaccion';

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    return new HttpHeaders({ 'Content-Type': 'application/json' });
  }

  procesarTransaccion(request: TransaccionRequest): Observable<TransaccionResponse> {
    return this.http.post<TransaccionResponse>(
      `${this.urlBase}/saveTransaccion`, 
      request, 
      { headers: this.getHeaders() }
    );
  }

  obtenerTransaccionesPorUsuario(idUsuario: number): Observable<any[]> {
    return this.http.get<any[]>(
      `${this.urlBase}/conseguirPorIdUsuario/${idUsuario}`,
      { headers: this.getHeaders() }
    );
  }

  obtenerTransaccion(id: number): Observable<any> {
    return this.http.get<any>(
      `${this.urlBase}/findRecord/${id}`,
      { headers: this.getHeaders() }
    );
  }
}