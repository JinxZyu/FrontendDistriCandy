import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductoService, Producto, ProductoRequest } from '../../services/producto/producto';
import { CategoriaService, Categoria } from '../../services/categoria/categoria';
import { ProductoProveedorService, ProductoProveedorRequest } from '../../services/productoProveedor/producto-proveedor';
import { ProveedorService, Proveedor } from '../../services/proveedor/proveedor';

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
  proveedores: Proveedor[] = [];
  
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

  pasoActual: 'producto' | 'proveedor' = 'producto';
  productoCreado: Producto | null = null;
  referenciaExiste = false;
  verificandoReferencia = false;

  compraActual: any = {
    idProveedor: null,
    precioCompra: 0,
    cantidad: 0,
    fechaCompra: new Date().toISOString().split('T')[0]
  };

  mostrarFormulario = false;
  esEdicion = false;
  mensaje = '';
  tipoMensaje = '';
  cargando = true;
  procesandoCompra = false;
  
  erroresValidacion: any = {};

  constructor(
    private productoService: ProductoService,
    private categoriaService: CategoriaService,
    private productoProveedorService: ProductoProveedorService,
    private proveedorService: ProveedorService
  ) {}

  ngOnInit(): void {
    this.cargarProductos();
    this.cargarCategorias();
    this.cargarProveedores();
    this.setFechaActual();
  }

  async crearProductoYContinuar(): Promise<void> {
    const request: any = {
      nombre: this.productoActual.nombre.trim(),
      referencia: this.productoActual.referencia.trim(),
      descripcion: this.productoActual.descripcion?.trim() || '',
      precio_unitario: Number(this.productoActual.precioUnitario),
      existencia: 0,
      id_categoria: this.productoActual.idsCategorias.map((id: any) => Number(id))
    };

    // Campos opcionales
    if (this.productoActual.valorDescuento && this.productoActual.valorDescuento > 0) {
      request.valor_descuento = Number(this.productoActual.valorDescuento);
    }

    if (this.productoActual.fotoProducto?.trim()) {
      request.foto_producto = this.productoActual.fotoProducto.trim();
    }

    console.log('Request crear producto:', request);

    try {
      const response = await this.productoService.crearProducto(request).toPromise();
      console.log('Respuesta crear producto COMPLETA:', response);
      
      // MANEJO MEJORADO DE LA RESPUESTA
      if (response && (response.exito || response.success)) {
        // Crear el objeto producto a partir de la respuesta
        this.productoCreado = {
          idProducto: response.producto?.idProducto || response.idProducto,
          nombre: response.producto?.nombre || response.nombre || this.productoActual.nombre,
          referencia: response.producto?.referencia || response.referencia || this.productoActual.referencia,
          descripcion: response.producto?.descripcion || response.descripcion || this.productoActual.descripcion,
          precioUnitario: response.producto?.precioUnitario || response.precioUnitario || this.productoActual.precioUnitario,
          valorDescuento: response.producto?.valorDescuento || response.valorDescuento || this.productoActual.valorDescuento,
          existencia: response.producto?.existencia || response.existencia || 0,
          imagen: response.producto?.imagen || response.fotoProducto || this.productoActual.fotoProducto,
          estado: response.producto?.estado || response.estado || 1
        };
        
        console.log('Producto creado procesado:', this.productoCreado);
        
        // VALIDACIÓN CRÍTICA del ID
        if (!this.productoCreado.idProducto) {
          console.error('ERROR: Producto creado pero sin ID. Respuesta completa:', response);
          this.mostrarMensaje('Error: El producto se creó pero no se recibió un ID válido. Intenta nuevamente.', 'error');
          return;
        }
        
        this.mostrarMensaje('Producto creado exitosamente. Ahora relaciona con el proveedor', 'success');
        this.pasoActual = 'proveedor';
      } else {
        const errorMsg = response?.mensaje || response?.error || 'No se pudo crear el producto';
        throw new Error(errorMsg);
      }
    } catch (error: any) {
      console.error('Error completo al crear producto:', error);
      const mensajeError = error.error?.mensaje || error.message || 'Error al crear producto';
      this.mostrarMensaje(mensajeError, 'error');
      throw error;
    }
  }

  setFechaActual(): void {
    const hoy = new Date();
    this.compraActual.fechaCompra = hoy.toISOString().split('T')[0];
  }

  cargarCategorias(): void {
    this.categoriaService.obtenerTodas().subscribe({
      next: (data: Categoria[]) => {
        this.categorias = data.filter(c => c.estado === 1);
        console.log('Categorías cargadas:', this.categorias);
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
    this.compraActual = {
      idProveedor: null,
      precioCompra: 0,
      cantidad: 0,
      fechaCompra: new Date().toISOString().split('T')[0]
    };
    this.pasoActual = 'producto';
    this.referenciaExiste = false;
    this.productoCreado = null;
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
    this.pasoActual = 'producto';
    this.esEdicion = true;
    this.mostrarFormulario = true;
    this.limpiarErrores();
  }

  
  cerrarFormulario(): void {
    this.mostrarFormulario = false;
    this.pasoActual = 'producto';
    this.productoCreado = null;
    this.referenciaExiste = false;
    this.procesandoCompra = false;
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
    this.compraActual = {
      idProveedor: null,
      precioCompra: 0,
      cantidad: 0,
      fechaCompra: new Date().toISOString().split('T')[0]
    };
    this.limpiarErrores();
  }

  async continuarAPasoProveedor(): Promise<void> {
    if (!this.validarFormulario()) {
      this.mostrarMensaje('Por favor corrige los errores en el formulario', 'error');
      return;
    }

    this.verificandoReferencia = true;

    try {
      const response = await this.productoProveedorService
        .verificarReferencia(this.productoActual.referencia)
        .toPromise();

      console.log('Respuesta verificación referencia:', response);

      if (response?.existe && response.producto) {
        this.referenciaExiste = true;
        this.productoCreado = {
          ...response.producto,
          imagen: response.producto.fotoProducto || ''
        } as Producto;
        this.mostrarMensaje('Referencia encontrada. Completa los datos del proveedor', 'success');
        this.pasoActual = 'proveedor';
      } else {
        this.referenciaExiste = false;
        await this.crearProductoYContinuar();
      }
    } catch (error: any) {
      console.error('Error al verificar referencia:', error);
      this.referenciaExiste = false;
      await this.crearProductoYContinuar();
    } finally {
      this.verificandoReferencia = false;
    }
  }

  async registrarCompraProveedor(): Promise<void> {
    if (this.procesandoCompra) {
      console.log('Ya se está procesando una compra');
      return;
    }

    // Validación MEJORADA con logs detallados
    console.log('Validando compra - productoCreado:', this.productoCreado);
    console.log('Validando compra - idProducto:', this.productoCreado?.idProducto);

    if (!this.validarFormularioProveedor()) {
      this.mostrarMensaje('Por favor completa todos los campos del proveedor correctamente', 'error');
      return;
    }

    // Validación MÁS ESTRICTA del producto
    if (!this.productoCreado) {
      console.error('Error: productoCreado es null/undefined');
      this.mostrarMensaje('Error: No se encontró información del producto creado', 'error');
      return;
    }

    let idProducto = Number(this.productoCreado.idProducto);

    // FIX DE EMERGENCIA: Si el ID es inválido, intentar recuperar por nombre
    if (!idProducto || isNaN(idProducto) || idProducto <= 0) {
      console.error('EMERGENCY: ID inválido, intentando recuperar...');
      
      // Intentar obtener el producto por nombre como último recurso
      try {
        const productoRecuperado = await this.productoService.buscarPorNombre(this.productoActual.nombre).toPromise();
        if (productoRecuperado?.idProducto) {
          console.log('Producto recuperado por nombre:', productoRecuperado);
          this.productoCreado = productoRecuperado;
          idProducto = Number(productoRecuperado.idProducto);
        } else {
          throw new Error('No se pudo recuperar el producto');
        }
      } catch (error) {
        this.mostrarMensaje('Error crítico: No se pudo obtener el ID del producto. Contacta al administrador.', 'error');
        this.procesandoCompra = false;
        return;
      }
    }

    // Validación final del ID después del fix
    if (!idProducto || isNaN(idProducto) || idProducto <= 0) {
      console.error('Error: ID de producto inválido después del fix:', idProducto);
      console.error('Producto completo:', this.productoCreado);
      this.mostrarMensaje('Error: ID de producto inválido. Por favor, vuelve a crear el producto.', 'error');
      return;
    }

    this.procesandoCompra = true;

    // CORRECCIÓN PRINCIPAL: Cambiar a snake_case para el backend
    const request = {
      id_producto: idProducto,
      id_proveedor: Number(this.compraActual.idProveedor),
      precio_compra: Number(this.compraActual.precioCompra),
      cantidad: Number(this.compraActual.cantidad),
      fecha_compra: this.compraActual.fechaCompra
    };

    console.log('Request registrar compra CORREGIDO (snake_case):', JSON.stringify(request, null, 2));

    this.productoProveedorService.registrarCompra(request as any).subscribe({
      next: (response) => {
        console.log('Respuesta registrar compra:', response);
        if (response && response.exito) {
          this.mostrarMensaje('Compra registrada exitosamente', 'success');
          this.cerrarFormulario();
          this.cargarProductos();
        } else {
          const errorMsg = response?.mensaje || response?.error || 'Error al registrar compra';
          this.mostrarMensaje(errorMsg, 'error');
        }
        this.procesandoCompra = false;
      },
      error: (error: any) => {
        console.error('Error completo al registrar compra:', error);
        
        let mensajeError = 'Error al registrar compra';
        if (error.error?.mensaje) {
          mensajeError = error.error.mensaje;
        } else if (error.error?.error) {
          mensajeError = error.error.error;
        } else if (error.message) {
          mensajeError = error.message;
        }
        
        this.mostrarMensaje(mensajeError, 'error');
        this.procesandoCompra = false;
      }
    });
  }

  volverAPasoProducto(): void {
    this.pasoActual = 'producto';
    this.productoCreado = null;
    this.referenciaExiste = false;
  }

  cargarProveedores(): void {
    this.proveedorService.obtenerProveedores().subscribe({
      next: (data: Proveedor[]) => {
        this.proveedores = data.filter(p => p.estado === 1);
        console.log('Proveedores cargados:', this.proveedores);
      },
      error: (error: any) => {
        console.error('Error al cargar proveedores:', error);
        this.proveedores = [];
      }
    });
  }

  validarFormularioProveedor(): boolean {
    // Validación más robusta
    const idProveedor = Number(this.compraActual.idProveedor);
    const esProveedorValido = !isNaN(idProveedor) && idProveedor > 0;
    const esPrecioValido = this.compraActual.precioCompra > 0;
    const esCantidadValida = this.compraActual.cantidad > 0;
    const esFechaValida = !!this.compraActual.fechaCompra;
    
    console.log('Validación proveedor - ID:', idProveedor, 'Válido:', esProveedorValido);
    
    return esProveedorValido && esPrecioValido && esCantidadValida && esFechaValida;
  }
  
  actualizarProducto(): void {
    if (!this.validarFormulario()) {
      this.mostrarMensaje('Por favor corrige los errores en el formulario', 'error');
      return;
    }

    if (this.productoActual.idProducto) {
      // CORRECCIÓN: Usar snake_case también para actualizar
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

      console.log('Request actualizar producto (snake_case):', request);

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

  isCategoriaSeleccionada(idCategoria: number | undefined): boolean {
    if (!idCategoria) return false;
    return this.productoActual.idsCategorias.includes(Number(idCategoria));
  }

  agregarCategoria(idCategoria: string): void {
    if (idCategoria && idCategoria !== '') {
      const id = Number(idCategoria);
      if (!this.productoActual.idsCategorias.includes(id)) {
        this.productoActual.idsCategorias.push(id);
      }
    }
  }

  removerCategoria(idCategoria: number): void {
    const index = this.productoActual.idsCategorias.indexOf(Number(idCategoria));
    if (index > -1) {
      this.productoActual.idsCategorias.splice(index, 1);
    }
  }

  getNombreCategoria(idCategoria: number): string {
    const categoria = this.categorias.find(c => c.idCategoria === Number(idCategoria));
    return categoria ? categoria.nombre : 'Desconocida';
  }

  getNombreProveedor(idProveedor: number): string {
    const proveedor = this.proveedores.find(p => p.idProveedor === Number(idProveedor));
    return proveedor ? proveedor.nombre : 'Desconocido';
  }

  validarReferencia(referencia: string): boolean {
    const referenciaRegex = /^[a-zA-Z0-9\-\.]+$/;
    return referenciaRegex.test(referencia);
  }

  validarNombre(nombre: string): boolean {
    const nombreRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ0-9\s\-\.]+$/;
    return nombreRegex.test(nombre);
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
    return true;
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