import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Inventario {
  idInventario: number;
  cantidadDisponible: number;
  stockMinimo: number;
  stockMaximo: number;
  producto: any;
  bodega: any;
}

@Injectable({
  providedIn: 'root'
})
export class InventarioService {
  private baseUrl = 'http://localhost:8093/DistriCandy/inventario';

  constructor(private http: HttpClient) {}

  obtenerTodoInventario(): Observable<Inventario[]> {
    return this.http.get<Inventario[]>(`${this.baseUrl}/obtenerTodoInventario`);
  }

  obtenerInventarioPorProducto(idProducto: number): Observable<Inventario[]> {
    return this.http.get<Inventario[]>(`${this.baseUrl}/porProducto/${idProducto}`);
  }

  obtenerStockNoDistribuido(idProducto: number): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/stockNoDistribuido/${idProducto}`);
  }

  crearInventario(inventario: any): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });
    return this.http.post<any>(`${this.baseUrl}/crearInventario`, inventario, { headers });
  }

  actualizarStock(idInventario: number, nuevaCantidad: number): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });
    return this.http.post<any>(`${this.baseUrl}/actualizarStock/${idInventario}`, { nuevaCantidad }, { headers });
  }

  distribuirStock(idProducto: number): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/distribuirStock/${idProducto}`, {});
  }

  verificarExistencia(idProducto: number, idBodega: number): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/verificarExistencia?idProducto=${idProducto}&idBodega=${idBodega}`);
  }
}