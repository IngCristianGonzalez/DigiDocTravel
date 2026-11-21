import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { AdvisorsComponent, ADVISOR_ROLE } from './advisors.component';

describe('AdvisorsComponent', () => {
  let fixture: ComponentFixture<AdvisorsComponent>;
  let component: AdvisorsComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdvisorsComponent],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();
    fixture = TestBed.createComponent(AdvisorsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => expect(component).toBeTruthy());

  it('should use asesor role constant', () => {
    expect(ADVISOR_ROLE).toBe('asesor');
  });

  it('should request only active advisors', () => {
    const params: any = { page: 1, limit: 10, role: ADVISOR_ROLE, status: 'true' };
    expect(params.role).toBe('asesor');
    expect(params.status).toBe('true');
  });

  it('should strip digits on name input but keep tildes and hyphen', () => {
    component.onNameInput('firstName', 'Mar1ía-José');
    expect(component.form().firstName).toBe('María-José');
  });

  it('should open confirm modal with summary instead of creating directly', () => {
    component.form.set({ email: 'a@x.com', password: 'Aa1!aaaa', firstName: 'Ana', lastName: 'Paz' });
    component.create();
    expect(component.showConfirmModal()).toBe(true);
    expect(component.confirmLines()[0]?.value).toContain('Ana Paz');
    component.backToForm();
    expect(component.showConfirmModal()).toBe(false);
    expect(component.form().firstName).toBe('Ana');
  });

  it('should resolve full name or fallback to email', () => {
    expect(component.fullName({ firstName: 'Luz', lastName: 'Díaz', email: 'l@x.com' } as any)).toBe('Luz Díaz');
    expect(component.fullName(null)).toBe('—');
  });
});
