import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PaymentsService } from './payments.service';
import { LoadingComponent } from '../../shared/components/loading.component';
import { ErrorComponent } from '../../shared/components/error.component';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-payments',
  standalone: true,
  imports: [CommonModule, FormsModule, LoadingComponent, ErrorComponent],
  template: `
    <div class="p-6 max-w-6xl mx-auto">
      <h1 class="text-2xl font-bold text-slate-800 mb-6">Plan de Pagos - RF-031 a RF-036</h1>

      <!-- Loading / Error -->
      <app-loading [show]="loading()" message="Cargando planes..."></app-loading>
      <app-error [message]="error()" (retry)="load()"></app-error>

      <!-- Crear Plan RF-031/032 -->
      <div class="bg-white p-6 rounded-xl shadow-sm border border-slate-200 mb-6">
        <h3 class="text-lg font-semibold text-slate-700 mb-4">Crear Plan RF-031/032</h3>
        <p class="text-sm text-slate-500 mb-4">Genera cuotas automáticamente al crear el plan.</p>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl">
          <!-- studentId -->
          <div>
            <label class="block text-sm font-medium text-slate-600 mb-1">Student ID *</label>
            <input
              placeholder="Student ID"
              [ngModel]="form().studentId"
              (ngModelChange)="updateForm('studentId', $event)"
              class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
              [class.border-red-400]="formErrors().studentId"
              [class.border-slate-300]="!formErrors().studentId"
            >
            <p *ngIf="formErrors().studentId" class="text-xs text-red-500 mt-1">{{ formErrors().studentId }}</p>
          </div>
          <!-- concept -->
          <div>
            <label class="block text-sm font-medium text-slate-600 mb-1">Concepto *</label>
            <input
              placeholder="Concepto"
              [ngModel]="form().concept"
              (ngModelChange)="updateForm('concept', $event)"
              class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
              [class.border-red-400]="formErrors().concept"
              [class.border-slate-300]="!formErrors().concept"
            >
            <p *ngIf="formErrors().concept" class="text-xs text-red-500 mt-1">{{ formErrors().concept }}</p>
          </div>
          <!-- totalAmount -->
          <div>
            <label class="block text-sm font-medium text-slate-600 mb-1">Monto Total *</label>
            <input
              placeholder="Monto Total"
              type="number"
              [ngModel]="form().totalAmount"
              (ngModelChange)="updateForm('totalAmount', $event)"
              class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
              [class.border-red-400]="formErrors().totalAmount"
              [class.border-slate-300]="!formErrors().totalAmount"
            >
            <p *ngIf="formErrors().totalAmount" class="text-xs text-red-500 mt-1">{{ formErrors().totalAmount }}</p>
          </div>
          <!-- installments -->
          <div>
            <label class="block text-sm font-medium text-slate-600 mb-1">Cuotas *</label>
            <input
              placeholder="Cuotas"
              type="number"
              [ngModel]="form().installments"
              (ngModelChange)="updateForm('installments', $event)"
              class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
              [class.border-red-400]="formErrors().installments"
              [class.border-slate-300]="!formErrors().installments"
            >
            <p *ngIf="formErrors().installments" class="text-xs text-red-500 mt-1">{{ formErrors().installments }}</p>
          </div>
          <!-- startDate -->
          <div>
            <label class="block text-sm font-medium text-slate-600 mb-1">Fecha Inicio *</label>
            <input
              type="date"
              [ngModel]="form().startDate"
              (ngModelChange)="updateForm('startDate', $event)"
              class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
              [class.border-red-400]="formErrors().startDate"
              [class.border-slate-300]="!formErrors().startDate"
            >
            <p *ngIf="formErrors().startDate" class="text-xs text-red-500 mt-1">{{ formErrors().startDate }}</p>
          </div>
        </div>
        <button (click)="create()" [disabled]="loading()" class="mt-4 bg-sky-500 hover:bg-sky-600 disabled:bg-slate-300 text-white font-medium px-6 py-2 rounded-lg transition-colors">
          Crear Plan - genera cuotas automáticamente
        </button>
        <div *ngIf="msg()" class="mt-3 text-sm font-medium" [class.text-green-600]="!error()" [class.text-red-600]="error()">{{ msg() }}</div>
      </div>

      <!-- Acciones listado -->
      <div class="flex gap-3 mb-4">
        <button (click)="load()" class="bg-slate-800 hover:bg-slate-900 text-white px-6 py-2 rounded-lg font-medium transition-colors">Listar Planes RF-034</button>
        <button (click)="loadPending()" class="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg font-medium transition-colors">Pendientes - Dashboard RF-036</button>
      </div>

      <!-- Tabla planes -->
      <div class="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <table class="w-full border-collapse">
          <thead>
            <tr class="bg-slate-100 text-left text-sm font-semibold text-slate-600">
              <th class="px-4 py-3">Concepto</th>
              <th class="px-4 py-3">Total</th>
              <th class="px-4 py-3">Cuotas</th>
              <th class="px-4 py-3">Estado</th>
              <th class="px-4 py-3">Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let p of plans()" class="border-t border-slate-200 hover:bg-slate-50 text-sm">
              <td class="px-4 py-3">{{ p.concept }}</td>
              <td class="px-4 py-3">\${{ p.totalAmount }}</td>
              <td class="px-4 py-3">{{ p.installments }}</td>
              <td class="px-4 py-3">
                <span class="px-2 py-1 rounded-full text-xs font-medium" [class.bg-emerald-100]="p.status==='paid'" [class.text-emerald-700]="p.status==='paid'" [class.bg-amber-100]="p.status!=='paid'" [class.text-amber-700]="p.status!=='paid'">
                  {{ p.status }}
                </span>
              </td>
              <td class="px-4 py-3">
                <button (click)="viewInstallments(p.id)" class="text-xs bg-white border border-slate-300 hover:bg-slate-100 px-3 py-1.5 rounded-lg font-medium transition-colors">Ver Cuotas RF-032/033</button>
              </td>
            </tr>
            <tr *ngIf="!loading() && plans().length === 0">
              <td colspan="5" class="px-4 py-8 text-center text-slate-400">No se encontraron planes de pago</td>
            </tr>
          </tbody>
        </table>

        <!-- Paginación Anterior/Siguiente -->
        <div class="flex items-center justify-between px-4 py-3 border-t border-slate-200 bg-slate-50">
          <span class="text-sm text-slate-600">Página {{ page() }} de {{ totalPages() }} — Total: {{ total() }} registros</span>
          <div class="flex gap-2">
            <button (click)="prevPage()" [disabled]="page() <= 1" class="px-4 py-1.5 rounded-lg border text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed bg-white border-slate-300 hover:bg-slate-100">Anterior</button>
            <button (click)="nextPage()" [disabled]="page() >= totalPages()" class="px-4 py-1.5 rounded-lg border text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed bg-white border-slate-300 hover:bg-slate-100">Siguiente</button>
          </div>
        </div>
      </div>

      <!-- Cuotas -->
      <div *ngIf="installments().length" class="bg-white p-6 mt-6 rounded-xl shadow-sm border border-slate-200">
        <h4 class="text-lg font-semibold text-slate-700 mb-4">Cuotas</h4>
        <div class="overflow-hidden rounded-lg border border-slate-200">
          <table class="w-full border-collapse">
            <thead>
              <tr class="bg-slate-100 text-left text-sm font-semibold text-slate-600">
                <th class="px-4 py-3">#</th>
                <th class="px-4 py-3">Monto</th>
                <th class="px-4 py-3">Vencimiento</th>
                <th class="px-4 py-3">Estado</th>
                <th class="px-4 py-3">Pagar</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let i of installments()" class="border-t border-slate-200 hover:bg-slate-50 text-sm">
                <td class="px-4 py-3">{{ i.number }}</td>
                <td class="px-4 py-3">\${{ i.amount }}</td>
                <td class="px-4 py-3">{{ i.dueDate | date:'shortDate' }}</td>
                <td class="px-4 py-3">
                  <span class="px-2 py-1 rounded-full text-xs font-medium" [class.bg-emerald-100]="i.status==='paid'" [class.text-emerald-700]="i.status==='paid'" [class.bg-amber-100]="i.status==='pending'" [class.text-amber-700]="i.status==='pending'">
                    {{ i.status }}
                  </span>
                </td>
                <td class="px-4 py-3">
                  <button *ngIf="i.status==='pending'" (click)="pay(i.id)" class="bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-medium px-3 py-1.5 rounded-lg transition-colors">Registrar Pago RF-033</button>
                  <span *ngIf="i.status!=='pending'" class="text-xs text-slate-400">Pagado</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <p class="mt-3 text-xs text-slate-500">RF-035 Notificación automática 7 días antes del vencimiento (backend).</p>
      </div>
    </div>
  `
})
export class PaymentsComponent implements OnInit {
  loading = signal(false);
  error = signal<string | null>(null);
  plans = signal<any[]>([]);
  installments = signal<any[]>([]);
  msg = signal('');
  form = signal<any>({ studentId: '', concept: 'Matrícula', totalAmount: 3000, installments: 3, startDate: '' });
  page = signal(1);
  total = signal(0);
  totalPages = signal(1);
  limit = signal(10);

