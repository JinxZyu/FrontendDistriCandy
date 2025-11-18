import { TestBed } from '@angular/core/testing';

import { OrdenVentaEnvioService } from './orden-venta-envio-service';

describe('OrdenVentaEnvioService', () => {
  let service: OrdenVentaEnvioService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(OrdenVentaEnvioService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
