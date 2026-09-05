import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { PaymentsComponent } from './payments.component';

describe('PaymentsComponent - RF-031 a RF-036', () => {
  let fixture: ComponentFixture<PaymentsComponent>;
  let component: PaymentsComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PaymentsComponent],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();
    fixture = TestBed.createComponent(PaymentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => expect(component).toBeTruthy());

  it('should have title Plan de Pagos', () => {
    const el: HTMLElement = fixture.nativeElement;
    expect(el.textContent).toContain('Plan de Pagos');
  });

  it('should validate plan form (UUID, amounts, installments)', () => {
    component.form.set({ studentId: 'bad', concept: '', totalAmount: -5, installments: 0, startDate: '' });
    const valid = (component as any).validateForm();
    expect(valid).toBe(false);
    expect(component.formErrors().studentId).toBeTruthy();
    expect(component.formErrors().totalAmount).toBeTruthy();
    expect(component.formErrors().installments).toBeTruthy();
  });

  it('should map status to tag severity', () => {
    expect(component.statusSeverity('paid')).toBe('success');
    expect(component.statusSeverity('pending')).toBe('warning');
    expect(component.statusSeverity('overdue')).toBe('danger');
  });

  it('should switch view mode between all and pending', () => {
    component.setViewMode('pending');
    expect(component.viewMode()).toBe('pending');
    expect(component.page()).toBe(1);
  });

  it('should open installments and pay modals (no prompt nativo)', () => {
    const plan: any = { id: 'p1', concept: 'Matrícula', totalAmount: 3000, installments: 3, status: 'pending', installmentsList: [{ id: 'i1', number: 1, amount: 1000, status: 'pending' }] };
    component.openInstallments(plan);
    expect(component.showInstallmentsModal()).toBe(true);
    expect(component.installments().length).toBe(1);

    component.openPay(component.installments()[0]);
    expect(component.showPayModal()).toBe(true);
    expect(component.payAmount()).toBe(1000);
    component.closePayModal();
    component.closeInstallmentsModal();
    expect(component.showInstallmentsModal()).toBe(false);
  });

  it('should reject invalid pay amount', () => {
    component.openPay({ id: 'i1', number: 1, amount: 1000 } as any);
    component.payAmount.set(-10);
    component.confirmPay();
    expect(component.payError()).toBeTruthy();
    expect(component.showPayModal()).toBe(true);
  });
});
