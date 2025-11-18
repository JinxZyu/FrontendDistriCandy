import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { UsuarioService } from '../services/usuario/usuario';
import { FormsModule, NgForm } from '@angular/forms';

@Component({
  selector: 'app-autorizacion',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './autorizacion.html',
  styleUrl: './autorizacion.css'
})
export class AutorizacionComponent {
  mostrarRegistro = false;
  cargando = false;

  mostrarNotificacion = false;
  tipoNotificacion: 'success' | 'error' | 'warning' = 'success';
  mensajeNotificacion = '';

  mostrarModalRecuperacion = false;
  pasoRecuperacion = 1;
  correoRecuperacion = '';
  codigoRecuperacion = '';
  nuevaClaveRecuperacion = '';
  confirmarClaveRecuperacion = '';

  loginData = {
    correo: '',
    clave: ''  
  };

  registroData = {
    nombre: '',        
    apellido: '',        
    tipo_documento: '',  
    identificacion: '',  
    celular: '',      
    correo: '',        
    clave: ''            
  };

  constructor(
    private router: Router,
    private usuarioService: UsuarioService
  ) {}

  mostrarLogin(): void {
    this.mostrarRegistro = false;
  }

  mostrarFormularioRegistro(): void {
    this.mostrarRegistro = true;
  }

  mostrarNotif(tipo: 'success' | 'error' | 'warning', mensaje: string): void {
    this.tipoNotificacion = tipo;
    this.mensajeNotificacion = mensaje;
    this.mostrarNotificacion = true;
   
    setTimeout(() => {
      this.mostrarNotificacion = false;
    }, 5000);
  }

  cerrarNotificacion(): void {
    this.mostrarNotificacion = false;
  }

  onLogin(form: NgForm): void {
    if (this.cargando) return;
   
    Object.keys(form.controls).forEach(key => {
      form.controls[key].markAsTouched();
    });
   
    if (form.invalid || !this.loginData.correo || !this.loginData.clave) {
      this.mostrarNotif('warning', 'Por favor completa todos los campos obligatorios correctamente');
      return;
    }

    this.cargando = true;
   
    this.usuarioService.iniciarSesion(this.loginData).subscribe({
      next: (respuesta: any) => {
        this.cargando = false;
       
        if (respuesta.exito) {
          this.mostrarNotif('success', '¡Bienvenido!');
         
          setTimeout(() => {
            if (this.usuarioService.esAdmin()) {
              this.router.navigate(['/admin']);
            } else {
              this.router.navigate(['/tienda']);
            }
          }, 1000);
        } else {
          if (respuesta.bloqueado) {
            this.mostrarNotif('error', 'Tu cuenta ha sido bloqueada. Contacta al administrador.');
          } else {
            this.mostrarNotif('error', respuesta.error || 'Error al iniciar sesión');
          }
        }
      },
      error: (error: any) => {
        this.cargando = false;
        this.mostrarNotif('error', 'Error al conectar con el servidor. Verifica que el backend esté corriendo.');
      }
    });
  }

  onRegistro(form: NgForm): void {
    if (this.cargando) return;
   
    Object.keys(form.controls).forEach(key => {
      form.controls[key].markAsTouched();
    });
   
    if (form.invalid) {
      this.mostrarNotif('warning', 'Por favor completa todos los campos obligatorios correctamente');
      return;
    }

    this.cargando = true;

    this.usuarioService.registrarCliente(this.registroData).subscribe({
      next: (respuesta: any) => {
        this.cargando = false;
       
        if (respuesta.exito) {
          this.mostrarNotif('success', '¡Registro exitoso! Ahora puedes iniciar sesión.');
         
          form.reset();
          this.registroData = {
            nombre: '',
            apellido: '',
            tipo_documento: '',
            identificacion: '',
            celular: '',
            correo: '',
            clave: ''
          };
         
          setTimeout(() => {
            this.mostrarLogin();
          }, 2000);
        } else {
          const errorMsg = respuesta.error?.toLowerCase() || '';
         
          if (errorMsg.includes('correo') || errorMsg.includes('email')) {
            this.mostrarNotif('error', 'Este correo electrónico ya está registrado. Intenta iniciar sesión o usa otro correo.');
          } else if (errorMsg.includes('identificacion') || errorMsg.includes('documento')) {
            this.mostrarNotif('error', 'Esta identificación ya está registrada. Verifica tus datos o contacta al administrador.');
          } else if (errorMsg.includes('celular') || errorMsg.includes('teléfono')) {
            this.mostrarNotif('error', 'Este número de celular ya está registrado.');
          } else if (errorMsg.includes('ya existe') || errorMsg.includes('duplicado')) {
            this.mostrarNotif('error', 'Ya existe una cuenta con estos datos. Intenta iniciar sesión.');
          } else {
            this.mostrarNotif('error', respuesta.error || 'Error al registrar usuario');
          }
        }
      },
      error: (error: any) => {
        this.cargando = false;
       
        if (error.status === 400) {
          const errorMsg = error.error?.error || error.error?.message || '';
         
          if (errorMsg.toLowerCase().includes('correo') || errorMsg.toLowerCase().includes('email')) {
            this.mostrarNotif('error', 'Este correo electrónico ya está registrado.');
          } else if (errorMsg.toLowerCase().includes('identificacion')) {
            this.mostrarNotif('error', 'Esta identificación ya está registrada.');
          } else {
            this.mostrarNotif('error', 'Datos inválidos. Verifica que no estés registrado previamente.');
          }
        } else if (error.status === 0) {
          this.mostrarNotif('error', 'Error al conectar con el servidor. Verifica que el backend esté corriendo.');
        } else {
          this.mostrarNotif('error', 'Error al registrar usuario. Intenta nuevamente.');
        }
      }
    });
  }

