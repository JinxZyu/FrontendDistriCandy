import { Injectable } from '@angular/core';
import { Observable, switchMap, of } from 'rxjs';

// Importa directamente los servicios
import { OrdenVentaService } from '../ordenVenta/orden-venta';
import { EnvioService } from '../envio/envio';

// Interfaces
export interface OrdenVentaConEnvioRequest {
  ordenVenta: {
    id_cliente: number;
    detalle_ventas: Array<{
      id_producto: number;
      cantidad: number;
      precio: number;
      descuento: number;
    }>;
  };
  direccionEnvio: {
    direccion: string;
    pais: string;
    barrio: string;
    ciudad: string;
    departamento: string;
    informacionAdicional?: string;
  };
}

export interface OrdenVentaConEnvioResponse {
  ordenVenta: any;
  envio: any;
  exito: boolean;
  mensaje: string;
}

@Injectable({
  providedIn: 'root'
})
export class OrdenVentaEnvioService {

  constructor(
    private ordenVentaService: OrdenVentaService, 
    private envioService: EnvioService             
  ) {}

  crearOrdenVentaConEnvio(request: OrdenVentaConEnvioRequest): Observable<OrdenVentaConEnvioResponse> {
    return this.ordenVentaService.crearOrdenVenta(request.ordenVenta).pipe(
      switchMap(ordenCreada => {

        if (ordenCreada.estado === 0) {
          return of({
            ordenVenta: ordenCreada,
            envio: null,
            exito: false,
            mensaje: 'La orden de venta falló, no se creó envío'
          });
        }
        const envioRequest = {
          direccion: request.direccionEnvio.direccion,
          pais: request.direccionEnvio.pais,
          barrio: request.direccionEnvio.barrio,
          ciudad: request.direccionEnvio.ciudad,
          departamento: request.direccionEnvio.departamento,
          informacionAdicional: request.direccionEnvio.informacionAdicional,
          fechaHora: new Date().toISOString(),
          estado: 1,
          idVenta: ordenCreada.idVenta
        };

        return this.envioService.crearEnvio(envioRequest).pipe(
          switchMap(envioCreado => {
            return of({
              ordenVenta: ordenCreada,
              envio: envioCreado,
              exito: true,
              mensaje: 'Orden de venta y envío creados exitosamente'
            });
          })
        );
      })
    );
  }
}