import { Component, OnInit, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PaymentsService } from './payments.service';
import { PaymentPlan, Installment } from '../../shared/interfaces/api.interface';
import { LoadingComponent } from '../../shared/components/loading.component';
import { ErrorComponent } from '../../shared/components/error.component';
import { ToastService } from '../../core/services/toast.service';

// PrimeNG - SL Global · PrimeNG 17 (mismo patrón que el resto de módulos)
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { FloatLabelModule } from 'primeng/floatlabel';
import { TableModule } from 'primeng/table';
import { SkeletonModule } from 'primeng/skeleton';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { DialogModule } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown';

@Component({
  selector: 'app-payments',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    LoadingComponent,
    ErrorComponent,
    ButtonModule,
    InputTextModule,
    FloatLabelModule,
    TableModule,
    SkeletonModule,
    TagModule,
    TooltipModule,
    DialogModule,
    DropdownModule,
  ],
  templateUrl: './payments.component.html',
  styleUrls: ['./payments.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaymentsComponent implements OnInit {
  loading = signal(false);
  error = signal<string | null>(null);
  plans = signal<PaymentPlan[]>([]);
  installments = signal<Installment[]>([]);
  installmentsPlan = signal<PaymentPlan | null>(null);
  msg = signal('');
  form = signal<any>({ studentId: '', concept: 'Matrícula', totalAmount: null as any, installments: null as any, startDate: '' });
  page = signal(1);
  total = signal(0);
  totalPages = signal(1);
  limit = signal(10);
  search = signal('');

  viewMode = signal<'all' | 'pending'>('all');

  formErrors = signal<{ studentId?: string; concept?: string; totalAmount?: string; installments?: string; startDate?: string }>({});

  // Modales — crear plan, ver cuotas y registrar pago (sin prompt nativo)
  showCreateModal = signal(false);
  showInstallmentsModal = signal(false);
  showPayModal = signal(false);
  payTarget = signal<Installment | null>(null);
  payAmount = signal<number | null>(null);
  payMethod = signal('transfer');
  payDate = signal(new Date().toISOString().split('T')[0]);
  payError = signal<string | null>(null);

  readonly methodOptions = ['transfer', 'cash', 'card'];
  readonly skeletonRows = Array.from({ length: 8 }, () => ({} as PaymentPlan));
  private readonly uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

  constructor(private svc: PaymentsService, private toast: ToastService) {}

  ngOnInit() {
    this.load();
  }

  // ---- Modales ----
  openCreateModal() {
    this.form.set({ studentId: '', concept: 'Matrícula', totalAmount: null, installments: null, startDate: '' });
    this.formErrors.set({});
    this.showCreateModal.set(true);
  }

  closeCreateModal() {
    this.showCreateModal.set(false);
  }

  openInstallments(plan: PaymentPlan) {
    this.installmentsPlan.set(plan);
    this.installments.set(plan.installmentsList ?? []);
    this.showInstallmentsModal.set(true);
    if (!plan.installmentsList) this.viewInstallments(plan.id);
  }

  closeInstallmentsModal() {
    this.showInstallmentsModal.set(false);
    this.installmentsPlan.set(null);
    this.installments.set([]);
  }

  openPay(inst: Installment) {
    this.payTarget.set(inst);
    this.payAmount.set(Number(inst.amount) || null);
    this.payMethod.set('transfer');
    this.payDate.set(new Date().toISOString().split('T')[0]);
    this.payError.set(null);
    this.showPayModal.set(true);
  }

  closePayModal() {
    this.showPayModal.set(false);
    this.payTarget.set(null);
    this.payError.set(null);
  }

  onPageChange(event: { first: number; rows: number }) {
    if (this.viewMode() === 'pending') return;
    const rows = event.rows || this.limit();
    this.limit.set(rows);
    this.page.set(Math.floor((event.first || 0) / rows) + 1);
    this.load();
  }

  setViewMode(mode: 'all' | 'pending') {
    this.viewMode.set(mode);
    this.page.set(1);
    if (mode === 'pending') this.loadPending();
    else this.load();
  }

  statusSeverity(s?: string): 'success' | 'warning' | 'danger' | 'secondary' {
    if (s === 'paid') return 'success';
    if (s === 'pending') return 'warning';
    if (s === 'overdue') return 'danger';
    return 'secondary';
  }

  paidCount(plan: PaymentPlan): string {
    const list = plan.installmentsList ?? [];
    if (!list.length) return `${plan.installments}`;
    const paid = list.filter(i => i.status === 'paid').length;
    return `${paid}/${list.length}`;
  }

  updateForm(field: string, value: any) {
    this.form.update(f => ({ ...f, [field]: value }));
    if ((this.formErrors() as any)[field]) {
      this.formErrors.update(e => ({ ...e, [field]: undefined } as any));
    }
  }

  private sanitize(value: string): string {
    if (!value) return '';
    return value
      .replace(/<[^>]*>/g, '')
      .replace(/[<>]/g, '')
      .replace(/\.\./g, '')
      .replace(/[\/\\]/g, '')
      .trim();
  }

  private validateForm(): boolean {
    const f = this.form();
    const errors: any = {};
    const studentId = String(f.studentId ?? '').trim();
    if (!studentId) errors.studentId = 'El Student ID es obligatorio';
    else if (!this.uuidRegex.test(studentId)) errors.studentId = 'Debe ser un UUID válido';
    if (!String(f.concept ?? '').trim()) errors.concept = 'El concepto es obligatorio';
    else if (/<\s*script/i.test(f.concept)) errors.concept = 'Contenido no permitido';
    if (f.totalAmount === null || f.totalAmount === undefined || String(f.totalAmount).trim() === '')
      errors.totalAmount = 'El monto total es obligatorio';
    else if (isNaN(Number(f.totalAmount)) || Number(f.totalAmount) <= 0)
      errors.totalAmount = 'El monto debe ser mayor a 0';
    if (f.installments === null || f.installments === undefined || String(f.installments).trim() === '')
      errors.installments = 'Las cuotas son obligatorias';
    else if (!Number.isInteger(Number(f.installments)) || Number(f.installments) < 1)
      errors.installments = 'Deben ser >= 1 y entero';
    if (!String(f.startDate ?? '').trim()) errors.startDate = 'La fecha de inicio es obligatoria';
    this.formErrors.set(errors);
    return Object.keys(errors).length === 0;
  }

  load() {
    this.loading.set(true);
    this.error.set(null);
    this.viewMode.set('all');
    this.svc.list({ search: this.search() || undefined, page: this.page(), limit: this.limit() }).subscribe({
      next: (r: any) => {
        const data = r?.data ?? (Array.isArray(r) ? r : []);
        const total = r?.total ?? (Array.isArray(data) ? data.length : 0);
        this.plans.set(Array.isArray(data) ? data : []);
        this.total.set(total);
        this.totalPages.set(r?.totalPages ?? (Math.ceil(total / this.limit()) || 1));
        this.loading.set(false);
      },
      error: (e) => {
        const message = e.error?.message || e.message || 'Error al cargar planes';
        this.error.set(message);
        this.toast.error(message);
        this.loading.set(false);
      }
    });
  }

  loadPending() {
    this.loading.set(true);
    this.error.set(null);
    this.viewMode.set('pending');
    this.svc.pending().subscribe({
      next: (r: any) => {
        const data = Array.isArray(r) ? r : (r?.data ?? []);
        this.plans.set(data);
        this.total.set(r?.total ?? data.length ?? 0);
        this.totalPages.set(1);
        this.page.set(1);
        this.loading.set(false);
      },
      error: (e) => {
        const message = e.error?.message || e.message || 'Error al cargar pendientes';
        this.error.set(message);
        this.toast.error(message);
        this.loading.set(false);
      }
    });
  }

  resetAndLoad() {
    this.page.set(1);
    if (this.viewMode() === 'pending') this.loadPending();
    else this.load();
  }

  create() {
    if (!this.validateForm()) {
      this.toast.error('Corrige los errores del formulario');
      return;
    }
    const raw = this.form();
    const concept = this.sanitize(String(raw.concept ?? ''));
    if (!concept || /<\s*script/i.test(concept)) {
      this.toast.error('Concepto inválido');
      return;
    }
    const payload = {
      studentId: String(raw.studentId).trim(),
      concept,
      totalAmount: Number(raw.totalAmount),
      installments: Number(raw.installments),
      startDate: String(raw.startDate),
    };
    this.loading.set(true);
    this.error.set(null);
    // RF-031/032: crear plan genera cuotas automáticamente
    this.svc.create(payload).subscribe({
      next: () => {
        this.msg.set('Plan creado con cuotas');
        this.toast.success('Plan creado con cuotas');
        this.loading.set(false);
        this.closeCreateModal();
        this.page.set(1);
        this.load();
      },
      error: (e) => {
        const message = e.error?.message || e.message || 'Error al crear plan';
        this.msg.set(message);
        this.error.set(message);
        this.toast.error(message);
        this.loading.set(false);
      }
    });
  }

  viewInstallments(planId: string) {
    const id = this.sanitize(planId);
    if (!id) {
      this.toast.error('ID de plan no válido');
      return;
    }
    this.svc.installments(id).subscribe({
      next: (r: any) => {
        const data = Array.isArray(r) ? r : r?.data ?? [];
        this.installments.set(data);
        if (data.length === 0) this.toast.info('Este plan no tiene cuotas registradas');
      },
      error: (e) => {
        this.toast.error(e.error?.message || 'Error al cargar cuotas');
      }
    });
  }

  confirmPay() {
    const target = this.payTarget();
    if (!target) return;
    const amount = Number(this.payAmount);
    this.payError.set(null);
    if (!amount || isNaN(amount) || amount <= 0) {
      this.payError.set('El monto pagado debe ser mayor a 0');
      return;
    }
    if (!this.payDate()) {
      this.payError.set('La fecha de pago es obligatoria');
      return;
    }
    this.loading.set(true);
    // RF-033
    this.svc.pay(target.id, { amount, paymentDate: this.payDate(), method: this.payMethod() }).subscribe({
      next: () => {
        this.installments.set(this.installments().map(i => i.id === target.id ? { ...i, status: 'paid' } : i));
        this.toast.success('Pago registrado correctamente');
        this.loading.set(false);
        this.closePayModal();
      },
      error: (e) => {
        const message = e.error?.message || e.message || 'Error al registrar pago';
        this.payError.set(message);
        this.toast.error(message);
        this.loading.set(false);
      }
    });
  }
}
