import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface ProductoBackend {
  idProducto?: number;
  nombre: string;
  referencia: string;
  descripcion: string;
  precioUnitario: number;
  valorDescuento?: number;
  existencia: number;
  fotoProducto?: string;
  estado?: number;
  categorias?: CategoriaBackend[];  
}

export interface CategoriaBackend {
  idCategoria: number;
  nombre: string;
  descripcion?: string;
}

export interface Producto {
  idProducto?: number;
  nombre: string;
  referencia: string;
  descripcion: string;
  precioUnitario: number;
  valorDescuento?: number;
  existencia: number;
  imagen?: string;
  estado?: number;
  categoria?: {  
    idCategoria: number;
    nombre: string;
  };
  categorias?: CategoriaBackend[];  
  descuento?: number;
}

export interface ProductoRequest {
  nombre: string;
  referencia: string;
  descripcion: string;
  precioUnitario: number;
  existencia: number;
  idsCategorias: number[]; 
  fotoProducto?: string;
}

export interface RespuestaProducto {
  success?: boolean;
  exito?: boolean;
  mensaje?: string;
  error?: string;
  producto?: Producto;
}

@Injectable({
  providedIn: 'root'
})
export class ProductoService {
  private urlBase = 'http://localhost:8093/DistriCandy/producto';

  constructor(private http: HttpClient) {}

  obtenerTodos(): Observable<Producto[]> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.get<ProductoBackend[]>(`${this.urlBase}/obtenerTodoProducto`, { headers })
      .pipe(
        map(productos => productos.map(p => this.mapearProducto(p)))
      );
  }

  private getHeaders(): HttpHeaders {
    return new HttpHeaders({ 'Content-Type': 'application/json' });
  }

  private mapearProducto(productoBackend: ProductoBackend): Producto {
    return {
      idProducto: productoBackend.idProducto,
      nombre: productoBackend.nombre,
      referencia: productoBackend.referencia,
      descripcion: productoBackend.descripcion,
      precioUnitario: productoBackend.precioUnitario,
      valorDescuento: productoBackend.valorDescuento,
      existencia: productoBackend.existencia,
      estado: productoBackend.estado,
      imagen: productoBackend.fotoProducto,
      
      categoria: productoBackend.categorias && productoBackend.categorias.length > 0 
        ? {
            idCategoria: productoBackend.categorias[0].idCategoria,
            nombre: productoBackend.categorias[0].nombre
          }
        : undefined,
      categorias: productoBackend.categorias,
      
      descuento: productoBackend.valorDescuento && productoBackend.precioUnitario
        ? Math.round(((productoBackend.precioUnitario - productoBackend.valorDescuento) / productoBackend.precioUnitario) * 100)
        : 0
    };
  }

  buscarPorNombre(nombre: string): Observable<Producto> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.get<ProductoBackend>(`${this.urlBase}/nombre`, { 
      params: { nombre },
      headers 
    }).pipe(
      map(p => this.mapearProducto(p))
    );
  }

   actualizarProducto(id: number, producto: ProductoRequest): Observable<Producto> {
    return this.http.put<ProductoBackend>(`${this.urlBase}/actualizarProducto/${id}`, producto, {
      headers: this.getHeaders()
    }).pipe(
      map(p => this.mapearProducto(p))
    );
  }

  verificarReferencia(referencia: string): Observable<any> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.get<any>(`${this.urlBase}/verificarReferencia/${referencia}`, { headers });
  }

  crearProducto(producto: ProductoRequest): Observable<RespuestaProducto> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post<RespuestaProducto>(`${this.urlBase}/crearProducto`, producto, { headers });
  }

  eliminarProducto(id: number): Observable<void> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.delete<void>(`${this.urlBase}/eliminarProducto/${id}`, { headers });
  }

  cambiarEstado(id: number): Observable<Producto> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post<ProductoBackend>(`${this.urlBase}/cambiarEstado/${id}`, {}, { headers })
      .pipe(
        map(p => this.mapearProducto(p))
      );
  }

  obtenerProductosActivos(): Observable<Producto[]> {
    return this.obtenerTodos().pipe(
      map(productos => productos.filter(p => p.estado === 1))
    );
  }

  obtenerPorCategoria(idCategoria: number): Observable<Producto[]> {
    return this.obtenerTodos().pipe(
      map(productos => productos.filter(p => {
        return p.categorias?.some(cat => cat.idCategoria === idCategoria) && p.estado === 1;
      }))
    );
  }

}