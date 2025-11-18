import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { UsuarioService } from '../services/usuario/usuario';
import { OrdenVentaService, OrdenVentaRequest, DetalleVentaRequest } from '../services/ordenVenta/orden-venta';
import { TransaccionService, TransaccionRequest } from '../services/transaccion/transaccion';
import { FormatoPrecioPipe } from '../pipes/formato-precio-pipe';

interface ProductoCheckout {
  idProducto: number;
  nombre: string;
  precioUnitario: number;
  valorDescuento: number;
  cantidad: number;
  imagen?: string;
}

interface ResumenCompra {
  productos: ProductoCheckout[];
  subtotal: number;
  descuentoTotal: number;
  total: number;
}

@Component({
  selector: 'app-verificar',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormatoPrecioPipe],
  templateUrl: './verificar.html',
  styleUrl: './verificar.css'
})
export class VerificarComponent implements OnInit {
  // Estados de pantalla
  pantallaActual: 'checkout' | 'pse' | 'exito' | 'error' = 'checkout';
  
  // Método de pago seleccionado
  metodoPagoSeleccionado: 'credito' | 'pse' | '' = '';
  
  // Formularios
  tarjetaCreditoForm!: FormGroup;
  pseForm!: FormGroup;
  
  // Resumen de compra
  resumen: ResumenCompra = {
    productos: [],
    subtotal: 0,
    descuentoTotal: 0,
    total: 0
  };
  
  // Control de carga y errores
  isLoading: boolean = false;
  errorMessage: string | null = null;
  
  // Datos para transacción
  idOrdenVenta: number | null = null;
  idCliente: number | null = null;
  idTipoCliente: number = 1; // Por defecto: Natural (1)
  
  // Tipos de cliente
  tiposCliente = [
    { id: 1, nombre: 'Natural', descripcion: 'Persona natural' },
    { id: 2, nombre: 'Jurídico', descripcion: 'Persona jurídica/empresa' }
  ];
  
  // Detección de tipo de tarjeta
  tipoTarjetaDetectada: 'visa' | 'mastercard' | 'amex' | 'desconocida' = 'desconocida';
  longitudMaxCvv: number = 3;
  placeholderCvv: string = '123';
  
  // Selectores de fecha
  dias = Array.from({ length: 31 }, (_, i) => String(i + 1).padStart(2, '0'));
  meses = [
    { valor: '01', nombre: 'Enero' },
    { valor: '02', nombre: 'Febrero' },
    { valor: '03', nombre: 'Marzo' },
    { valor: '04', nombre: 'Abril' },
    { valor: '05', nombre: 'Mayo' },
    { valor: '06', nombre: 'Junio' },
    { valor: '07', nombre: 'Julio' },
    { valor: '08', nombre: 'Agosto' },
    { valor: '09', nombre: 'Septiembre' },
    { valor: '10', nombre: 'Octubre' },
    { valor: '11', nombre: 'Noviembre' },
    { valor: '12', nombre: 'Diciembre' }
  ];
  anioActual = new Date().getFullYear();
  anios = Array.from({ length: 11 }, (_, i) => this.anioActual + i);
  
