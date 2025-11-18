import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { UsuarioService } from '../services/usuario/usuario';
import { OrdenVentaService, OrdenVentaRequest, DetalleVentaRequest } from '../services/ordenVenta/orden-venta';
import { TransaccionService, TransaccionRequest } from '../services/transaccion/transaccion';
import { BancoService, Banco } from '../services/banco/banco';
import { FranquiciaService, Franquicia } from '../services/franquicia/franquicia';
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
  costoEnvio: number;
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
  pantallaActual: 'checkout' | 'pse' | 'credito' | 'exito' = 'checkout';
  metodoPagoSeleccionado: 'credito' | 'pse' | '' = '';
  tarjetaCreditoForm!: FormGroup;
  pseForm!: FormGroup;
  resumen: ResumenCompra = {
    productos: [],
    subtotal: 0,
    descuentoTotal: 0,
    costoEnvio: 5000, 
    total: 0
  };
  isLoading: boolean = false;
  errorMessage: string | null = null;
  idOrdenVenta: number | null = null;
  idCliente: number | null = null;
  idTipoCliente: number = 1; 
  tiposCliente = [
    { id: 1, nombre: 'Natural', descripcion: 'Persona natural' },
    { id: 2, nombre: 'Jurídico', descripcion: 'Persona jurídica/empresa' }
  ];

  tipoTarjetaDetectada: 'visa' | 'mastercard' | 'amex' | 'desconocida' = 'desconocida';
  longitudMaxCvv: number = 3;
  placeholderCvv: string = '123';
  bancos: Banco[] = [];
  franquicias: Franquicia[] = [];
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

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private usuarioService: UsuarioService,
    private ordenVentaService: OrdenVentaService,
    private transaccionService: TransaccionService,
    private bancoService: BancoService,
    private franquiciaService: FranquiciaService
  ) {}

  ngOnInit(): void {
    this.inicializarFormularios();
    this.cargarDatosCarrito();
    this.obtenerIdCliente();
    this.cargarBancos();
    this.cargarFranquicias();
  }

  inicializarFormularios(): void {
    this.tarjetaCreditoForm = this.fb.group({
      nombreTitular: ['', [Validators.required, Validators.pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)]],
      numeroTarjeta: ['', [Validators.required, Validators.minLength(15)]],
      cvv: ['', [Validators.required, Validators.pattern(/^[0-9]{3,4}$/)]],
      tipoDocumento: ['', Validators.required],  
      documento: ['', [Validators.required, Validators.pattern(/^[0-9]+$/)]],
      idFranquicia: ['', Validators.required],
      mesVencimiento: ['', Validators.required],
      anioVencimiento: ['', Validators.required]
    });

    this.pseForm = this.fb.group({
      nombres: ['', [Validators.required, Validators.pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)]],
      apellidos: ['', [Validators.required, Validators.pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)]],
      tipoDocumento: ['', Validators.required],  
      documento: ['', [Validators.required, Validators.pattern(/^[0-9]+$/)]],
      idBanco: ['', Validators.required]
    });
  }

  cargarBancos(): void {
    this.bancoService.obtenerBancosActivos().subscribe({
      next: (bancos) => {
        this.bancos = bancos;
      },
      error: (error) => {
        console.error('Error al cargar bancos:', error);
        this.errorMessage = 'Error al cargar lista de bancos';
      }
    });
  }

  cargarFranquicias(): void {
    this.franquiciaService.obtenerFranquiciasActivas().subscribe({
      next: (franquicias) => {
        this.franquicias = franquicias;
      },
      error: (error) => {
        this.errorMessage = 'Error al cargar lista de franquicias';
      }
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

    this.resumen.total = this.resumen.subtotal - this.resumen.descuentoTotal + this.resumen.costoEnvio;
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
    this.idCliente = this.usuarioService.obtenerId();
    
    if (!this.idCliente) {
      this.errorMessage = 'No se pudo identificar al cliente. Por favor inicia sesión nuevamente.';
    }
  }

  seleccionarMetodoPago(tipo: 'credito' | 'pse'): void {
    this.metodoPagoSeleccionado = tipo;
    this.errorMessage = null;
    if (tipo === 'credito') {
      this.pseForm.reset();
      this.pseForm.markAsUntouched();
      this.pseForm.markAsPristine();
      this.idTipoCliente = 1; 
    } else {
      this.tarjetaCreditoForm.reset();
      this.tarjetaCreditoForm.markAsUntouched();
      this.tarjetaCreditoForm.markAsPristine();
      this.idTipoCliente = 1; 
    }
  }

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

  finalizarCompra(): void {
    if (!this.metodoPagoSeleccionado) {
      this.errorMessage = 'Por favor selecciona un método de pago';
      return;
    }

    if (this.metodoPagoSeleccionado === 'credito') {
      this.marcarCamposComoTocados(this.tarjetaCreditoForm);
      if (this.tarjetaCreditoForm.invalid) {
        console.log('Formulario tarjeta inválido:');
        Object.keys(this.tarjetaCreditoForm.controls).forEach(key => {
          const control = this.tarjetaCreditoForm.get(key);
          if (control?.invalid) {
            console.log(`- ${key}: ${control.errors}`);
          }
        });
        this.errorMessage = 'Por favor completa todos los campos correctamente';
        return;
      }
    }

    if (this.metodoPagoSeleccionado === 'pse') {
      this.marcarCamposComoTocados(this.pseForm);
      if (this.pseForm.invalid) {
        Object.keys(this.pseForm.controls).forEach(key => {
          const control = this.pseForm.get(key);
          if (control?.invalid) {
            console.log(`- ${key}: ${control.errors}`);
          }
        });
        this.errorMessage = 'Por favor completa todos los campos correctamente';
        return;
      }
    }

    if (!this.idCliente) {
      this.errorMessage = 'No se pudo identificar al cliente';
      return;
    }

    this.isLoading = true;
    this.errorMessage = null;
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
        this.idOrdenVenta = ordenCreada.idVenta; 
        if (this.metodoPagoSeleccionado === 'pse') {
          this.simularPSE();
        } else {
          this.simularRedireccionBanco();
        }
      },
      error: (error) => {
        this.errorMessage = error.error?.message || 'Error al crear la orden de venta';
        this.isLoading = false;
      }
    });
  }

  private simularRedireccionBanco(): void {
    this.pantallaActual = 'credito';
    const formValue = this.tarjetaCreditoForm.value;

    setTimeout(() => {
      if (!this.idOrdenVenta) {
        this.errorMessage = 'Error: No se pudo crear la orden de venta';
        this.pantallaActual = 'checkout';
        this.isLoading = false;
        return;
      }

      const transaccionRequest: TransaccionRequest = {
        id_venta: this.idOrdenVenta,
        id_metodo_pago: 2, 
        id_tipo_cliente: 1, 
        id_franquicia: Number(formValue.idFranquicia), 
        tipo_documento: formValue.tipoDocumento, 
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
          this.errorMessage = error.error?.error || 'Error al procesar el pago';
          this.pantallaActual = 'checkout';
          this.isLoading = false;
        }
      });
    }, 3000);
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
        id_metodo_pago: 1, 
        id_tipo_cliente: this.idTipoCliente,
        id_banco: Number(formValue.idBanco), 
        tipo_documento: formValue.tipoDocumento,  
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