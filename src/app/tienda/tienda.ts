import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { UsuarioService } from '../services/usuario/usuario';
import { ProductoService, Producto } from '../services/producto/producto';
import { CategoriaService, Categoria } from '../services/categoria/categoria';

interface ProductoTienda extends Producto {
  cantidad?: number;
}

@Component({
  selector: 'app-tienda',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './tienda.html',
  styleUrl: './tienda.css'
})
export class TiendaComponent implements OnInit {
  nombreUsuario: string = '';
  cargando: boolean = false;
  busqueda: string = '';
  mostrarNotificacion = false;
  tipoNotificacion: 'success' | 'error' | 'warning' = 'success';
  mensajeNotificacion = '';
  productos: ProductoTienda[] = [];
  productosFiltrados: ProductoTienda[] = [];
  categorias: Categoria[] = [];
  carrito: ProductoTienda[] = [];
  totalCarrito: number = 0;
  currentSlides: { [key: string]: number } = {};
  cardsPerView: number = 3;

  dropdownCategorias: boolean = false;

  constructor(
    private router: Router,
    private usuarioService: UsuarioService,
    private productoService: ProductoService,
    private categoriaService: CategoriaService,
    private cdr: ChangeDetectorRef
  ) {
    const usuario = this.usuarioService.obtenerUsuario();
    this.nombreUsuario = usuario?.nombre_completo || 'Usuario';
  }

  ngOnInit(): void {
    this.cargarCategorias();
    this.cargarProductos();
    this.cargarCarrito();
    this.updateCardsPerView();
    window.addEventListener('resize', this.updateCardsPerView.bind(this));
  }

  ngOnDestroy(): void {
    window.removeEventListener('resize', this.updateCardsPerView.bind(this));
  }

  cargarCategorias(): void {
    this.categoriaService.obtenerActivas().subscribe({
      next: (categorias) => {
        this.categorias = categorias;
        this.categorias.forEach(cat => {
          if (cat.idCategoria) {
            this.currentSlides[`categoria-${cat.idCategoria}`] = 0;
          }
        });
        console.log('✅ Categorías cargadas:', categorias);
      },
      error: (error) => {
        this.mostrarNotif('error', 'Error al cargar categorías');
      }
    });
  }

  cargarProductos(): void {
    this.cargando = true;
    this.productoService.obtenerProductosActivos().subscribe({
      next: (productos) => {
        this.productos = productos.map(p => ({
          ...p,
          cantidad: 1
        }));
        
        this.productosFiltrados = [...this.productos];
        this.currentSlides['descuentos'] = 0;
        this.cargando = false;
      },
      error: (error) => {
        this.cargando = false;
        this.mostrarNotif('error', 'Error al cargar productos');
      }
    });
  }

  getProductosPorCategoria(idCategoria: number): ProductoTienda[] {
    const productosFiltrados = this.busqueda.trim() 
      ? this.aplicarFiltroBusqueda(this.productos)
      : this.productos;

    return productosFiltrados.filter(p => 
      p.categorias?.some(cat => cat.idCategoria === idCategoria)
    );
  }

  private aplicarFiltroBusqueda(productos: ProductoTienda[]): ProductoTienda[] {
    if (!this.busqueda.trim()) {
      return productos;
    }

    const busquedaLower = this.busqueda.trim().toLowerCase();
    
    return productos.filter(p => {
      const nombre = (p.nombre || '').toLowerCase();
      const descripcion = (p.descripcion || '').toLowerCase();
      const referencia = (p.referencia || '').toLowerCase();
      
      return nombre.includes(busquedaLower) || 
             descripcion.includes(busquedaLower) || 
             referencia.includes(busquedaLower);
    });
  }

  filtrarPorBusqueda(): void {
    Object.keys(this.currentSlides).forEach(key => {
      this.currentSlides[key] = 0;
    });
    
    this.productosFiltrados = this.aplicarFiltroBusqueda(this.productos); 
    this.cdr.markForCheck();
    this.cdr.detectChanges();
  }

  getProductosConDescuento(): ProductoTienda[] {
    const productosFiltrados = this.busqueda.trim() 
      ? this.aplicarFiltroBusqueda(this.productos)
      : this.productos;

    const productosConDescuento = productosFiltrados.filter(p => 
      p.valorDescuento && p.valorDescuento > 0
    );

    return productosConDescuento.sort((a, b) => 
      (b.valorDescuento || 0) - (a.valorDescuento || 0)
    );
  }

  categoriaHasProductos(idCategoria: number): boolean {
    return this.getProductosPorCategoria(idCategoria).length > 0;
  }

