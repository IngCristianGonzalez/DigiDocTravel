import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { VisasComponent } from './visas.component';

describe('VisasComponent - RF-025 a RF-030', () => {
  let fixture: ComponentFixture<VisasComponent>;
  let component: VisasComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VisasComponent],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();
    fixture = TestBed.createComponent(VisasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => expect(component).toBeTruthy());

  it('should have title Seguimiento de Visas', () => {
    const el: HTMLElement = fixture.nativeElement;
    expect(el.textContent).toContain('Seguimiento de Visas');
  });

  it('should validate dates and UUID', () => {
    component.form.set({ studentId: 'bad', visaType: 'student', visaNumber: '', country: 'USA', issueDate: '2025-01-01', expiryDate: '2024-01-01' });
    const valid = (component as any).validateForm();
    expect(valid).toBe(false);
    expect(component.formErrors().studentId).toBeTruthy();
    expect(component.formErrors().expiryDate).toBeTruthy();
  });

  it('should map days and status to severity', () => {
    expect(component.daysSeverity(-1)).toBe('danger');
    expect(component.daysSeverity(45)).toBe('warning');
    expect(component.daysSeverity(120)).toBe('success');
    expect(component.statusSeverity('expired')).toBe('danger');
    expect(component.statusSeverity('valid')).toBe('success');
  });

  it('should switch view mode between all and expiring', () => {
    component.setViewMode('expiring');
    expect(component.viewMode()).toBe('expiring');
    expect(component.expiringMode()).toBe(true);
    expect(component.page()).toBe(1);
  });

  it('should open detail/edit modals from row actions', () => {
    const v: any = { id: '1', studentId: '11111111-1111-1111-1111-111111111111', visaType: 'student', country: 'USA', issueDate: '2024-01-01', expiryDate: '2026-01-01', status: 'valid' };
    component.openDetail(v);
    expect(component.showDetailModal()).toBe(true);
    component.goFromDetailToEdit();
    expect(component.showDetailModal()).toBe(false);
    expect(component.showEditModal()).toBe(true);
    expect(component.form().country).toBe('USA');
  });
});
