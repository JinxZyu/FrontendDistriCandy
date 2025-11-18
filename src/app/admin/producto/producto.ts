import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductoService, Producto, ProductoRequest } from '../../services/producto/producto';
import { CategoriaService, Categoria } from '../../services/categoria/categoria';

@Component({
  selector: 'app-producto',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './producto.html',
  styleUrls: ['./producto.css']
})
export class ProductoComponent implements OnInit {
  productos: Producto[] = [];
  categorias: Categoria[] = [];
  
  productoActual: any = {
    referencia: '',
    nombre: '',
    descripcion: '',
    precioUnitario: 0,
    valorDescuento: 0,
    existencia: 0,
    fotoProducto: '',
    idsCategorias: [],
    estado: 1
  };
  mostrarFormulario = false;
  esEdicion = false;
  mensaje = '';
  tipoMensaje = '';
  cargando = true;

  erroresValidacion: any = {};

  constructor(
    private productoService: ProductoService,
    private categoriaService: CategoriaService
  ) {}

  ngOnInit(): void {
    this.cargarProductos();
    this.cargarCategorias();
  }

  cargarCategorias(): void {
    this.categoriaService.obtenerTodas().subscribe({
      next: (data: Categoria[]) => {
        this.categorias = data.filter(c => c.estado === 1);
      },
      error: (error: any) => {
        console.error('Error al cargar categorías:', error);
        this.categorias = [];
      }
    });
  }

  cargarProductos(): void {
    this.cargando = true;
    this.productoService.obtenerTodos().subscribe({
      next: (data: Producto[]) => {
        this.productos = data || [];
        this.cargando = false;
      },
      error: (error: any) => {
        this.mostrarMensaje('Error al cargar productos', 'error');
        this.productos = [];
        this.cargando = false;
        console.error('Error:', error);
      }
    });
  }

  abrirFormularioCrear(): void {
    this.productoActual = {
      referencia: '',
      nombre: '',
      descripcion: '',
      precioUnitario: 0,
      valorDescuento: 0,
      existencia: 0,
      fotoProducto: '',
      idsCategorias: [],
      estado: 1
    };
    this.esEdicion = false;
    this.mostrarFormulario = true;
    this.limpiarErrores();
  }

  abrirFormularioEditar(producto: Producto): void {
    this.productoActual = { 
      ...producto,
      fotoProducto: producto.imagen || '',
      valorDescuento: producto.valorDescuento || 0,
      idsCategorias: producto.categorias?.map(c => c.idCategoria) || []
    };
    this.esEdicion = true;
    this.mostrarFormulario = true;
    this.limpiarErrores();
  }

  cerrarFormulario(): void {
    this.mostrarFormulario = false;
    this.productoActual = {
      referencia: '',
      nombre: '',
      descripcion: '',
      precioUnitario: 0,
      valorDescuento: 0,
      existencia: 0,
      fotoProducto: '',
      idsCategorias: [],
      estado: 1
    };
    this.limpiarErrores();
  }

  // NUEVO: Método para verificar si una categoría está seleccionada
  isCategoriaSeleccionada(idCategoria: number | undefined): boolean {
    if (!idCategoria) return false;
    return this.productoActual.idsCategorias.includes(Number(idCategoria));
  }

  // NUEVO: Método para agregar categoría desde el dropdown
  agregarCategoria(idCategoria: string): void {
    if (idCategoria && idCategoria !== '') {
      const id = Number(idCategoria);
      if (!this.productoActual.idsCategorias.includes(id)) {
        this.productoActual.idsCategorias.push(id);
      }
    }
  }

  // NUEVO: Método para remover categoría
  removerCategoria(idCategoria: number): void {
    const index = this.productoActual.idsCategorias.indexOf(Number(idCategoria));
    if (index > -1) {
      this.productoActual.idsCategorias.splice(index, 1);
    }
  }

  // NUEVO: Obtener nombre de categoría por ID
  getNombreCategoria(idCategoria: number): string {
    const categoria = this.categorias.find(c => c.idCategoria === Number(idCategoria));
    return categoria ? categoria.nombre : 'Desconocida';
  }

  // Método para obtener nombres de categorías seleccionadas
  getCategoriasSeleccionadas(): string {
    if (!this.productoActual.idsCategorias || this.productoActual.idsCategorias.length === 0) {
      return 'Ninguna categoría seleccionada';
    }
    
    const nombresCategories = this.productoActual.idsCategorias
      .map((id: number) => {
        const categoria = this.categorias.find(c => c.idCategoria === Number(id));
        return categoria ? categoria.nombre : '';
      })
      .filter((nombre: string) => nombre !== '');
    
    return nombresCategories.join(', ');
  }

