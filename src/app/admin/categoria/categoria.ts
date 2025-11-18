import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CategoriaService, Categoria } from '../../services/categoria/categoria';

@Component({
  selector: 'app-categoria',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './categoria.html',
  styleUrls: ['./categoria.css']
})
export class CategoriaComponent implements OnInit {
  categorias: Categoria[] = [];
  categoriaActual: any = {
    nombre: '',
    estado: 1
  };
  mostrarFormulario = false;
  esEdicion = false;
  mensaje = '';
  tipoMensaje = '';
  cargando = true;

  // Variables para manejar errores de validación
  erroresValidacion: any = {};

  constructor(private categoriaService: CategoriaService) {}

  ngOnInit(): void {
    this.cargarCategorias();
  }

  cargarCategorias(): void {
    this.cargando = true;
    this.categoriaService.obtenerTodas().subscribe({
      next: (data: Categoria[]) => {
        this.categorias = data || [];
        this.cargando = false;
      },
      error: (error: any) => {
        this.mostrarMensaje('Error al cargar categorías', 'error');
        this.categorias = [];
        this.cargando = false;
        console.error('Error:', error);
      }
    });
  }

  abrirFormularioCrear(): void {
    this.categoriaActual = {
      nombre: '',
      estado: 1
    };
    this.esEdicion = false;
    this.mostrarFormulario = true;
    this.limpiarErrores();
  }

  cerrarFormulario(): void {
    this.mostrarFormulario = false;
    this.categoriaActual = {
      nombre: '',
      estado: 1
    };
    this.limpiarErrores();
  }

  // Método de validación
  validarNombre(nombre: string): boolean {
    // Solo permite letras, espacios y algunos caracteres especiales comunes en nombres
    const nombreRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s\-\.]+$/;
    return nombreRegex.test(nombre);
  }

  // Validar si el formulario está completo
  formularioCompleto(): boolean {
    return !!(
      this.categoriaActual.nombre &&
      this.categoriaActual.nombre.trim() !== ''
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
    if (!this.categoriaActual.nombre) {
      this.erroresValidacion.nombre = 'El nombre es requerido';
      esValido = false;
    } else if (!this.validarNombre(this.categoriaActual.nombre)) {
      this.erroresValidacion.nombre = 'El nombre solo puede contener letras, espacios y guiones';
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
      case 'nombre':
        if (valor && !this.validarNombre(valor)) {
          this.erroresValidacion.nombre = 'El nombre solo puede contener letras, espacios y guiones';
        } else {
          delete this.erroresValidacion.nombre;
        }
        break;
    }
  }

  crearCategoria(): void {
    if (!this.validarFormulario()) {
      this.mostrarMensaje('Por favor corrige los errores en el formulario', 'error');
      return;
    }

    this.categoriaService.crearCategoria(this.categoriaActual).subscribe({
      next: (categoriaCreada: Categoria) => {
        this.categorias.push(categoriaCreada);
        this.mostrarMensaje('Categoría creada exitosamente', 'success');
        this.cerrarFormulario();
      },
      error: (error: any) => {
        this.mostrarMensaje(error.error?.error || 'Error al crear categoría', 'error');
        console.error('Error:', error);
      }
    });
  }

  cambiarEstadoCategoria(id: number): void {
    this.categoriaService.cambiarEstado(id).subscribe({
      next: (categoriaActualizada: Categoria) => {
        const index = this.categorias.findIndex(c => c.idCategoria === categoriaActualizada.idCategoria);
        if (index !== -1) {
          this.categorias[index] = categoriaActualizada;
        }
        this.mostrarMensaje('Estado de la categoría cambiado exitosamente', 'success');
      },
      error: (error: any) => {
        this.mostrarMensaje('Error al cambiar estado de la categoría', 'error');
        console.error('Error:', error);
      }
    });
  }

  eliminarCategoria(id: number): void {
    if (!confirm('¿Estás seguro de eliminar esta categoría? Esta acción no se puede deshacer.')) {
      return;
    }

    this.categoriaService.eliminarCategoria(id).subscribe({
      next: (response: any) => {
        this.categorias = this.categorias.filter(c => c.idCategoria !== id);
        this.mostrarMensaje('Categoría eliminada exitosamente', 'success');
      },
      error: (error: any) => {
        this.mostrarMensaje(error.error?.message || 'Error al eliminar categoría', 'error');
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