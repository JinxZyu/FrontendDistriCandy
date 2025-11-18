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

  // Variables para manejar errores de validación
  erroresValidacion: any = {};

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
    this.limpiarErrores();
  }

  abrirFormularioEditar(proveedor: Proveedor): void {
    this.proveedorActual = { ...proveedor };
    this.esEdicion = true;
    this.mostrarFormulario = true;
    this.limpiarErrores();
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
    this.limpiarErrores();
  }

  // Métodos de validación
  validarNit(nit: string): boolean {
    // Solo permite números y máximo 10 dígitos
    const nitRegex = /^[0-9]{1,10}$/;
    return nitRegex.test(nit);
  }

  validarNombre(nombre: string): boolean {
    // Solo permite letras, espacios y algunos caracteres especiales comunes en nombres
    const nombreRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s\-\.]+$/;
    return nombreRegex.test(nombre);
  }

  validarCelular(celular: string): boolean {
    // Solo permite números, máximo 10 dígitos, opcionalmente puede estar vacío
    if (!celular) return true;
    const celularRegex = /^[0-9]{1,10}$/;
    return celularRegex.test(celular);
  }

  validarCorreo(correo: string): boolean {
    // Validación básica de email que requiere @ y .
    const correoRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return correoRegex.test(correo);
  }

  validarDireccion(direccion: string): boolean {
    // Permite letras, números, espacios y caracteres comunes en direcciones
    const direccionRegex = /^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑüÜ\s\-\#\,\.\°]+$/;
    return direccionRegex.test(direccion);
  }

  // Validar si el formulario está completo
  formularioCompleto(): boolean {
    return !!(
      this.proveedorActual.nit &&
      this.proveedorActual.nombre &&
      this.proveedorActual.correo &&
      this.proveedorActual.nit.trim() !== '' &&
      this.proveedorActual.nombre.trim() !== '' &&
      this.proveedorActual.correo.trim() !== ''
    );
  }

  // Verificar si hay errores de validación
  tieneErrores(): boolean {
    return Object.keys(this.erroresValidacion).length > 0;
  }

  // Validar formulario completo con todas las reglas
  validarFormulario(): boolean {
    this.limpiarErrores();
    let esValido = true;

    // Validar NIT
    if (!this.proveedorActual.nit) {
      this.erroresValidacion.nit = 'El NIT es requerido';
      esValido = false;
    } else if (!this.validarNit(this.proveedorActual.nit)) {
      this.erroresValidacion.nit = 'El NIT solo puede contener números (máximo 10 dígitos)';
      esValido = false;
    }

    // Validar Nombre
    if (!this.proveedorActual.nombre) {
      this.erroresValidacion.nombre = 'El nombre es requerido';
      esValido = false;
    } else if (!this.validarNombre(this.proveedorActual.nombre)) {
      this.erroresValidacion.nombre = 'El nombre solo puede contener letras, espacios y guiones';
      esValido = false;
    }

    // Validar Celular
    if (this.proveedorActual.celular && !this.validarCelular(this.proveedorActual.celular)) {
      this.erroresValidacion.celular = 'El celular solo puede contener números (máximo 10 dígitos)';
      esValido = false;
    }

    // Validar Correo
    if (!this.proveedorActual.correo) {
      this.erroresValidacion.correo = 'El correo es requerido';
      esValido = false;
    } else if (!this.validarCorreo(this.proveedorActual.correo)) {
      this.erroresValidacion.correo = 'El correo debe tener un formato válido (ejemplo@dominio.com)';
      esValido = false;
    }

    // Validar Dirección
    if (this.proveedorActual.direccion && !this.validarDireccion(this.proveedorActual.direccion)) {
      this.erroresValidacion.direccion = 'La dirección contiene caracteres no permitidos';
      esValido = false;
    }

    return esValido;
  }

  limpiarErrores(): void {
    this.erroresValidacion = {};
  }

  // Método para validar en tiempo real mientras el usuario escribe
  validarCampo(campo: string, valor: string): void {
    switch (campo) {
      case 'nit':
        if (valor && !this.validarNit(valor)) {
          this.erroresValidacion.nit = 'El NIT solo puede contener números (máximo 10 dígitos)';
        } else {
          delete this.erroresValidacion.nit;
        }
        break;
      case 'celular':
        if (valor && !this.validarCelular(valor)) {
          this.erroresValidacion.celular = 'El celular solo puede contener números (máximo 10 dígitos)';
        } else {
          delete this.erroresValidacion.celular;
        }
        break;
      case 'nombre':
        if (valor && !this.validarNombre(valor)) {
          this.erroresValidacion.nombre = 'El nombre solo puede contener letras, espacios y guiones';
        } else {
          delete this.erroresValidacion.nombre;
        }
        break;
      case 'correo':
        if (valor && !this.validarCorreo(valor)) {
          this.erroresValidacion.correo = 'El correo debe tener un formato válido (ejemplo@dominio.com)';
        } else {
          delete this.erroresValidacion.correo;
        }
        break;
      case 'direccion':
        if (valor && !this.validarDireccion(valor)) {
          this.erroresValidacion.direccion = 'La dirección contiene caracteres no permitidos';
        } else {
          delete this.erroresValidacion.direccion;
        }
        break;
    }
  }

  crearProveedor(): void {
    if (!this.validarFormulario()) {
      this.mostrarMensaje('Por favor corrige los errores en el formulario', 'error');
      return;
    }

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
    if (!this.validarFormulario()) {
      this.mostrarMensaje('Por favor corrige los errores en el formulario', 'error');
      return;
    }

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