  validarReferencia(referencia: string): boolean {
    const referenciaRegex = /^[a-zA-Z0-9\-\.]+$/;
    return referenciaRegex.test(referencia);
  }

  validarNombre(nombre: string): boolean {
    const nombreRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ0-9\s\-\.]+$/;
    return nombreRegex.test(nombre);
  }

  crearProducto(): void {
    if (!this.validarFormulario()) {
      this.mostrarMensaje('Por favor corrige los errores en el formulario', 'error');
      return;
    }

    // CRÍTICO: Backend espera "id_categoria" según @JsonProperty en ProductoRequest.java
    const request: any = {
      nombre: this.productoActual.nombre,
      referencia: this.productoActual.referencia,
      descripcion: this.productoActual.descripcion || '',
      precio_unitario: Number(this.productoActual.precioUnitario),
      existencia: 0,
      id_categoria: this.productoActual.idsCategorias.map((id: any) => Number(id))
    };

    if (this.productoActual.valorDescuento) {
      const descuento = Number(this.productoActual.valorDescuento);
      if (descuento > 0) {
        request.valor_descuento = descuento;
      }
    }

    if (this.productoActual.fotoProducto) {
      const foto = this.productoActual.fotoProducto.trim();
      if (foto !== '') {
        request.foto_producto = foto;
      }
    }

    console.log('Request a enviar:', request); // Para debug
    console.log('Categorías:', request.id_categoria); // Para debug

    this.productoService.crearProducto(request).subscribe({
      next: (response: any) => {
        if (response && (response.exito || response.producto)) {
          this.mostrarMensaje(response.mensaje || 'Producto creado exitosamente', 'success');
          this.cerrarFormulario();
          this.cargarProductos();
        }
      },
      error: (error: any) => {
        this.mostrarMensaje(error.error?.mensaje || 'Error al crear producto', 'error');
        console.error('Error:', error);
      }
    });
  }

  actualizarProducto(): void {
    if (!this.validarFormulario()) {
      this.mostrarMensaje('Por favor corrige los errores en el formulario', 'error');
      return;
    }

    if (this.productoActual.idProducto) {
      // CRÍTICO: Backend espera "id_categoria" según @JsonProperty en ProductoRequest.java
      const request: any = {
        nombre: this.productoActual.nombre,
        referencia: this.productoActual.referencia,
        descripcion: this.productoActual.descripcion,
        precio_unitario: Number(this.productoActual.precioUnitario),
        existencia: this.productoActual.existencia || 0,
        id_categoria: this.productoActual.idsCategorias.map((id: any) => Number(id))
      };

      if (this.productoActual.valorDescuento && this.productoActual.valorDescuento > 0) {
        request.valor_descuento = Number(this.productoActual.valorDescuento);
      }

      if (this.productoActual.fotoProducto && this.productoActual.fotoProducto.trim() !== '') {
        request.foto_producto = this.productoActual.fotoProducto.trim();
      }

      console.log('Request actualización:', request); // Para debug

      this.productoService.actualizarProducto(this.productoActual.idProducto, request).subscribe({
        next: (productoActualizado: Producto) => {
          const index = this.productos.findIndex(p => p.idProducto === productoActualizado.idProducto);
          if (index !== -1) {
            this.productos[index] = productoActualizado;
          }
          this.mostrarMensaje('Producto actualizado exitosamente', 'success');
          this.cerrarFormulario();
        },
        error: (error: any) => {
          this.mostrarMensaje('Error al actualizar producto', 'error');
          console.error('Error:', error);
        }
      });
    }
  }

  validarDescripcion(descripcion: string): boolean {
    if (!descripcion) return true;
    const descripcionRegex = /^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑüÜ\s\-\.\,\;\:\(\)]+$/;
    return descripcionRegex.test(descripcion);
  }

  validarPrecio(precio: number): boolean {
    return precio > 0;
  }

  validarDescuento(descuento: number, precio: number): boolean {
    if (descuento === null || descuento === undefined) return true;
    return descuento >= 0 && descuento <= precio;
  }

 validarFotoUrl(url: string): boolean {
  if (!url || url.trim() === '') return true;
  

  const urlRegex = /^.+$/;
  return urlRegex.test(url);
}

  formularioCompleto(): boolean {
    return !!(
      this.productoActual.referencia &&
      this.productoActual.nombre &&
      this.productoActual.precioUnitario &&
      this.productoActual.referencia.trim() !== '' &&
      this.productoActual.nombre.trim() !== ''
    );
  }

  tieneErrores(): boolean {
    return Object.keys(this.erroresValidacion).length > 0;
  }

  validarFormulario(): boolean {
    this.limpiarErrores();
    let esValido = true;

    if (!this.productoActual.referencia) {
      this.erroresValidacion.referencia = 'La referencia es requerida';
      esValido = false;
    } else if (!this.validarReferencia(this.productoActual.referencia)) {
      this.erroresValidacion.referencia = 'La referencia solo puede contener letras, números, guiones y puntos';
      esValido = false;
    }

    if (!this.productoActual.nombre) {
      this.erroresValidacion.nombre = 'El nombre es requerido';
      esValido = false;
    } else if (!this.validarNombre(this.productoActual.nombre)) {
      this.erroresValidacion.nombre = 'El nombre contiene caracteres no permitidos';
      esValido = false;
    }

    if (this.productoActual.descripcion && !this.validarDescripcion(this.productoActual.descripcion)) {
      this.erroresValidacion.descripcion = 'La descripción contiene caracteres no permitidos';
      esValido = false;
    }

    if (!this.validarPrecio(this.productoActual.precioUnitario)) {
      this.erroresValidacion.precioUnitario = 'El precio debe ser mayor a 0';
      esValido = false;
    }

    if (this.productoActual.valorDescuento && !this.validarDescuento(this.productoActual.valorDescuento, this.productoActual.precioUnitario)) {
      this.erroresValidacion.valorDescuento = 'El valor de descuento no puede ser mayor al precio unitario';
      esValido = false;
    }

    if (this.productoActual.fotoProducto && !this.validarFotoUrl(this.productoActual.fotoProducto)) {
      this.erroresValidacion.fotoProducto = 'La URL de la foto no es válida';
      esValido = false;
    }

    return esValido;
  }

  limpiarErrores(): void {
    this.erroresValidacion = {};
  }

  validarCampo(campo: string, valor: any): void {
    switch (campo) {
      case 'referencia':
        if (valor && !this.validarReferencia(valor)) {
          this.erroresValidacion.referencia = 'La referencia solo puede contener letras, números, guiones y puntos';
        } else {
          delete this.erroresValidacion.referencia;
        }
        break;
      case 'nombre':
        if (valor && !this.validarNombre(valor)) {
          this.erroresValidacion.nombre = 'El nombre contiene caracteres no permitidos';
        } else {
          delete this.erroresValidacion.nombre;
        }
        break;
      case 'descripcion':
        if (valor && !this.validarDescripcion(valor)) {
          this.erroresValidacion.descripcion = 'La descripción contiene caracteres no permitidos';
        } else {
          delete this.erroresValidacion.descripcion;
        }
        break;
      case 'precioUnitario':
        if (valor && !this.validarPrecio(valor)) {
          this.erroresValidacion.precioUnitario = 'El precio debe ser mayor a 0';
        } else {
          delete this.erroresValidacion.precioUnitario;
        }
        break;
      case 'valorDescuento':
        if (valor && !this.validarDescuento(valor, this.productoActual.precioUnitario)) {
          this.erroresValidacion.valorDescuento = 'El valor de descuento no puede ser mayor al precio unitario';
        } else {
          delete this.erroresValidacion.valorDescuento;
        }
        break;
      case 'fotoProducto':
        if (valor && !this.validarFotoUrl(valor)) {
          this.erroresValidacion.fotoProducto = 'La URL de la foto no es válida';
        } else {
          delete this.erroresValidacion.fotoProducto;
        }
        break;
    }
  }

  cambiarEstadoProducto(id: number): void {
    this.productoService.cambiarEstado(id).subscribe({
      next: (productoActualizado: Producto) => {
        const index = this.productos.findIndex(p => p.idProducto === productoActualizado.idProducto);
        if (index !== -1) {
          this.productos[index] = productoActualizado;
        }
        this.mostrarMensaje('Estado del producto cambiado exitosamente', 'success');
      },
      error: (error: any) => {
        this.mostrarMensaje('Error al cambiar estado del producto', 'error');
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

  getEstadoTexto(estado?: number): string {
    return estado === 1 ? 'Activo' : 'Inactivo';
  }

  getEstadoClase(estado?: number): string {
    return estado === 1 ? 'estado-activo' : 'estado-inactivo';
  }
}