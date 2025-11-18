import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BodegaService, Bodega } from '../../services/bodega/bodega';

@Component({
  selector: 'app-bodega',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './bodega.html',
  styleUrls: ['./bodega.css']
})
export class BodegaComponent implements OnInit {
  bodegas: Bodega[] = [];
  bodegaActual: any = {
    nombre: '',
    direccion: '',
    pais: '',
    ciudad: '',
    barrio: '',
    capacidadMax: 0,
    informacionAdicional: '',
    estado: 1
  };
  mostrarFormulario = false;
  esEdicion = false;
  mensaje = '';
  tipoMensaje = '';
  cargando = true;

  // Variables para manejar errores de validación
  erroresValidacion: any = {};

  constructor(private bodegaService: BodegaService) {}

  ngOnInit(): void {
    this.cargarBodegas();
  }

  cargarBodegas(): void {
    this.cargando = true;
    this.bodegaService.obtenerBodegas().subscribe({
      next: (data: Bodega[]) => {
        this.bodegas = data || [];
        this.cargando = false;
      },
      error: (error: any) => {
        this.mostrarMensaje('Error al cargar bodegas', 'error');
        this.bodegas = [];
        this.cargando = false;
        console.error('Error:', error);
      }
    });
  }

  abrirFormularioCrear(): void {
    this.bodegaActual = {
      nombre: '',
      direccion: '',
      pais: '',
      ciudad: '',
      barrio: '',
      capacidadMax: 0,
      informacionAdicional: '',
      estado: 1
    };
    this.esEdicion = false;
    this.mostrarFormulario = true;
    this.limpiarErrores();
  }

  abrirFormularioEditar(bodega: Bodega): void {
    this.bodegaActual = { ...bodega };
    this.esEdicion = true;
    this.mostrarFormulario = true;
    this.limpiarErrores();
  }

  cerrarFormulario(): void {
    this.mostrarFormulario = false;
    this.bodegaActual = {
      nombre: '',
      direccion: '',
      pais: '',
      ciudad: '',
      barrio: '',
      capacidadMax: 0,
      informacionAdicional: '',
      estado: 1
    };
    this.limpiarErrores();
  }

