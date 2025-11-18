import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Franquicia {
  idFranquicia: number;
  nombre: string;
  estado: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class FranquiciaService {
  private urlBase = 'http://localhost:8093/DistriCandy/franquicia';

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    return new HttpHeaders({ 'Content-Type': 'application/json' });
  }

  obtenerTodasFranquicias(): Observable<Franquicia[]> {
    return this.http.get<Franquicia[]>(
      `${this.urlBase}/obtenerTodosFranquicia`,
      { headers: this.getHeaders() }
    );
  }

  obtenerFranquiciasActivas(): Observable<Franquicia[]> {
    return this.http.get<Franquicia[]>(
      `${this.urlBase}/obtenerActivas`,
      { headers: this.getHeaders() }
    );
  }

  obtenerFranquicia(id: number): Observable<Franquicia> {
    return this.http.get<Franquicia>(
      `${this.urlBase}/findRecord/${id}`,
      { headers: this.getHeaders() }
    );
  }
}