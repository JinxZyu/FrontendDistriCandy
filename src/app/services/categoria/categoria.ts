import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Categoria {
  idCategoria?: number;
  nombre: string;
  descripcion?: string;
  estado?: number;
}

export interface CategoriaRequest {
  nombre: string;
  descripcion?: string;
}

export interface RespuestaCategoria {
  success?: boolean;
  exito?: boolean;
  mensaje?: string;
  error?: string;
  message?: string;
  categoria?: Categoria;
}

@Injectable({
  providedIn: 'root'
})
export class CategoriaService {
  private urlBase = 'http://localhost:8093/DistriCandy/categoria';

  constructor(private http: HttpClient) {}

  obtenerTodas(): Observable<Categoria[]> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.get<Categoria[]>(`${this.urlBase}/obtenerTodasCategorias`, { headers });
  }

  obtenerActivas(): Observable<Categoria[]> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.get<Categoria[]>(`${this.urlBase}/obtenerActivas`, { headers });
  }

  crearCategoria(categoria: CategoriaRequest): Observable<Categoria> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post<Categoria>(`${this.urlBase}/crearCategoria`, categoria, { headers });
  }

  cambiarEstado(id: number): Observable<Categoria> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post<Categoria>(`${this.urlBase}/cambiarEstado/${id}`, {}, { headers });
  }

  obtenerPorId(id: number): Observable<Categoria> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.get<Categoria>(`${this.urlBase}/findRecord/${id}`, { headers });
  }

  eliminarCategoria(id: number): Observable<RespuestaCategoria> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.delete<RespuestaCategoria>(`${this.urlBase}/eliminarCategoria/${id}`, { headers });
  }
}