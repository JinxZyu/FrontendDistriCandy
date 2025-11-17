import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TransVerificar } from './trans-verificar';

describe('TransVerificar', () => {
  let component: TransVerificar;
  let fixture: ComponentFixture<TransVerificar>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TransVerificar]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TransVerificar);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