  formErrors = signal<{ studentId?: string; concept?: string; totalAmount?: string; installments?: string; startDate?: string }>({});

  constructor(private svc: PaymentsService, private toast: ToastService) {}

  ngOnInit() {
    this.load();
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

  private sanitizeForm(raw: any): any {
    const sanitized: any = {};
    for (const key of Object.keys(raw)) {
      const val = raw[key];
      sanitized[key] = typeof val === 'string' ? this.sanitize(val) : val;
    }
    return sanitized;
  }

  private validateForm(): boolean {
    const f = this.form();
    const errors: any = {};

    if (!f.studentId || !String(f.studentId).trim()) {
      errors.studentId = 'El studentId es obligatorio';
    }
    if (!f.concept || !String(f.concept).trim()) {
      errors.concept = 'El concepto es obligatorio';
    } else if (/<\s*script/i.test(f.concept)) {
      errors.concept = 'Concepto contiene contenido no permitido';
    }
    if (f.totalAmount === null || f.totalAmount === undefined || String(f.totalAmount).trim() === '') {
      errors.totalAmount = 'El monto total es obligatorio';
    } else if (Number(f.totalAmount) <= 0 || isNaN(Number(f.totalAmount))) {
      errors.totalAmount = 'El monto debe ser mayor a 0';
    }
    if (f.installments === null || f.installments === undefined || String(f.installments).trim() === '') {
      errors.installments = 'Las cuotas son obligatorias';
    } else if (!Number.isInteger(Number(f.installments)) || Number(f.installments) < 1) {
      errors.installments = 'Las cuotas deben ser >= 1 y entero';
    }
    if (!f.startDate || !String(f.startDate).trim()) {
      errors.startDate = 'La fecha de inicio es obligatoria';
    }

    this.formErrors.set(errors);
    return Object.keys(errors).length === 0;
  }

  load() {
    this.loading.set(true);
    this.error.set(null);
    this.svc.list({ page: this.page(), limit: this.limit() }).subscribe({
      next: (r) => {
        const data = r?.data ?? (Array.isArray(r) ? r : []);
        this.plans.set(data);
        const totalVal = (r?.total ?? data.length ?? 0);
        this.total.set(totalVal);
        const tp = ((r as any)?.totalPages ?? Math.ceil(totalVal / this.limit())) || 1;
        this.totalPages.set(tp);
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
    this.svc.pending().subscribe({
      next: (r) => {
        // RF-036 Dashboard pendientes: el backend puede devolver planes o cuotas pendientes
        // Si devuelve array directo, se muestra en installments; si es paginado, en plans
        if (Array.isArray(r)) {
          // detectar si son installments (tienen dueDate/amount) vs plans
          const isInstallment = r.length > 0 && (r[0].dueDate || r[0].amount !== undefined && r[0].number !== undefined);
          if (isInstallment) {
            this.installments.set(r);
            this.toast.info('Cuotas pendientes cargadas - RF-036');
          } else {
            this.plans.set(r);
            this.total.set(r.length);
            this.totalPages.set(1);
            this.page.set(1);
            this.toast.info('Planes pendientes cargados - RF-036');
          }
        } else if (r?.data) {
          this.plans.set(r.data);
          this.total.set(r.total ?? r.data.length);
          this.totalPages.set((r as any).totalPages ?? 1);
          this.installments.set([]);
        } else {
          this.installments.set(Array.isArray(r) ? r : []);
          this.plans.set([]);
        }
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

  prevPage() {
    if (this.page() > 1) {
      this.page.update(p => p - 1);
      this.load();
    }
  }

  nextPage() {
    if (this.page() < this.totalPages()) {
      this.page.update(p => p + 1);
      this.load();
    }
  }

  create() {
    if (!this.validateForm()) {
      this.toast.error('Corrige los errores del formulario');
      return;
    }

    // Sanitización y seguridad
    const raw = this.form();
    const sanitized = this.sanitizeForm(raw);

    // Seguridad: validar amount >0 sanitizado
    if (Number(sanitized.totalAmount) <= 0) {
      this.formErrors.update(e => ({ ...e, totalAmount: 'El monto debe ser mayor a 0' }));
      this.toast.error('El monto debe ser mayor a 0');
      return;
    }
    if (!Number.isInteger(Number(sanitized.installments)) || Number(sanitized.installments) < 1) {
      this.formErrors.update(e => ({ ...e, installments: 'Las cuotas deben ser >= 1' }));
      this.toast.error('Las cuotas deben ser >= 1');
      return;
    }
    // sanitizar concept ya hecho, validar longitud
    if (!sanitized.concept || !sanitized.concept.trim()) {
      this.formErrors.update(e => ({ ...e, concept: 'El concepto es obligatorio' }));
      this.toast.error('El concepto es obligatorio');
      return;
    }
    if (/<\s*script/i.test(sanitized.concept)) {
      this.toast.error('Concepto contiene contenido no permitido');
      return;
    }

    // coerción numérica
    sanitized.totalAmount = Number(sanitized.totalAmount);
    sanitized.installments = Number(sanitized.installments);

    this.loading.set(true);
    this.error.set(null);
    // RF-031/032: create plan genera cuotas automáticamente
    this.svc.create(sanitized).subscribe({
      next: () => {
        this.msg.set('Plan creado con cuotas');
        this.toast.success('Plan creado con cuotas - RF-031/032');
        this.loading.set(false);
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

  viewInstallments(id: string) {
    const sanitizedId = this.sanitize(id);
    if (!sanitizedId) {
      this.toast.error('ID de plan no válido');
      return;
    }
    this.loading.set(true);
    this.error.set(null);
    // RF-032/033
    this.svc.installments(sanitizedId).subscribe({
      next: (r) => {
        const data = Array.isArray(r) ? r : r?.data ?? [];
        this.installments.set(data);
        this.loading.set(false);
        if (data.length === 0) this.toast.info('Este plan no tiene cuotas registradas');
      },
      error: (e) => {
        const message = e.error?.message || e.message || 'Error al cargar cuotas';
        this.error.set(message);
        this.toast.error(message);
        this.loading.set(false);
      }
    });
  }

  pay(id: string) {
    const sanitizedId = this.sanitize(id);
    const rawAmount = prompt('Monto pagado');
    if (rawAmount === null) return;
    const amount = parseFloat(rawAmount);
    // Seguridad: validar amount >0
    if (isNaN(amount) || amount <= 0) {
      this.toast.error('El monto pagado debe ser mayor a 0');
      return;
    }
    this.loading.set(true);
    this.error.set(null);
    // RF-033
    this.svc.pay(sanitizedId, { amount, paymentDate: new Date().toISOString().split('T')[0], method: 'transfer' }).subscribe({
      next: () => {
        this.installments.set(this.installments().map(i => i.id === sanitizedId ? { ...i, status: 'paid' } : i));
        this.toast.success('Pago registrado correctamente - RF-033');
        this.loading.set(false);
      },
      error: (e) => {
        const message = e.error?.message || e.message || 'Error al registrar pago';
        this.error.set(message);
        this.toast.error(message);
        this.loading.set(false);
      }
    });
  }
}
