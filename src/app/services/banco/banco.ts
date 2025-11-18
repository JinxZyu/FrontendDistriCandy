import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Banco {
  idBanco: number;
  nombre: string;
  estado: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class BancoService {
  private urlBase = 'http://localhost:8093/DistriCandy/banco';

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    return new HttpHeaders({ 'Content-Type': 'application/json' });
  }

  obtenerTodosBancos(): Observable<Banco[]> {
    return this.http.get<Banco[]>(
      `${this.urlBase}/obtenerTodosBanco`,
      { headers: this.getHeaders() }
    );
  }

  obtenerBancosActivos(): Observable<Banco[]> {
    return this.http.get<Banco[]>(
      `${this.urlBase}/obtenerctivos`,
      { headers: this.getHeaders() }
    );
  }

  obtenerBanco(id: number): Observable<Banco> {
    return this.http.get<Banco>(
      `${this.urlBase}/findRecord/${id}`,
      { headers: this.getHeaders() }
    );
  }
}