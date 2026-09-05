import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ReportsComponent } from './reports.component';

describe('ReportsComponent', () => {
  let fixture: ComponentFixture<ReportsComponent>;
  let component: ReportsComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReportsComponent],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();
    fixture = TestBed.createComponent(ReportsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => expect(component).toBeTruthy());

  it('should have title Reportes', () => {
    const el: HTMLElement = fixture.nativeElement;
    expect(el.textContent).toContain('Reportes');
  });

  it('should expose one tab per report type', () => {
    expect(component.reportTabs.map(t => t.value)).toEqual(['students', 'documents', 'visas', 'payments']);
  });

  it('should reject invalid report type', () => {
    component.load('hacker');
    expect(component.error()).toContain('no permitido');
  });

  it('should sanitize JSON output', () => {
    component.data.set({ total: 1, rows: [{ name: '<script>alert(1)</script>Ana' }] });
    expect(component.sanitizedJson()).not.toContain('<script>');
    expect(component.sanitizedJson()).toContain('Ana');
  });
});
