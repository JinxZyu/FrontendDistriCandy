import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Verificar } from './verificar';

describe('Verificar', () => {
  let component: Verificar;
  let fixture: ComponentFixture<Verificar>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Verificar]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Verificar);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
