import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Autorizacion } from './autorizacion';

describe('Autorizacion', () => {
  let component: Autorizacion;
  let fixture: ComponentFixture<Autorizacion>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Autorizacion]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Autorizacion);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
