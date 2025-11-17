import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-admin',
  imports: [RouterModule],
  templateUrl: './admin.html',
  styleUrl: './admin.css'
})
export class AdminComponent {
  title = 'ADMINISTRACION';
  
  menuItems = [
    { 
      id: 1, 
      label: '01. Producto', 
      route: '/admin/producto' 
    },
    { 
      id: 2, 
      label: '02. Proveedor', 
      route: '/admin/proveedor' 
    },
    { 
      id: 3, 
      label: '03. Bodega', 
      route: '/admin/bodega' 
    },
    { 
      id: 4, 
      label: '04. Detalles venta', 
      route: '/admin/detalles-venta' 
    }
  ];

  handleNavigation(route: string) {
    console.log(`Navegando a: ${route}`);
    alert(`Esta ruta te llevará a: ${route}`);
  }
}