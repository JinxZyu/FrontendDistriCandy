import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { UsuarioService } from '../services/usuario/usuario';

interface Producto {
  id: number;
  nombre: string;
  descripcion: string;
  precio: number;
  descuento: number;
  stock: number;
  categoria: string;
  imagen: string;
  cantidad?: number;
}

@Component({
  selector: 'app-tienda',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './productos.html',
  styleUrl: './productos.css'
})
export class TiendaComponent implements OnInit {
  nombreUsuario: string = '';
  cargando: boolean = false;
  busqueda: string = '';
  categoriaSeleccionada: string = 'todos';
  
  // Notificaciones
  mostrarNotificacion = false;
  tipoNotificacion: 'success' | 'error' | 'warning' = 'success';
  mensajeNotificacion = '';

  // Productos (datos de ejemplo - luego los traerás del backend)
  productos: Producto[] = [
    {
      id: 1,
      nombre: 'Chocolatina Jet',
      descripcion: 'Deliciosa chocolatina con maní',
      precio: 1500,
      descuento: 10,
      stock: 50,
      categoria: 'chocolates',
      imagen: 'https://via.placeholder.com/280x200/9b7eb5/ffffff?text=Jet',
      cantidad: 1
    },
    {
      id: 2,
      nombre: 'Gomitas Trululu',
      descripcion: 'Gomitas de frutas surtidas',
      precio: 2000,
      descuento: 0,
      stock: 30,
      categoria: 'gomitas',
      imagen: 'https://via.placeholder.com/280x200/d97674/ffffff?text=Trululu',
      cantidad: 1
    },
    {
      id: 3,
      nombre: 'Chupa Chups',
      descripcion: 'Caramelo con palo de diferentes sabores',
      precio: 800,
      descuento: 15,
      stock: 100,
      categoria: 'caramelos',
      imagen: 'https://via.placeholder.com/280x200/e8a9a7/ffffff?text=Chupa+Chups',
      cantidad: 1
    },
    {
      id: 4,
      nombre: 'Chicle Globo',
      descripcion: 'Chicle para hacer globos',
      precio: 500,
      descuento: 0,
      stock: 8,
      categoria: 'chicles',
      imagen: 'https://via.placeholder.com/280x200/9b7eb5/ffffff?text=Chicle',
      cantidad: 1
    },
    {
      id: 5,
      nombre: 'Milkyway',
      descripcion: 'Chocolate con caramelo suave',
      precio: 2500,
      descuento: 20,
      stock: 0,
      categoria: 'chocolates',
      imagen: 'https://via.placeholder.com/280x200/6b4544/ffffff?text=Milkyway',
      cantidad: 1
    },
    {
      id: 6,
      nombre: 'Gomas Ácidas',
      descripcion: 'Gomitas con sabor ácido intenso',
      precio: 1800,
      descuento: 0,
      stock: 45,
      categoria: 'gomitas',
      imagen: 'https://via.placeholder.com/280x200/d97674/ffffff?text=Ácidas',
      cantidad: 1
    },
    {
      id: 7,
      nombre: 'Bon Bon Bum',
      descripcion: 'Colombina con chicle en el centro',
      precio: 600,
      descuento: 5,
      stock: 120,
      categoria: 'caramelos',
      imagen: 'https://via.placeholder.com/280x200/e8a9a7/ffffff?text=Bon+Bon',
      cantidad: 1
    },
    {
      id: 8,
      nombre: 'Trident',
      descripcion: 'Chicle sin azúcar',
      precio: 3000,
      descuento: 0,
      stock: 25,
      categoria: 'chicles',
      imagen: 'https://via.placeholder.com/280x200/9b7eb5/ffffff?text=Trident',
      cantidad: 1
    }
  ];

  productosFiltrados: Producto[] = [];
  carrito: Producto[] = [];
  totalCarrito: number = 0;

  constructor(
    private router: Router,
    private usuarioService: UsuarioService
  ) {
    const usuario = this.usuarioService.obtenerUsuario();
    this.nombreUsuario = usuario?.nombre_completo || 'Usuario';
  }

  ngOnInit(): void {
    this.productosFiltrados = [...this.productos];
    this.cargarCarrito();
  }

  filtrarPorCategoria(categoria: string): void {
    this.categoriaSeleccionada = categoria;
    this.filtrarProductos();
  }

  filtrarProductos(): void {
    let resultado = [...this.productos];

    // Filtrar por categoría
    if (this.categoriaSeleccionada !== 'todos') {
      resultado = resultado.filter(p => p.categoria === this.categoriaSeleccionada);
    }

    // Filtrar por búsqueda
    if (this.busqueda.trim()) {
      const busquedaLower = this.busqueda.toLowerCase();
      resultado = resultado.filter(p => 
        p.nombre.toLowerCase().includes(busquedaLower) ||
        p.descripcion.toLowerCase().includes(busquedaLower)
      );
    }

    this.productosFiltrados = resultado;
  }

  calcularPrecioConDescuento(producto: Producto): number {
    return Math.round(producto.precio * (1 - producto.descuento / 100));
  }

  getCantidad(producto: Producto): number {
    return producto.cantidad || 1;
  }

  aumentarCantidad(producto: Producto): void {
    if (!producto.cantidad) producto.cantidad = 1;
    if (producto.cantidad < producto.stock) {
      producto.cantidad++;
    }
  }

  disminuirCantidad(producto: Producto): void {
    if (!producto.cantidad) producto.cantidad = 1;
    if (producto.cantidad > 1) {
      producto.cantidad--;
    }
  }

  agregarAlCarrito(producto: Producto): void {
    if (producto.stock === 0) {
      this.mostrarNotif('error', 'Producto agotado');
      return;
    }

    const cantidad = producto.cantidad || 1;
    
    // Buscar si el producto ya está en el carrito
    const index = this.carrito.findIndex(p => p.id === producto.id);
    
    if (index !== -1) {
      // Si ya existe, aumentar cantidad
      this.carrito[index].cantidad = (this.carrito[index].cantidad || 0) + cantidad;
    } else {
      // Si no existe, agregar nuevo
      this.carrito.push({...producto, cantidad});
    }

    this.guardarCarrito();
    this.actualizarTotalCarrito();
    this.mostrarNotif('success', `${producto.nombre} agregado al carrito (${cantidad})`);
    
    // Resetear cantidad a 1
    producto.cantidad = 1;
  }

  guardarCarrito(): void {
    localStorage.setItem('carrito', JSON.stringify(this.carrito));
  }

  cargarCarrito(): void {
    const carritoGuardado = localStorage.getItem('carrito');
    if (carritoGuardado) {
      this.carrito = JSON.parse(carritoGuardado);
      this.actualizarTotalCarrito();
    }
  }

  actualizarTotalCarrito(): void {
    this.totalCarrito = this.carrito.reduce((total, p) => total + (p.cantidad || 0), 0);
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
}