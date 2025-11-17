import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { UsuarioService } from '../services/usuario/usuario';

@Component({
  selector: 'app-tienda',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './productos.html',
  styleUrl: './productos.css'
})
export class TiendaComponent {
  nombreUsuario: string = '';

  constructor(
    private router: Router,
    private usuarioService: UsuarioService
  ) {
    const usuario = this.usuarioService.obtenerUsuario();
    this.nombreUsuario = usuario?.nombre_completo || 'Usuario';
  }

  cerrarSesion(): void {
    this.usuarioService.cerrarSesion();
    this.router.navigate(['/autorizacion']);
  }
}