import { TestBed } from '@angular/core/testing';

import { MetodoPagoService } from './metodo-pago';

describe('MetodoPago', () => {
  let service: MetodoPagoService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MetodoPagoService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
