import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InventarioService, Inventario } from '../../services/inventario/inventario';

@Component({
  selector: 'app-inventario',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './inventario.html',
  styleUrls: ['./inventario.css']
})
export class InventarioComponent implements OnInit {
  inventarios: Inventario[] = [];
  cargando = true;
  mensaje = '';
  tipoMensaje = '';

  constructor(private inventarioService: InventarioService) {}

  ngOnInit(): void {
    this.cargarInventarios();
  }

  cargarInventarios(): void {
    this.cargando = true;
    this.inventarioService.obtenerTodoInventario().subscribe({
      next: (data: Inventario[]) => {
        this.inventarios = data || [];
        this.cargando = false;
      },
      error: (error: any) => {
        this.mostrarMensaje('Error al cargar el inventario', 'error');
        this.inventarios = [];
        this.cargando = false;
        console.error('Error:', error);
      }
    });
  }

  private mostrarMensaje(mensaje: string, tipo: 'success' | 'error'): void {
    this.mensaje = mensaje;
    this.tipoMensaje = tipo;
    setTimeout(() => {
      this.mensaje = '';
    }, 5000);
  }

  getNombreProducto(inventario: Inventario): string {
    return inventario.producto?.nombre || 'N/A';
  }

  getNombreBodega(inventario: Inventario): string {
    return inventario.bodega?.nombre || 'N/A';
  }

  getEstadoStock(inventario: Inventario): string {
    const disponible = inventario.cantidadDisponible || 0;
    const minimo = inventario.stockMinimo || 0;
    
    if (disponible <= minimo) {
      return 'Bajo';
    } else if (disponible <= minimo * 1.5) {
      return 'Medio';
    } else {
      return 'Óptimo';
    }
  }

  getEstadoClase(inventario: Inventario): string {
    const estado = this.getEstadoStock(inventario);
    switch (estado) {
      case 'Bajo': return 'estado-bajo';
      case 'Medio': return 'estado-medio';
      case 'Óptimo': return 'estado-optimo';
      default: return 'estado-optimo';
    }
  }
  getTotalStockBajo(): number {
  return this.inventarios.filter(inv => this.getEstadoStock(inv) === 'Bajo').length;
}

getTotalStockOptimo(): number {
  return this.inventarios.filter(inv => this.getEstadoStock(inv) === 'Óptimo').length;
}

getPorcentajeStock(inventario: Inventario): number {
  const disponible = inventario.cantidadDisponible || 0;
  const maximo = inventario.stockMaximo || 1;
  return Math.min(100, Math.round((disponible / maximo) * 100));
}
}