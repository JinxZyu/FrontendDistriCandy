import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { FormsModule } from '@angular/forms';
import { ProveedorComponent } from './proveedor';
import { ProveedorService } from '../../services/proveedor/proveedor';

describe('ProveedorComponent', () => {
  let component: ProveedorComponent;
  let fixture: ComponentFixture<ProveedorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      // Para componentes standalone, usa imports en lugar de declarations
      imports: [ProveedorComponent, HttpClientTestingModule, FormsModule],
      providers: [ProveedorService]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProveedorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});