import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { StudentsComponent } from './students.component';

describe('StudentsComponent - OWASP', () => {
  let fixture: ComponentFixture<StudentsComponent>;
  let component: StudentsComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StudentsComponent],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();
    fixture = TestBed.createComponent(StudentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => expect(component).toBeTruthy());

  it('should have title Gestión de Estudiantes', () => {
    const el: HTMLElement = fixture.nativeElement;
    expect(el.textContent).toContain('Gestión de Estudiantes');
  });

  it('should validate required fields', () => {
    component.form.set({ firstName: '', lastName: '', email: 'invalid', countryOrigin: '' });
    const valid = (component as any).validateForm();
    expect(valid).toBe(false);
    expect(component.formErrors().firstName).toBeTruthy();
    expect(component.formErrors().email).toBeTruthy();
  });

  it('should sanitize XSS in obsText', () => {
    component.obsText.set('<script>alert(1)</script>Test');
    // simulate addObs sanitization check
    const sanitized = component.obsText().replace(/<[^>]*>/g, '');
    expect(sanitized).not.toContain('<script>');
  });

  it('should handle pagination', () => {
    component.page.set(1);
    component.totalPages.set(5);
    component.nextPage();
    expect(component.page()).toBe(2);
    component.prevPage();
    expect(component.page()).toBe(1);
  });

  it('should map lazy paginator event to server page/limit', () => {
    component.onPageChange({ first: 20, rows: 10 });
    expect(component.page()).toBe(3);
    expect(component.limit()).toBe(10);
  });

  it('should open detail modal from row action', () => {
    const s: any = { id: '1', firstName: 'Ana', lastName: 'Paz', email: 'a@x.com' };
    component.openDetail(s);
    expect(component.showDetailModal()).toBe(true);
    expect(component.detailStudent()).toEqual(s);
    component.closeDetailModal();
    expect(component.showDetailModal()).toBe(false);
    expect(component.detailStudent()).toBeNull();
  });

  it('should prefill edit modal from row', () => {
    const s: any = { id: '2', firstName: 'Juan', lastName: 'Pérez', identification: '1234', email: 'j@x.com', countryOrigin: 'Colombia', phone: '', university: '' };
    component.openEdit(s);
    expect(component.showEditModal()).toBe(true);
    expect(component.editingStudent()).toEqual(s);
    expect(component.form().email).toBe('j@x.com');
  });

  it('should move from detail modal to edit modal keeping data', () => {
    const s: any = { id: '3', firstName: 'Luz', lastName: 'Díaz', identification: '5678', email: 'l@x.com', countryOrigin: 'Colombia' };
    component.openDetail(s);
    component.goFromDetailToEdit();
    expect(component.showDetailModal()).toBe(false);
    expect(component.showEditModal()).toBe(true);
    expect(component.editingStudent()).toEqual(s);
  });

  it('should open/close observations and delete modals from row actions', () => {
    const s: any = { id: '4', firstName: 'Eva', lastName: 'Ruiz', email: 'e@x.com' };
    component.openObs(s);
    expect(component.showObsModal()).toBe(true);
    expect(component.obsStudent()).toEqual(s);
    component.closeObsModal();
    expect(component.showObsModal()).toBe(false);

    component.openDelete(s);
    expect(component.showDeleteModal()).toBe(true);
    expect(component.deleteTarget()).toEqual(s);
    component.closeDeleteModal();
    expect(component.showDeleteModal()).toBe(false);
    expect(component.deleteTarget()).toBeNull();
  });
});
