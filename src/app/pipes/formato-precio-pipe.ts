import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'formatoPrecio',
  standalone: true
})
export class FormatoPrecioPipe implements PipeTransform {
  transform(value: number | string | undefined | null): string {
    if (value === undefined || value === null || value === '') {
      return '0';
    }

    // Convertir a número si es string
    const numero = typeof value === 'string' ? parseFloat(value) : value;

    // Verificar si es un número válido
    if (isNaN(numero)) {
      return '0';
    }

    // Formatear con separador de miles (punto) y sin decimales
    return numero.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  }
}