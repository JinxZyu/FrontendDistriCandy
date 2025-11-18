import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { UsuarioService } from '../services/usuario/usuario';
import { ProductoService, Producto } from '../services/producto/producto';
import { FormatoPrecioPipe } from '../pipes/formato-precio-pipe';

interface ProductoCarrito extends Producto {
  cantidad: number;
  subtotal: number;
}

@Component({
  selector: 'app-carrito',
  standalone: true,
  imports: [CommonModule, FormsModule, FormatoPrecioPipe],
  templateUrl: './carrito.html',
  styleUrl: './carrito.css'
})
export class CarritoComponent implements OnInit {
  nombreUsuario: string = '';
  carrito: ProductoCarrito[] = [];
  
  // Totales
  subtotal: number = 0;
  descuentoTotal: number = 0;
  total: number = 0;
  
  // Notificaciones
  mostrarNotificacion = false;
  tipoNotificacion: 'success' | 'error' | 'warning' = 'success';
  mensajeNotificacion = '';

  // Modal de confirmación
  mostrarModalEliminar = false;
  productoAEliminar: ProductoCarrito | null = null;
  mostrarModalVaciar = false;

  // Estado del carrito
  carritoVacio: boolean = true;

  constructor(
    private router: Router,
    private usuarioService: UsuarioService,
    private productoService: ProductoService
  ) {
    const usuario = this.usuarioService.obtenerUsuario();
    this.nombreUsuario = usuario?.nombre_completo || 'Usuario';
  }

  ngOnInit(): void {
    this.cargarCarrito();
  }

  cargarCarrito(): void {
    const carritoGuardado = localStorage.getItem('carrito');
    if (carritoGuardado) {
      const productos = JSON.parse(carritoGuardado);
      this.carrito = productos.map((p: any) => ({
        ...p,
        cantidad: p.cantidad || 1,
        subtotal: this.calcularSubtotal(p)
      }));
      this.carritoVacio = this.carrito.length === 0;
      this.calcularTotales();
    } else {
      this.carritoVacio = true;
    }
  }

  calcularSubtotal(producto: ProductoCarrito): number {
    const precio = this.calcularPrecioConDescuento(producto);
    return precio * (producto.cantidad || 1);
  }

  calcularPrecioConDescuento(producto: ProductoCarrito): number {
    if (!producto.valorDescuento || producto.valorDescuento <= 0) {
      return producto.precioUnitario;
    }

    const porcentajeDescuento = Math.min(producto.valorDescuento, 100);
    const factorDescuento = porcentajeDescuento / 100;
    const montoDescuento = producto.precioUnitario * factorDescuento;
    const precioFinal = Math.max(0, producto.precioUnitario - montoDescuento);
    
    return Math.round(precioFinal);
  }

  obtenerPorcentajeDescuento(producto: ProductoCarrito): number {
    if (!producto.valorDescuento || producto.valorDescuento <= 0) {
      return 0;
    }
    return Math.round(producto.valorDescuento);
  }

  calcularTotales(): void {
    this.subtotal = 0;
    this.descuentoTotal = 0;

    this.carrito.forEach(producto => {
      const precioOriginal = producto.precioUnitario * producto.cantidad;
      const precioConDescuento = producto.subtotal;
      
      this.subtotal += precioOriginal;
      this.descuentoTotal += (precioOriginal - precioConDescuento);
    });

    this.total = this.subtotal - this.descuentoTotal;
  }

  aumentarCantidad(producto: ProductoCarrito): void {
    if (producto.cantidad < (producto.existencia || 0)) {
      producto.cantidad++;
      producto.subtotal = this.calcularSubtotal(producto);
      this.calcularTotales();
      this.guardarCarrito();
    } else {
      this.mostrarNotif('warning', `Solo hay ${producto.existencia} unidades disponibles`);
    }
  }

  disminuirCantidad(producto: ProductoCarrito): void {
    if (producto.cantidad > 1) {
      producto.cantidad--;
      producto.subtotal = this.calcularSubtotal(producto);
      this.calcularTotales();
      this.guardarCarrito();
    }
  }

  actualizarCantidad(producto: ProductoCarrito, event: any): void {
    const nuevaCantidad = parseInt(event.target.value) || 1;
    
    if (nuevaCantidad < 1) {
      producto.cantidad = 1;
      this.mostrarNotif('warning', 'La cantidad mínima es 1');
    } else if (nuevaCantidad > (producto.existencia || 0)) {
      producto.cantidad = producto.existencia || 1;
      this.mostrarNotif('warning', `Solo hay ${producto.existencia} unidades disponibles`);
    } else {
      producto.cantidad = nuevaCantidad;
    }

    producto.subtotal = this.calcularSubtotal(producto);
    this.calcularTotales();
    this.guardarCarrito();
  }

  confirmarEliminar(producto: ProductoCarrito): void {
    this.productoAEliminar = producto;
    this.mostrarModalEliminar = true;
  }

  cancelarEliminar(): void {
    this.mostrarModalEliminar = false;
    this.productoAEliminar = null;
  }

  eliminarProducto(): void {
    if (this.productoAEliminar) {
      const index = this.carrito.findIndex(p => p.idProducto === this.productoAEliminar!.idProducto);
      if (index !== -1) {
        const nombreProducto = this.carrito[index].nombre;
        this.carrito.splice(index, 1);
        this.guardarCarrito();
        this.calcularTotales();
        this.carritoVacio = this.carrito.length === 0;
        this.mostrarNotif('success', `${nombreProducto} eliminado del carrito`);
      }
    }
    this.mostrarModalEliminar = false;
    this.productoAEliminar = null;
  }

  vaciarCarrito(): void {
    this.mostrarModalVaciar = true;
  }

  confirmarVaciarCarrito(): void {
    this.carrito = [];
    this.guardarCarrito();
    this.calcularTotales();
    this.carritoVacio = true;
    this.mostrarModalVaciar = false;
    this.mostrarNotif('success', 'Carrito vaciado');
  }

  cancelarVaciarCarrito(): void {
    this.mostrarModalVaciar = false;
  }

  guardarCarrito(): void {
    localStorage.setItem('carrito', JSON.stringify(this.carrito));
  }

  continuarComprando(): void {
    this.router.navigate(['/tienda']);
  }

  procederPago(): void {
    if (this.carrito.length === 0) {
      this.mostrarNotif('warning', 'El carrito está vacío');
      return;
    }

    // Verificar que el usuario esté autenticado
    if (!this.usuarioService.estaAutenticado()) {
      this.mostrarNotif('error', 'Debes iniciar sesión para continuar');
      setTimeout(() => {
        this.router.navigate(['/login']);
      }, 1500);
      return;
    }

    // Navegar a la página de verificar compra
    this.mostrarNotif('success', 'Redirigiendo a verificar compra...');
    
    setTimeout(() => {
      this.router.navigate(['/verificar']);
    }, 800);
  }

  mostrarNotif(tipo: 'success' | 'error' | 'warning', mensaje: string): void {
    this.tipoNotificacion = tipo;
    this.mensajeNotificacion = mensaje;
    this.mostrarNotificacion = true;
    
    setTimeout(() => {
      this.mostrarNotificacion = false;
    }, 3000);
  }

  cerrarNotificacion(): void {
    this.mostrarNotificacion = false;
  }

  cerrarSesion(): void {
    this.usuarioService.cerrarSesion();
    this.router.navigate(['/autorizacion']);
  }

  irATienda(): void {
    this.router.navigate(['/tienda']);
  }
}