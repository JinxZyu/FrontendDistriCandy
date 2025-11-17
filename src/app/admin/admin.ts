import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

// Importar los componentes hijos disponibles
import { ProveedorComponent } from './proveedor/proveedor';
// TODO: Descomentar cuando estén creados los siguientes componentes:
// import { ProductoComponent } from './producto/producto';
// import { BodegaComponent } from './bodega/bodega';
// import { VentaComponent } from './venta/venta';
// import { InventarioComponent } from './inventario/inventario';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [
    CommonModule,
    ProveedorComponent,
    // ProductoComponent,
    // BodegaComponent,
    // VentaComponent,
    // InventarioComponent,
  ],
  templateUrl: './admin.html',
  styleUrls: ['./admin.css']
})
export class AdminComponent implements OnInit {
  selectedView: string = '';
  adminName: string = 'Administrador';
  adminRole: string = 'Administrador';

  constructor(private router: Router) {}

  ngOnInit(): void {
    // Cargar información del usuario desde localStorage si existe
    const userData = localStorage.getItem('user');
    if (userData) {
      const user = JSON.parse(userData);
      this.adminName = user.nombre || 'Administrador';
      this.adminRole = user.rol || 'Administrador';
    }
  }

  // Método para cambiar de vista (SOLO cambia la vista, NO navega)
  changeView(view: string): void {
    this.selectedView = view;
  }

  // Método para cerrar sesión
  cerrarSesion(): void {
    // Limpiar datos de sesión
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('rol');
    
    // Redirigir al login/autorización
    this.router.navigate(['/autorizacion']);
  }

  // Método auxiliar para verificar si hay una vista activa
  hasActiveView(): boolean {
    return this.selectedView !== '';
  }
}