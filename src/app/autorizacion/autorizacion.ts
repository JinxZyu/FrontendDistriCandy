import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { UsuarioService } from '../services/usuario/usuario'; 
import { FormsModule, NgForm } from '@angular/forms';
import { provideHttpClient } from '@angular/common/http';

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

  // Variables para notificaciones
  mostrarNotificacion = false;
  tipoNotificacion: 'success' | 'error' | 'warning' = 'success';
  mensajeNotificacion = '';

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
    private usuarioService: UsuarioService,
    private http: HttpClient  
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
          this.mostrarNotif('success', '¡Bienvenido! Redirigiendo...');
          
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
    
    console.log('📝 Datos de registro:', this.registroData);
    this.cargando = true;
    
    const urlRegistro = 'http://localhost:8093/DistriCandy/usuario/registro';
    
    this.http.post<any>(urlRegistro, this.registroData).subscribe({
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
          this.mostrarNotif('error', 'Error al conectar con el servidor.');
        } else {
          this.mostrarNotif('error', 'Error al registrar usuario. Intenta nuevamente.');
        }
      }
    });
  }

  olvidoClave(): void {
    console.log('🔑 Recuperar contraseña');
    this.mostrarNotif('warning', 'Función de recuperación de contraseña próximamente');
  }

  verTerminos(): void {
    console.log('📄 Ver términos y condiciones');
    this.mostrarNotif('warning', 'Términos y condiciones próximamente');
  }
}