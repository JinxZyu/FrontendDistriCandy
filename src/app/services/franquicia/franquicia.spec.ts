import { TestBed } from '@angular/core/testing';

import { Franquicia } from './franquicia';

describe('Franquicia', () => {
  let service: Franquicia;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Franquicia);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
