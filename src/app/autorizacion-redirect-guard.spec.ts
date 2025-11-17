import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';

import { autorizacionRedirectGuard } from './autorizacion-redirect-guard';

describe('autorizacionRedirectGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) => 
      TestBed.runInInjectionContext(() => autorizacionRedirectGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});
