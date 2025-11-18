import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { BodegaService } from './bodega';

describe('BodegaService', () => {
  let service: BodegaService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [BodegaService]
    });
    service = TestBed.inject(BodegaService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
})