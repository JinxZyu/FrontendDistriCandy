import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { FormsModule } from '@angular/forms';
import { BodegaComponent } from './bodega';
import { BodegaService } from '../../services/bodega/bodega';

describe('BodegaComponent', () => {
  let component: BodegaComponent;
  let fixture: ComponentFixture<BodegaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BodegaComponent, HttpClientTestingModule, FormsModule],
      providers: [BodegaService]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BodegaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});