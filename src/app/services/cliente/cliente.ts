// cliente.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ClienteResponse {
  idCliente: number;
  pais: string;
  direccion: string;
  ciudad: string;
  barrio: string;
  departamento: string;
  informacionAdicional: string;
  estado: number;
  usuario: any;
}

@Injectable({
  providedIn: 'root'
})
export class ClienteService {
  private urlBase = 'http://localhost:8093/DistriCandy/cliente';

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    return new HttpHeaders({ 'Content-Type': 'application/json' });
  }

  obtenerClientePorUsuario(idUsuario: number): Observable<ClienteResponse> {
    return this.http.get<ClienteResponse>(
      `${this.urlBase}/usuario/${idUsuario}`,
      { headers: this.getHeaders() }
    );
  }

  obtenerClientePorId(idCliente: number): Observable<ClienteResponse> {
    return this.http.get<ClienteResponse>(
      `${this.urlBase}/${idCliente}`,
      { headers: this.getHeaders() }
    );
  }
}