  // Bancos PSE
  bancos = [
    'Bancolombia',
    'Banco de Bogotá',
    'Davivienda',
    'BBVA',
    'Banco Popular',
    'Banco AV Villas',
    'Colpatria',
    'Banco de Occidente',
    'Banco Caja Social',
    'Banco Agrario'
  ];

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private usuarioService: UsuarioService,
    private ordenVentaService: OrdenVentaService,
    private transaccionService: TransaccionService
  ) {}

  ngOnInit(): void {
    this.inicializarFormularios();
    this.cargarDatosCarrito();
    this.obtenerIdCliente();
  }

  inicializarFormularios(): void {
    this.tarjetaCreditoForm = this.fb.group({
      nombreTitular: ['', [Validators.required, Validators.pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)]],
      numeroTarjeta: ['', [Validators.required, Validators.minLength(15)]],
      cvv: ['', [Validators.required, Validators.pattern(/^[0-9]{3,4}$/)]],
      documento: ['', [Validators.required, Validators.pattern(/^[0-9]+$/)]],
      mesVencimiento: ['', Validators.required],
      anioVencimiento: ['', Validators.required]
    });

    this.pseForm = this.fb.group({
      nombres: ['', [Validators.required, Validators.pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)]],
      apellidos: ['', [Validators.required, Validators.pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)]],
      documento: ['', [Validators.required, Validators.pattern(/^[0-9]+$/)]],
      banco: ['', Validators.required]
    });
  }

  cargarDatosCarrito(): void {
    const carritoGuardado = localStorage.getItem('carrito');
    if (!carritoGuardado) {
      this.errorMessage = 'No hay productos en el carrito';
      setTimeout(() => this.router.navigate(['/carrito']), 2000);
      return;
    }

    try {
      const productos: ProductoCheckout[] = JSON.parse(carritoGuardado);
      this.resumen.productos = productos;
      this.calcularTotales();
    } catch (error) {
      console.error('Error al cargar carrito:', error);
      this.errorMessage = 'Error al cargar los datos del carrito';
    }
  }

  calcularTotales(): void {
    this.resumen.subtotal = 0;
    this.resumen.descuentoTotal = 0;

    this.resumen.productos.forEach(producto => {
      const precioOriginal = producto.precioUnitario * producto.cantidad;
      const descuento = this.calcularDescuentoProducto(producto) * producto.cantidad;
      
      this.resumen.subtotal += precioOriginal;
      this.resumen.descuentoTotal += descuento;
    });

    this.resumen.total = this.resumen.subtotal - this.resumen.descuentoTotal;
  }

  calcularDescuentoProducto(producto: ProductoCheckout): number {
    if (!producto.valorDescuento || producto.valorDescuento <= 0) {
      return 0;
    }
    
    const porcentaje = producto.valorDescuento <= 1 
      ? producto.valorDescuento 
      : producto.valorDescuento / 100;
    
    return producto.precioUnitario * porcentaje;
  }

  calcularPrecioConDescuento(producto: ProductoCheckout): number {
    return producto.precioUnitario - this.calcularDescuentoProducto(producto);
  }

  obtenerIdCliente(): void {
    // Usar el método obtenerId() del servicio que ya existe
    this.idCliente = this.usuarioService.obtenerId();
    
    if (!this.idCliente) {
      console.error('No se pudo obtener el ID del usuario');
      this.errorMessage = 'No se pudo identificar al cliente. Por favor inicia sesión nuevamente.';
    } else {
      console.log('ID Cliente obtenido:', this.idCliente);
    }
  }

  seleccionarMetodoPago(tipo: 'credito' | 'pse'): void {
    this.metodoPagoSeleccionado = tipo;
  }

  // Manejo de tarjeta de crédito
  alCambiarNumeroTarjeta(): void {
    const control = this.tarjetaCreditoForm.get('numeroTarjeta');
    if (!control) return;

    let valor = control.value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    this.tipoTarjetaDetectada = this.detectarTipoTarjeta(valor);

    let longitudMaxima = 16;
    this.longitudMaxCvv = 3;
    this.placeholderCvv = '123';

    if (this.tipoTarjetaDetectada === 'amex') {
      longitudMaxima = 15;
      this.longitudMaxCvv = 4;
      this.placeholderCvv = '1234';
    }

    if (valor.length > longitudMaxima) {
      valor = valor.substring(0, longitudMaxima);
    }

    const valorFormateado = valor.match(/.{1,4}/g)?.join(' ') || valor;
    control.setValue(valorFormateado, { emitEvent: false });

    // Actualizar validador CVV
    const cvvControl = this.tarjetaCreditoForm.get('cvv');
    if (cvvControl) {
      cvvControl.setValidators([
        Validators.required,
        Validators.pattern(`^[0-9]{${this.longitudMaxCvv}}$`)
      ]);
      cvvControl.updateValueAndValidity();
    }
  }

  alCambiarCvv(): void {
    const cvvControl = this.tarjetaCreditoForm.get('cvv');
    if (!cvvControl) return;

    let valor = (cvvControl.value || '').replace(/[^0-9]/gi, '');
    if (valor.length > this.longitudMaxCvv) {
      valor = valor.substring(0, this.longitudMaxCvv);
    }
    cvvControl.setValue(valor, { emitEvent: false });
  }

  private detectarTipoTarjeta(numero: string): 'visa' | 'mastercard' | 'amex' | 'desconocida' {
    if (numero.startsWith('4')) return 'visa';
    if (numero.startsWith('5') && parseInt(numero.charAt(1)) >= 1 && parseInt(numero.charAt(1)) <= 5) {
      return 'mastercard';
    }
    if (numero.startsWith('34') || numero.startsWith('37')) return 'amex';
    return 'desconocida';
  }

  esMarcaActiva(marca: string): boolean {
    return this.tipoTarjetaDetectada === marca;
  }

  // Proceso de finalizar compra
  finalizarCompra(): void {
    if (!this.metodoPagoSeleccionado) {
      this.errorMessage = 'Por favor selecciona un método de pago';
      return;
    }

    if (this.metodoPagoSeleccionado === 'credito') {
      this.marcarCamposComoTocados(this.tarjetaCreditoForm);
      if (this.tarjetaCreditoForm.invalid) {
        this.errorMessage = 'Por favor completa todos los campos de la tarjeta correctamente';
        return;
      }
    }

    if (this.metodoPagoSeleccionado === 'pse') {
      this.marcarCamposComoTocados(this.pseForm);
      if (this.pseForm.invalid) {
        this.errorMessage = 'Por favor completa todos los campos de PSE correctamente';
        return;
      }
    }

    if (!this.idCliente) {
      this.errorMessage = 'No se pudo identificar al cliente';
      return;
    }

    this.isLoading = true;
    this.errorMessage = null;

    // Paso 1: Crear orden de venta
    this.crearOrdenVenta();
  }

  private crearOrdenVenta(): void {
    const detalles: DetalleVentaRequest[] = this.resumen.productos.map(producto => ({
      id_producto: producto.idProducto,
      cantidad: producto.cantidad,
      precio: producto.precioUnitario,
      descuento: this.calcularDescuentoProducto(producto)
    }));

    const ordenRequest: OrdenVentaRequest = {
      id_cliente: this.idCliente!,
      detalle_ventas: detalles
    };

    this.ordenVentaService.crearOrdenVenta(ordenRequest).subscribe({
      next: (ordenCreada) => {
        console.log('Orden creada:', ordenCreada);
        this.idOrdenVenta = ordenCreada.idVenta;
        
        // Paso 2: Procesar transacción
        if (this.metodoPagoSeleccionado === 'pse') {
          this.simularPSE();
        } else {
          this.procesarTransaccion();
        }
      },
      error: (error) => {
        console.error('Error al crear orden:', error);
        this.errorMessage = error.error?.message || 'Error al crear la orden de venta';
        this.isLoading = false;
      }
    });
  }

  private procesarTransaccion(): void {
    if (!this.idOrdenVenta) {
      this.errorMessage = 'Error: No se pudo crear la orden de venta';
      this.isLoading = false;
      return;
    }

    const formValue = this.tarjetaCreditoForm.value;
    
    const transaccionRequest: TransaccionRequest = {
      id_venta: this.idOrdenVenta,
      id_metodo_pago: 1, // 1 = Tarjeta de crédito
      id_tipo_cliente: this.idTipoCliente, // Usar el tipo seleccionado
      franquicia: this.tipoTarjetaDetectada,
      identificacion: formValue.documento,
      valor_tx: this.resumen.total
    };

    this.transaccionService.procesarTransaccion(transaccionRequest).subscribe({
      next: (response) => {
        if (response.exito) {
          this.limpiarCarrito();
          this.mostrarExito();
        } else {
          this.errorMessage = response.error || 'Error al procesar la transacción';
          this.isLoading = false;
        }
      },
      error: (error) => {
        console.error('Error en transacción:', error);
        this.errorMessage = error.error?.error || 'Error al procesar el pago';
        this.isLoading = false;
      }
    });
  }

  private simularPSE(): void {
    this.pantallaActual = 'pse';
    const formValue = this.pseForm.value;

    setTimeout(() => {
      if (!this.idOrdenVenta) {
        this.errorMessage = 'Error: No se pudo crear la orden de venta';
        this.pantallaActual = 'checkout';
        this.isLoading = false;
        return;
      }

      const transaccionRequest: TransaccionRequest = {
        id_venta: this.idOrdenVenta,
        id_metodo_pago: 2, // 2 = PSE
        id_tipo_cliente: this.idTipoCliente, // Usar el tipo seleccionado
        banco: formValue.banco,
        identificacion: formValue.documento,
        valor_tx: this.resumen.total
      };

      this.transaccionService.procesarTransaccion(transaccionRequest).subscribe({
        next: (response) => {
          if (response.exito) {
            this.limpiarCarrito();
            this.mostrarExito();
          } else {
            this.errorMessage = response.error || 'Error al procesar la transacción';
            this.pantallaActual = 'checkout';
            this.isLoading = false;
          }
        },
        error: (error) => {
          console.error('Error en transacción PSE:', error);
          this.errorMessage = error.error?.error || 'Error al procesar el pago con PSE';
          this.pantallaActual = 'checkout';
          this.isLoading = false;
        }
      });
    }, 3000);
  }

  private limpiarCarrito(): void {
    localStorage.removeItem('carrito');
  }

  private mostrarExito(): void {
    this.pantallaActual = 'exito';
    this.isLoading = false;
    setTimeout(() => {
      this.router.navigate(['/tienda']);
    }, 3000);
  }

  private marcarCamposComoTocados(formulario: FormGroup): void {
    Object.values(formulario.controls).forEach(control => {
      control.markAsTouched();
      control.updateValueAndValidity();
    });
  }

  volverAtras(): void {
    this.router.navigate(['/carrito']);
  }

  irATienda(): void {
    this.router.navigate(['/tienda']);
  }
}