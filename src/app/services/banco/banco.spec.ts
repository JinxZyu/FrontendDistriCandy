import { TestBed } from '@angular/core/testing';

import { Banco } from './banco';

describe('Banco', () => {
  let service: Banco;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Banco);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
