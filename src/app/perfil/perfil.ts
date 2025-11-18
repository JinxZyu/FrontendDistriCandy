import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { PerfilService, ActualizarPerfilRequest, ActualizarClienteRequest, CambiarClaveRequest } from '../services/perfil/perfil';
import { UsuarioService } from '../services/usuario/usuario';

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './perfil.html',
  styleUrl: './perfil.css'
})
export class PerfilComponent implements OnInit {
  perfilForm!: FormGroup;
  ubicacionForm!: FormGroup;
  cambiarClaveForm!: FormGroup;
  editandoPerfil = false;
  editandoUbicacion = false;
  cambiandoClave = false;
  cargando = true;
  idUsuario: number | null = null;
  correoUsuario: string = '';
  mostrarNotificacion = false;
  mensajeNotificacion = '';
  tipoNotificacion: 'success' | 'error' = 'success';

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private perfilService: PerfilService,
    private usuarioService: UsuarioService
  ) {}

  ngOnInit(): void {
    this.inicializarFormularios();
    this.idUsuario = this.usuarioService.obtenerId();
    
    if (this.idUsuario) {
      this.cargarPerfil();
    } else {
      this.cargando = false;
    }
  }

  inicializarFormularios(): void {
    this.perfilForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(2)]],
      apellido: ['', [Validators.required, Validators.minLength(2)]],
      celular: ['', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]],
      username: [''],
      correo_usuario: [{ value: '', disabled: true }],
      tipo_documento: [{ value: '', disabled: true }],
      identificacion: [{ value: '', disabled: true }]
    });


    this.ubicacionForm = this.fb.group({
      pais: [''],
      departamento: [''],
      ciudad: [''],
      barrio: [''],
      direccion: [''],
      informacion_adicional: [''] 
    });

    this.cambiarClaveForm = this.fb.group({
      claveActual: ['', [Validators.required, Validators.minLength(6)]],
      nuevaClave: ['', [Validators.required, Validators.minLength(6)]],
      confirmarClave: ['', [Validators.required]]
    }, { 
      validators: this.validarClavesCoinciden 
    });
  }

  validarClavesCoinciden(control: AbstractControl): ValidationErrors | null {
    const nuevaClave = control.get('nuevaClave');
    const confirmarClave = control.get('confirmarClave');

    if (!nuevaClave || !confirmarClave) {
      return null;
    }

    return nuevaClave.value === confirmarClave.value ? null : { clavesNoCoinciden: true };
  }

  cargarPerfil(): void {
    if (!this.idUsuario) return;
    this.perfilService.obtenerPerfilCompleto(this.idUsuario).subscribe({
      next: (response) => {
        if (response.exito && response.perfil) {
          const perfil = response.perfil;
          this.perfilForm.patchValue({
            nombre: perfil.nombre,
            apellido: perfil.apellido,
            celular: perfil.celular,
            username: perfil.username,
            correo_usuario: perfil.correo_usuario,
            tipo_documento: perfil.tipo_documento,
            identificacion: perfil.identificacion
          });
          this.correoUsuario = perfil.correo_usuario;
          this.ubicacionForm.patchValue({
            pais: perfil.pais || '',
            departamento: perfil.departamento || '',
            ciudad: perfil.ciudad || '',
            barrio: perfil.barrio || '',
            direccion: perfil.direccion || '',
            informacion_adicional: perfil.informacion_adicional || ''
          });

          this.cargando = false;
        } else {
          this.mostrarNoti('Error al cargar el perfil', 'error');
          this.cargando = false;
        }
      },
      error: (error) => {
        this.mostrarNoti('Error al cargar el perfil', 'error');
        this.cargando = false;
      }
    });
  }

  toggleEditarPerfil(): void {
    if (this.editandoPerfil) {
      this.cargarPerfil();
    }
    this.editandoPerfil = !this.editandoPerfil;
  }

  toggleEditarUbicacion(): void {
    if (this.editandoUbicacion) {
      this.cargarPerfil();
    }
    this.editandoUbicacion = !this.editandoUbicacion;
  }

  toggleCambiarClave(): void {
    if (this.cambiandoClave) {
      this.cambiarClaveForm.reset();
    }
    this.cambiandoClave = !this.cambiandoClave;
  }

  guardarPerfil(): void {
    if (this.perfilForm.invalid || !this.idUsuario) {
      this.mostrarNoti('Por favor completa todos los campos correctamente', 'error');
      return;
    }

    const datos: ActualizarPerfilRequest = {
      id_usuario: this.idUsuario,
      nombre: this.perfilForm.value.nombre,
      apellido: this.perfilForm.value.apellido,
      celular: this.perfilForm.value.celular,
      username: this.perfilForm.value.username
    };

    this.perfilService.actualizarPerfil(datos).subscribe({
      next: (response) => {
        if (response.exito) {
          this.mostrarNoti('¡Perfil actualizado exitosamente!', 'success');
          this.editandoPerfil = false;
          if (response.usuario) {
            this.usuarioService.actualizarDatosLocalStorage(response.usuario);
          }
        } else {
          this.mostrarNoti(response.error || 'No se pudo actualizar el perfil', 'error');
        }
      },
      error: (error) => {
        this.mostrarNoti('Error al actualizar el perfil', 'error');
      }
    });
  }

  guardarUbicacion(): void {
    if (!this.idUsuario) {
      this.mostrarNoti('No se encontró ID de usuario', 'error');
      return;
    }

    const datos: ActualizarClienteRequest = {
      id_usuario: this.idUsuario,
      pais: this.ubicacionForm.value.pais,
      departamento: this.ubicacionForm.value.departamento,
      ciudad: this.ubicacionForm.value.ciudad,
      barrio: this.ubicacionForm.value.barrio,
      direccion: this.ubicacionForm.value.direccion,
      informacion_adicional: this.ubicacionForm.value.informacion_adicional
    };

    this.perfilService.actualizarDatosCliente(datos).subscribe({
      next: (response) => {
        if (response.exito) {
          this.mostrarNoti('¡Ubicación actualizada exitosamente!', 'success');
          this.editandoUbicacion = false;
        } else {
          this.mostrarNoti(response.error || 'No se pudo actualizar la ubicación', 'error');
        }
      },
      error: (error) => {
        this.mostrarNoti('Error al actualizar la ubicación', 'error');
      }
    });
  }

  cambiarClave(): void {
    if (this.cambiarClaveForm.invalid) {
      this.mostrarNoti('Por favor completa todos los campos correctamente', 'error');
      return;
    }

    if (this.cambiarClaveForm.hasError('clavesNoCoinciden')) {
      this.mostrarNoti('Las contraseñas no coinciden', 'error');
      return;
    }

    const datos: CambiarClaveRequest = {
      correo_usuario: this.correoUsuario,
      clave_actual: this.cambiarClaveForm.value.claveActual,
      nueva_clave: this.cambiarClaveForm.value.nuevaClave
    };

    this.perfilService.cambiarClave(datos).subscribe({
      next: (response) => {
        if (response.exito) {
          this.mostrarNoti('¡Contraseña actualizada exitosamente!', 'success');
          this.cambiarClaveForm.reset();
          this.cambiandoClave = false;
        } else {
          this.mostrarNoti(response.error || 'No se pudo cambiar la contraseña', 'error');
        }
      },
      error: (error) => {
        this.mostrarNoti(error.error?.error || 'Error al cambiar la contraseña', 'error');
      }
    });
  }

  mostrarNoti(mensaje: string, tipo: 'success' | 'error'): void {
    this.mensajeNotificacion = mensaje;
    this.tipoNotificacion = tipo;
    this.mostrarNotificacion = true;

    setTimeout(() => {
      this.cerrarNotificacion();
    }, 5000);
  }

  cerrarNotificacion(): void {
    this.mostrarNotificacion = false;
  }

  irATienda(): void {
    this.router.navigate(['/tienda']);
  }

irAlCarrito(): void {
  const idUsuario = this.usuarioService.obtenerId();
  if (!idUsuario) {
    this.mostrarNoti('Debes iniciar sesión primero', 'error');
    return;
  }

  this.perfilService.obtenerPerfilCompleto(idUsuario).subscribe({
    next: (response) => {
      if (response.exito && response.perfil) {
        const perfil = response.perfil;
        if (!perfil.direccion || !perfil.ciudad || !perfil.departamento) {
          this.mensajeNotificacion = 'Por favor completa tu dirección de envío en "Mi Cuenta" antes de continuar con tu compra';
          this.tipoNotificacion = 'error';
          this.mostrarNotificacion = true;
          setTimeout(() => {
            this.cerrarNotificacion();
            this.router.navigate(['/perfil']);
          }, 3000);
          
          return;
        }
        this.router.navigate(['/carrito']);
      } else {
        this.router.navigate(['/carrito']);
      }
    },
    error: (error) => {
      console.error('Error al verificar dirección:', error);
      this.router.navigate(['/carrito']);
    }
  });
}

  cerrarSesion(): void {
    this.usuarioService.cerrarSesion();
    this.router.navigate(['/autorizacion']);
  }
}