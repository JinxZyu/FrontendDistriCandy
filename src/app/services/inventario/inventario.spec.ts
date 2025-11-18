import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { InventarioService } from './inventario';

describe('InventarioService', () => {
  let service: InventarioService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [InventarioService]
    });
    service = TestBed.inject(InventarioService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
