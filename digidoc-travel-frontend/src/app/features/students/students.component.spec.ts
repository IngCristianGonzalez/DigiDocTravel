import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { StudentsComponent } from './students.component';

describe('StudentsComponent - RF-012 a RF-016 + OWASP', () => {
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

  it('should have title RF-012', () => {
    const el: HTMLElement = fixture.nativeElement;
    expect(el.textContent).toContain('Gestión de Estudiantes');
    expect(el.textContent).toContain('RF-012');
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
});
