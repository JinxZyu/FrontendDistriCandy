import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';


import { ProveedorComponent } from './proveedor/proveedor';
import { BodegaComponent } from './bodega/bodega';
import { UsuarioService } from '../services/usuario/usuario';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [
    CommonModule,
    ProveedorComponent,
    BodegaComponent
  ],
  templateUrl: './admin.html',
  styleUrls: ['./admin.css']
})
export class AdminComponent implements OnInit {
  selectedView: string = '';
  adminName: string = 'Administrador';
  adminRole: string = 'Administrador';

  constructor(
    private router: Router,
    private usuarioService: UsuarioService
  ) {}

  ngOnInit(): void {
    if (!this.usuarioService.estaAutenticado()) {
      this.cerrarSesion();
      return;
    }

    if (!this.usuarioService.esAdmin()) {
      this.mostrarNotif('error', 'No tienes permisos de administrador');
      setTimeout(() => {
        this.cerrarSesion();
      }, 2000);
      return;
    }

    const usuario = this.usuarioService.obtenerUsuario();
    if (usuario) {
      this.adminName = usuario.nombre_completo || 'Administrador';
      this.adminRole = 'Administrador';
    }
  }


  changeView(view: string): void {
    this.selectedView = view;
  }

  private mostrarNotif(tipo: 'success' | 'error' | 'warning', mensaje: string): void {
    console.log(`[${tipo.toUpperCase()}] ${mensaje}`);
    alert(`[${tipo.toUpperCase()}] ${mensaje}`); 
  }

  cerrarSesion(): void {
    this.usuarioService.cerrarSesion();
    localStorage.clear();
    sessionStorage.clear();

    setTimeout(() => {
      window.location.href = '/autorizacion';
    }, 100);
  }


  hasActiveView(): boolean {
    return this.selectedView !== '';
  }
}