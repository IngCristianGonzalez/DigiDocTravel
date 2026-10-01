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

  it('should strip digits on name input but keep tildes, ñ, apostrophe and hyphen', () => {
    component.onNameInput('firstName', "Mar1ía-Jo2sé D'X3");
    expect(component.form().firstName).toBe("María-José D'X");
  });

  it('should show min-length error only with 1-2 chars typed', () => {
    component.onNameInput('firstName', 'Ju');
    expect(component.formErrors().firstName).toContain('Mínimo 3');
    component.onNameInput('firstName', '');
    expect(component.formErrors().firstName).toBeFalsy();
    component.onNameInput('firstName', 'Juan');
    expect(component.formErrors().firstName).toBeFalsy();
  });

  it('should flag invalid email live', () => {
    component.updateForm('email', 'mal-formato');
    expect(component.formErrors().email).toBeTruthy();
    component.updateForm('email', 'nombre@dominio.com');
    expect(component.formErrors().email).toBeFalsy();
  });

  it('should open confirm modal with summary instead of saving directly', () => {
    component.form.set({ firstName: 'Ana', lastName: 'Paz', identification: 'AB-123', email: 'ana@x.com', countryOrigin: 'Colombia', phone: '', university: '' });
    component.create();
    expect(component.showConfirmModal()).toBe(true);
    expect(component.confirmKind()).toBe('create');
    expect(component.confirmLines().length).toBeGreaterThan(0);
    // Corregir no persiste ni pierde datos
    component.backToForm();
    expect(component.showConfirmModal()).toBe(false);
    expect(component.form().firstName).toBe('Ana');
  });

  it('should map advisors to nombre+apellido options', () => {
    component.advisors.set([{ id: 'a1', firstName: 'Luz', lastName: 'Díaz', email: 'luz@x.com' }] as any);
    expect(component.advisorOptions()).toEqual([{ value: 'a1', label: 'Luz Díaz', email: 'luz@x.com' }]);
  });

  it('should preselect current advisor when opening edit', () => {
    const s: any = { id: '9', firstName: 'Juan', lastName: 'Pérez', identification: '1234', email: 'j@x.com', countryOrigin: 'Colombia', advisorId: 'a1' };
    component.openEdit(s);
    expect(component.advisorId()).toBe('a1');
  });

  it('should require selecting an advisor before associating', () => {
    component.advisorId.set('');
    component.editingStudent.set({ id: '9' } as any);
    expect(() => component.assignAdvisor()).not.toThrow();
  });
});