  olvidoClave(): void {
    this.mostrarModalRecuperacion = true;
    this.pasoRecuperacion = 1;
    this.correoRecuperacion = '';
    this.codigoRecuperacion = '';
    this.nuevaClaveRecuperacion = '';
    this.confirmarClaveRecuperacion = '';
  }

  cerrarModalRecuperacion(): void {
    this.mostrarModalRecuperacion = false;
    this.pasoRecuperacion = 1;
    this.correoRecuperacion = '';
    this.codigoRecuperacion = '';
    this.nuevaClaveRecuperacion = '';
    this.confirmarClaveRecuperacion = '';
  }

  solicitarCodigoRecuperacion(form: NgForm): void {
    if (this.cargando) return;
   
    Object.keys(form.controls).forEach(key => {
      form.controls[key].markAsTouched();
    });
   
    if (form.invalid || !this.correoRecuperacion) {
      this.mostrarNotif('warning', 'Por favor ingresa un correo electrónico válido');
      return;
    }
    this.cargando = true;
   
    this.usuarioService.solicitarCodigoRecuperacion(this.correoRecuperacion).subscribe({
      next: (respuesta) => {
        this.cargando = false;
       
        if (respuesta.exito) {
          this.mostrarNotif('success', '¡Código enviado! Revisa tu correo');
          this.pasoRecuperacion = 2;
        } else {
          this.mostrarNotif('error', respuesta.error || 'Error al enviar código');
        }
      },
      error: (error) => {
        this.cargando = false;
        this.mostrarNotif('error', error.error?.error || 'Error al solicitar código');
      }
    });
  }

  restablecerConCodigo(form: NgForm): void {
    if (this.cargando) return;
   
    Object.keys(form.controls).forEach(key => {
      form.controls[key].markAsTouched();
    });
   
    if (form.invalid) {
      this.mostrarNotif('warning', 'Por favor completa todos los campos');
      return;
    }
   
    if (this.nuevaClaveRecuperacion !== this.confirmarClaveRecuperacion) {
      this.mostrarNotif('error', 'Las contraseñas no coinciden');
      return;
    }
   
    if (this.nuevaClaveRecuperacion.length < 6) {
      this.mostrarNotif('error', 'La contraseña debe tener al menos 6 caracteres');
      return;
    }

    this.cargando = true;
   
    this.usuarioService.restablecerContrasena(
      this.correoRecuperacion,
      this.codigoRecuperacion,
      this.nuevaClaveRecuperacion
    ).subscribe({
      next: (respuesta) => {
        this.cargando = false;
       
        if (respuesta.exito) {
          this.mostrarNotif('success', '¡Contraseña actualizada exitosamente!');
          this.cerrarModalRecuperacion();
        } else {
          this.mostrarNotif('error', respuesta.error || 'Error al restablecer');
        }
      },
      error: (error) => {
        this.cargando = false;
        const errorMsg = error.error?.error || '';
        if (errorMsg.includes('código') || errorMsg.includes('Código')) {
          this.mostrarNotif('error', 'Código inválido o expirado');
        } else {
          this.mostrarNotif('error', errorMsg || 'Error al restablecer contraseña');
        }
      }
    });
  }

  volverPasoAnterior(): void {
    if (this.pasoRecuperacion === 2) {
      this.pasoRecuperacion = 1;
      this.codigoRecuperacion = '';
      this.nuevaClaveRecuperacion = '';
      this.confirmarClaveRecuperacion = '';
    }
  }
}
