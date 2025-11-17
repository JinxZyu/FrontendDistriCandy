import { TestBed } from '@angular/core/testing';

import { ProductoProveedor } from './producto-proveedor';

describe('ProductoProveedor', () => {
  let service: ProductoProveedor;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ProductoProveedor);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
