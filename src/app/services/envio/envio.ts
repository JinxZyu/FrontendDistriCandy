// envio.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface EnvioRequest {
  numeroGuia?: string;
  direccion: string;
  pais: string;
  barrio: string;
  ciudad: string;
  departamento: string;
  informacionAdicional?: string;
  fechaHora?: string;
  estado?: number;
  idVenta: number;
}

export interface EnvioResponse {
  idEnvio: number;
  numeroGuia: string;
  direccion: string;
  pais: string;
  barrio: string;
  ciudad: string;
  departamento: string;
  informacionAdicional: string;
  fechaHora: string;
  estado: number;
  venta: {
    idVenta: number;
    estado: number;
  };
}

@Injectable({
  providedIn: 'root'
})
export class EnvioService {
  private urlBase = 'http://localhost:8093/DistriCandy/envio';

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    return new HttpHeaders({ 'Content-Type': 'application/json' });
  }

  generarNumeroGuia(): string {
    const timestamp = new Date().getTime();
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `DISTRI${timestamp}${random}`;
  }

  crearEnvio(request: EnvioRequest): Observable<EnvioResponse> {
    // Si no viene número de guía, generarlo automáticamente
    const envioData = {
      ...request,
      numeroGuia: request.numeroGuia || this.generarNumeroGuia()
    };

    return this.http.post<EnvioResponse>(
      `${this.urlBase}/crearEnvio`,
      envioData,
      { headers: this.getHeaders() }
    );
  }

  obtenerEnvioPorNumeroGuia(numeroGuia: string): Observable<EnvioResponse> {
    return this.http.get<EnvioResponse>(
      `${this.urlBase}/guia?numeroGuia=${numeroGuia}`,
      { headers: this.getHeaders() }
    );
  }

  eliminarEnvio(idEnvio: number): Observable<void> {
    return this.http.delete<void>(
      `${this.urlBase}/eliminarEnvio/${idEnvio}`,
      { headers: this.getHeaders() }
    );
  }

  obtenerTodosEnvios(): Observable<EnvioResponse[]> {
    return this.http.get<EnvioResponse[]>(
      `${this.urlBase}/obtenerTodosEnvio`,
      { headers: this.getHeaders() }
    );
  }

  obtenerEnviosPorVenta(idVenta: number): Observable<EnvioResponse[]> {
    // Esto asumiendo que tu backend tiene un endpoint para esto
    return this.http.get<EnvioResponse[]>(
      `${this.urlBase}/venta/${idVenta}`,
      { headers: this.getHeaders() }
    );
  }
}