  // Métodos de validación
  validarNombre(nombre: string): boolean {
    // Solo permite letras, números, espacios y algunos caracteres especiales
    const nombreRegex = /^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑüÜ\s\-\_\.]+$/;
    return nombreRegex.test(nombre);
  }

  validarDireccion(direccion: string): boolean {
    // Permite letras, números, espacios y caracteres comunes en direcciones
    const direccionRegex = /^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑüÜ\s\-\#\,\.\°]+$/;
    return direccionRegex.test(direccion);
  }

  validarPais(pais: string): boolean {
    // Solo permite letras y espacios
    const paisRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/;
    return paisRegex.test(pais);
  }

  validarCiudad(ciudad: string): boolean {
    // Solo permite letras y espacios
    const ciudadRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/;
    return ciudadRegex.test(ciudad);
  }

  validarBarrio(barrio: string): boolean {
    // Solo permite letras, números y espacios
    const barrioRegex = /^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑüÜ\s]+$/;
    return barrioRegex.test(barrio);
  }

  validarCapacidadMax(capacidad: number): boolean {
    // Solo permite números mayores a 0
    return capacidad > 0;
  }

  validarInformacionAdicional(informacion: string): boolean {
    // Permite cualquier caracter (sin restricciones)
    return true;
  }

  // Validar si el formulario está completo
  formularioCompleto(): boolean {
    return !!(
      this.bodegaActual.nombre &&
      this.bodegaActual.direccion &&
      this.bodegaActual.pais &&
      this.bodegaActual.ciudad &&
      this.bodegaActual.barrio &&
      this.bodegaActual.capacidadMax &&
      this.bodegaActual.nombre.trim() !== '' &&
      this.bodegaActual.direccion.trim() !== '' &&
      this.bodegaActual.pais.trim() !== '' &&
      this.bodegaActual.ciudad.trim() !== '' &&
      this.bodegaActual.barrio.trim() !== '' &&
      this.bodegaActual.capacidadMax > 0
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

    // Validar Nombre
    if (!this.bodegaActual.nombre) {
      this.erroresValidacion.nombre = 'El nombre es requerido';
      esValido = false;
    } else if (!this.validarNombre(this.bodegaActual.nombre)) {
      this.erroresValidacion.nombre = 'El nombre contiene caracteres no permitidos';
      esValido = false;
    }

    // Validar Dirección
    if (!this.bodegaActual.direccion) {
      this.erroresValidacion.direccion = 'La dirección es requerida';
      esValido = false;
    } else if (!this.validarDireccion(this.bodegaActual.direccion)) {
      this.erroresValidacion.direccion = 'La dirección contiene caracteres no permitidos';
      esValido = false;
    }

    // Validar País
    if (!this.bodegaActual.pais) {
      this.erroresValidacion.pais = 'El país es requerido';
      esValido = false;
    } else if (!this.validarPais(this.bodegaActual.pais)) {
      this.erroresValidacion.pais = 'El país solo puede contener letras y espacios';
      esValido = false;
    }

    // Validar Ciudad
    if (!this.bodegaActual.ciudad) {
      this.erroresValidacion.ciudad = 'La ciudad es requerida';
      esValido = false;
    } else if (!this.validarCiudad(this.bodegaActual.ciudad)) {
      this.erroresValidacion.ciudad = 'La ciudad solo puede contener letras y espacios';
      esValido = false;
    }

    // Validar Barrio
    if (!this.bodegaActual.barrio) {
      this.erroresValidacion.barrio = 'El barrio es requerido';
      esValido = false;
    } else if (!this.validarBarrio(this.bodegaActual.barrio)) {
      this.erroresValidacion.barrio = 'El barrio contiene caracteres no permitidos';
      esValido = false;
    }

    // Validar Capacidad Máxima
    if (!this.bodegaActual.capacidadMax) {
      this.erroresValidacion.capacidadMax = 'La capacidad máxima es requerida';
      esValido = false;
    } else if (!this.validarCapacidadMax(this.bodegaActual.capacidadMax)) {
      this.erroresValidacion.capacidadMax = 'La capacidad máxima debe ser mayor a 0';
      esValido = false;
    }

    // Validar Información Adicional (sin restricciones)
    if (this.bodegaActual.informacionAdicional && !this.validarInformacionAdicional(this.bodegaActual.informacionAdicional)) {
      this.erroresValidacion.informacionAdicional = 'La información adicional contiene caracteres no permitidos';
      esValido = false;
    }

    return esValido;
  }

  limpiarErrores(): void {
    this.erroresValidacion = {};
  }

  // Método para validar en tiempo real mientras el usuario escribe
  validarCampo(campo: string, valor: any): void {
    switch (campo) {
      case 'nombre':
        if (valor && !this.validarNombre(valor)) {
          this.erroresValidacion.nombre = 'El nombre contiene caracteres no permitidos';
        } else {
          delete this.erroresValidacion.nombre;
        }
        break;
      case 'direccion':
        if (valor && !this.validarDireccion(valor)) {
          this.erroresValidacion.direccion = 'La dirección contiene caracteres no permitidos';
        } else {
          delete this.erroresValidacion.direccion;
        }
        break;
      case 'pais':
        if (valor && !this.validarPais(valor)) {
          this.erroresValidacion.pais = 'El país solo puede contener letras y espacios';
        } else {
          delete this.erroresValidacion.pais;
        }
        break;
      case 'ciudad':
        if (valor && !this.validarCiudad(valor)) {
          this.erroresValidacion.ciudad = 'La ciudad solo puede contener letras y espacios';
        } else {
          delete this.erroresValidacion.ciudad;
        }
        break;
      case 'barrio':
        if (valor && !this.validarBarrio(valor)) {
          this.erroresValidacion.barrio = 'El barrio contiene caracteres no permitidos';
        } else {
          delete this.erroresValidacion.barrio;
        }
        break;
      case 'capacidadMax':
        if (valor && !this.validarCapacidadMax(valor)) {
          this.erroresValidacion.capacidadMax = 'La capacidad máxima debe ser mayor a 0';
        } else {
          delete this.erroresValidacion.capacidadMax;
        }
        break;
      case 'informacionAdicional':
        // Sin validación específica, permite cualquier cosa
        delete this.erroresValidacion.informacionAdicional;
        break;
    }
  }

  crearBodega(): void {
    if (!this.validarFormulario()) {
      this.mostrarMensaje('Por favor corrige los errores en el formulario', 'error');
      return;
    }

    this.bodegaService.crearBodega(this.bodegaActual).subscribe({
      next: (response: any) => {
        if (response.exito) {
          this.cargarBodegas();
          this.mostrarMensaje(response.mensaje || 'Bodega creada exitosamente', 'success');
          this.cerrarFormulario();
        } else {
          this.mostrarMensaje(response.error || 'Error al crear bodega', 'error');
        }
      },
      error: (error: any) => {
        this.mostrarMensaje(error.error?.error || 'Error al crear bodega', 'error');
        console.error('Error:', error);
      }
    });
  }

  actualizarBodega(): void {
    if (!this.validarFormulario()) {
      this.mostrarMensaje('Por favor corrige los errores en el formulario', 'error');
      return;
    }

    if (this.bodegaActual.idBodega) {
      this.bodegaService.actualizarBodega(this.bodegaActual.idBodega, this.bodegaActual).subscribe({
        next: (response: any) => {
          if (response.exito) {
            this.cargarBodegas();
            this.mostrarMensaje(response.mensaje || 'Bodega actualizada exitosamente', 'success');
            this.cerrarFormulario();
          } else {
            this.mostrarMensaje(response.error || 'Error al actualizar bodega', 'error');
          }
        },
        error: (error: any) => {
          this.mostrarMensaje('Error al actualizar bodega', 'error');
          console.error('Error:', error);
        }
      });
    }
  }

  cambiarEstadoBodega(id: number): void {
    this.bodegaService.cambiarEstado(id).subscribe({
      next: (response: any) => {
        if (response.exito) {
          this.cargarBodegas();
          this.mostrarMensaje(response.mensaje || 'Estado de la bodega cambiado exitosamente', 'success');
        } else {
          this.mostrarMensaje(response.error || 'Error al cambiar estado', 'error');
        }
      },
      error: (error: any) => {
        this.mostrarMensaje('Error al cambiar estado de la bodega', 'error');
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
    return estado === 1 ? 'Activa' : 'Inactiva';
  }

  getEstadoClase(estado: number): string {
    return estado === 1 ? 'estado-activo' : 'estado-inactivo';
  }
}