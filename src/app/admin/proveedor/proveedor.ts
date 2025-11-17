import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProveedorService, Proveedor } from '../../services/proveedor/proveedor';

@Component({
  selector: 'app-proveedor',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './proveedor.html',
  styleUrls: ['./proveedor.css']
})
export class ProveedorComponent implements OnInit {
  proveedores: Proveedor[] = [];
  proveedorActual: any = {
    nit: '',
    nombre: '',
    celular: '',
    correo: '',
    direccion: '',
    estado: 1
  };
  mostrarFormulario = false;
  esEdicion = false;
  mensaje = '';
  tipoMensaje = '';
  cargando = true;

  constructor(private proveedorService: ProveedorService) {}

  ngOnInit(): void {
    this.cargarProveedores();
  }

  cargarProveedores(): void {
    this.cargando = true;
    this.proveedorService.obtenerProveedores().subscribe({
      next: (data: Proveedor[]) => {
        this.proveedores = data || [];
        this.cargando = false;
      },
      error: (error: any) => {
        this.mostrarMensaje('Error al cargar proveedores', 'error');
        this.proveedores = [];
        this.cargando = false;
        console.error('Error:', error);
      }
    });
  }

  abrirFormularioCrear(): void {
    this.proveedorActual = {
      nit: '',
      nombre: '',
      celular: '',
      correo: '',
      direccion: '',
      estado: 1
    };
    this.esEdicion = false;
    this.mostrarFormulario = true;
  }

  abrirFormularioEditar(proveedor: Proveedor): void {
    this.proveedorActual = { ...proveedor };
    this.esEdicion = true;
    this.mostrarFormulario = true;
  }

  cerrarFormulario(): void {
    this.mostrarFormulario = false;
    this.proveedorActual = {
      nit: '',
      nombre: '',
      celular: '',
      correo: '',
      direccion: '',
      estado: 1
    };
  }

  crearProveedor(): void {
    this.proveedorService.crearProveedor(this.proveedorActual).subscribe({
      next: (proveedorCreado: Proveedor) => {
        this.proveedores.push(proveedorCreado);
        this.mostrarMensaje('Proveedor creado exitosamente', 'success');
        this.cerrarFormulario();
      },
      error: (error: any) => {
        this.mostrarMensaje(error.error?.message || 'Error al crear proveedor', 'error');
        console.error('Error:', error);
      }
    });
  }

  actualizarProveedor(): void {
    if (this.proveedorActual.id) {
      this.proveedorService.actualizarProveedor(this.proveedorActual.id, this.proveedorActual).subscribe({
        next: (proveedorActualizado: Proveedor) => {
          const index = this.proveedores.findIndex(p => p.id === proveedorActualizado.id);
          if (index !== -1) {
            this.proveedores[index] = proveedorActualizado;
          }
          this.mostrarMensaje('Proveedor actualizado exitosamente', 'success');
          this.cerrarFormulario();
        },
        error: (error: any) => {
          this.mostrarMensaje('Error al actualizar proveedor', 'error');
          console.error('Error:', error);
        }
      });
    }
  }

  cambiarEstadoProveedor(id: number): void {
    this.proveedorService.cambiarEstado(id).subscribe({
      next: (proveedorActualizado: Proveedor) => {
        const index = this.proveedores.findIndex(p => p.id === proveedorActualizado.id);
        if (index !== -1) {
          this.proveedores[index] = proveedorActualizado;
        }
        this.mostrarMensaje('Estado del proveedor cambiado exitosamente', 'success');
      },
      error: (error: any) => {
        this.mostrarMensaje('Error al cambiar estado del proveedor', 'error');
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

  getEstadoTexto(estado: number): string {
    return estado === 1 ? 'Activo' : 'Inactivo';
  }

  getEstadoClase(estado: number): string {
    return estado === 1 ? 'estado-activo' : 'estado-inactivo';
  }
}