  updateCardsPerView(): void {
    const oldValue = this.cardsPerView;
    
    if (window.innerWidth <= 768) {
      this.cardsPerView = 1;
    } else if (window.innerWidth <= 1024) {
      this.cardsPerView = 2;
    } else {
      this.cardsPerView = 3;
    }
    
    if (oldValue !== this.cardsPerView) {
      Object.keys(this.currentSlides).forEach(key => {
        this.currentSlides[key] = 0;
      });
    }
  }

  getCarouselTransform(carousel: string): string {
    const cardWidth = 310; 
    const currentSlide = this.currentSlides[carousel] || 0;
    const translateX = -currentSlide * cardWidth;
    return `translateX(${translateX}px)`;
  }

  prevSlide(carousel: string): void {
    const current = this.currentSlides[carousel] || 0;
    if (current > 0) {
      this.currentSlides[carousel] = current - 1;
    }
  }

  nextSlide(carousel: string): void {
    const current = this.currentSlides[carousel] || 0;
    const maxSlide = this.getMaxSlides(carousel);
    if (current < maxSlide) {
      this.currentSlides[carousel] = current + 1;
    }
  }

  getMaxSlides(carousel: string): number {
    let productos: ProductoTienda[] = [];
    
    if (carousel === 'descuentos') {
      productos = this.getProductosConDescuento();
    } else {
      const idCategoria = parseInt(carousel.split('-')[1]);
      productos = this.getProductosPorCategoria(idCategoria);
    }
    
    return Math.max(0, productos.length - this.cardsPerView);
  }

  isPrevDisabled(carousel: string): boolean {
    return (this.currentSlides[carousel] || 0) === 0;
  }

  isNextDisabled(carousel: string): boolean {
    const current = this.currentSlides[carousel] || 0;
    return current >= this.getMaxSlides(carousel);
  }

  getCurrentSlide(carousel: string): number {
    return this.currentSlides[carousel] || 0;
  }

  getIndicators(carousel: string): number[] {
    const maxSlides = this.getMaxSlides(carousel);
    const totalIndicators = maxSlides + 1;
    return Array(totalIndicators).fill(0).map((_, i) => i);
  }

  goToSlide(carousel: string, index: number): void {
    this.currentSlides[carousel] = index;
  }

  navegarACategoria(idCategoria: number): void {
    const targetId = `carousel-categoria-${idCategoria}`;
    const element = document.getElementById(targetId);
    if (element) {
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
        inline: 'nearest'
      });
      this.dropdownCategorias = false;
      this.resaltarCarousel(targetId);
    }
  }

  private resaltarCarousel(targetId: string): void {
    setTimeout(() => {
      const element = document.getElementById(targetId);
      if (element) {
        element.classList.add('highlighted');
        setTimeout(() => {
          element.classList.remove('highlighted');
        }, 2000);
      }
    }, 50);
  }

  toggleDropdownCategorias(): void {
    this.dropdownCategorias = !this.dropdownCategorias;
  }

  calcularPrecioConDescuento(producto: ProductoTienda): number {
    if (!producto.valorDescuento || producto.valorDescuento <= 0) {
      return producto.precioUnitario;
    }

    const porcentajeDescuento = Math.min(producto.valorDescuento, 100);
    const factorDescuento = porcentajeDescuento / 100;
    const montoDescuento = producto.precioUnitario * factorDescuento;
    const precioFinal = Math.max(0, producto.precioUnitario - montoDescuento);
    
    return Math.round(precioFinal);
  }
  
  obtenerPorcentajeDescuento(producto: ProductoTienda): number {
    if (!producto.valorDescuento || producto.valorDescuento <= 0) {
      return 0;
    }
  
    return Math.round(producto.valorDescuento);
  }

  getCantidad(producto: ProductoTienda): number {
    return producto.cantidad || 1;
  }

  aumentarCantidad(producto: ProductoTienda): void {
    if (!producto.cantidad) producto.cantidad = 1;
    if (producto.cantidad < (producto.existencia || 0)) {
      producto.cantidad++;
    }
  }

  disminuirCantidad(producto: ProductoTienda): void {
    if (!producto.cantidad) producto.cantidad = 1;
    if (producto.cantidad > 1) {
      producto.cantidad--;
    }
  }

  agregarAlCarrito(producto: ProductoTienda): void {
    if ((producto.existencia || 0) === 0) {
      this.mostrarNotif('error', 'Producto agotado');
      return;
    }

    const cantidad = producto.cantidad || 1;
    const index = this.carrito.findIndex(p => p.idProducto === producto.idProducto);
    
    if (index !== -1) {
      this.carrito[index].cantidad = (this.carrito[index].cantidad || 0) + cantidad;
    } else {
      this.carrito.push({...producto, cantidad});
    }

    this.guardarCarrito();
    this.actualizarTotalCarrito();
    this.mostrarNotif('success', `${producto.nombre} agregado al carrito`);
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