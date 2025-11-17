import { TestBed } from '@angular/core/testing';

import { OrdenVenta } from './orden-venta';

describe('OrdenVenta', () => {
  let service: OrdenVenta;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(OrdenVenta);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
