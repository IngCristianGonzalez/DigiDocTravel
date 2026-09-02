import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { VisasService } from './visas.service';
import { LoadingComponent } from '../../shared/components/loading.component';
import { ErrorComponent } from '../../shared/components/error.component';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-visas',
  standalone: true,
  imports: [CommonModule, FormsModule, LoadingComponent, ErrorComponent],
  template: `
    <div class="p-6 max-w-6xl mx-auto">
      <h1 class="text-2xl font-bold text-slate-800 mb-6">Gestión de Visas - RF-025 a RF-030</h1>

      <!-- Loading / Error -->
      <app-loading [show]="loading()" message="Cargando visas..."></app-loading>
      <app-error [message]="error()" (retry)="load()"></app-error>

      <!-- RF-025/026/027 Registrar Visa -->
      <div class="bg-white p-6 rounded-xl shadow-sm border border-slate-200 mb-6">
        <h3 class="text-lg font-semibold text-slate-700 mb-4">Registrar Visa RF-025/026/027</h3>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl">
          <!-- studentId * -->
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
          <!-- visaType * -->
          <div>
            <label class="block text-sm font-medium text-slate-600 mb-1">Tipo Visa *</label>
            <select
              [ngModel]="form().visaType"
              (ngModelChange)="updateForm('visaType', $event)"
              class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
              [class.border-red-400]="formErrors().visaType"
              [class.border-slate-300]="!formErrors().visaType"
            >
              <option value="">Seleccione tipo</option>
              <option value="student">student</option>
              <option value="tourist">tourist</option>
              <option value="work">work</option>
              <option value="transit">transit</option>
            </select>
            <p *ngIf="formErrors().visaType" class="text-xs text-red-500 mt-1">{{ formErrors().visaType }}</p>
          </div>
          <!-- visaNumber (sanitizado) -->
          <div>
            <label class="block text-sm font-medium text-slate-600 mb-1">Número Visa</label>
            <input
              placeholder="Número"
              [ngModel]="form().visaNumber"
              (ngModelChange)="updateForm('visaNumber', $event)"
              class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
              [class.border-red-400]="formErrors().visaNumber"
              [class.border-slate-300]="!formErrors().visaNumber"
            >
            <p *ngIf="formErrors().visaNumber" class="text-xs text-red-500 mt-1">{{ formErrors().visaNumber }}</p>
          </div>
          <!-- country * -->
          <div>
            <label class="block text-sm font-medium text-slate-600 mb-1">País *</label>
            <input
              placeholder="País"
              [ngModel]="form().country"
              (ngModelChange)="updateForm('country', $event)"
              class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
              [class.border-red-400]="formErrors().country"
              [class.border-slate-300]="!formErrors().country"
            >
            <p *ngIf="formErrors().country" class="text-xs text-red-500 mt-1">{{ formErrors().country }}</p>
          </div>
          <!-- issueDate * -->
          <div>
            <label class="block text-sm font-medium text-slate-600 mb-1">Fecha Expedición *</label>
            <input
              type="date"
              [ngModel]="form().issueDate"
              (ngModelChange)="updateForm('issueDate', $event)"
              class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
              [class.border-red-400]="formErrors().issueDate"
              [class.border-slate-300]="!formErrors().issueDate"
            >
            <p *ngIf="formErrors().issueDate" class="text-xs text-red-500 mt-1">{{ formErrors().issueDate }}</p>
          </div>
          <!-- expiryDate * -->
          <div>
            <label class="block text-sm font-medium text-slate-600 mb-1">Fecha Vencimiento *</label>
            <input
              type="date"
              [ngModel]="form().expiryDate"
              (ngModelChange)="updateForm('expiryDate', $event)"
              class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
              [class.border-red-400]="formErrors().expiryDate"
              [class.border-slate-300]="!formErrors().expiryDate"
            >
            <p *ngIf="formErrors().expiryDate" class="text-xs text-red-500 mt-1">{{ formErrors().expiryDate }}</p>
          </div>
        </div>
        <button (click)="create()" [disabled]="loading()" class="mt-4 bg-sky-500 hover:bg-sky-600 disabled:bg-slate-300 text-white font-medium px-6 py-2 rounded-lg transition-colors">
          Registrar
        </button>
        <div *ngIf="msg()" class="mt-3 text-sm font-medium" [class.text-green-600]="!error()" [class.text-red-600]="error()">{{ msg() }}</div>
      </div>

      <!-- Filtros + acciones RF-028 / RF-029 -->
      <div class="flex flex-col md:flex-row gap-3 mb-4">
        <input
          placeholder="Filtrar por país o tipo..."
          [ngModel]="filter()"
          (ngModelChange)="filter.set($event)"
          (keyup.enter)="resetAndLoad()"
          class="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
        >
        <select
          [ngModel]="visaTypeFilter()"
          (ngModelChange)="visaTypeFilter.set($event)"
          class="px-3 py-2 border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-sky-500"
        >
          <option value="">Todos los tipos</option>
          <option value="student">student</option>
          <option value="tourist">tourist</option>
          <option value="work">work</option>
          <option value="transit">transit</option>
        </select>
        <button (click)="load()" [class.bg-slate-800]="!expiringMode()" [class.bg-slate-300]="expiringMode()" class="text-white px-5 py-2 rounded-lg font-medium transition-colors hover:bg-slate-900">Ver Todas - RF-028</button>
        <button (click)="loadExpiring()" [class.bg-amber-500]="expiringMode()" [class.bg-amber-400]="!expiringMode()" class="text-white px-5 py-2 rounded-lg font-medium transition-colors hover:bg-amber-600">Por vencer 90 días - RF-029</button>
      </div>

      <!-- Tabla -->
      <div class="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <table class="w-full border-collapse">
          <thead>
            <tr class="bg-slate-100 text-left text-sm font-semibold text-slate-600">
              <th class="px-4 py-3">Tipo</th>
              <th class="px-4 py-3">Número</th>
              <th class="px-4 py-3">País</th>
              <th class="px-4 py-3">Vencimiento</th>
              <th class="px-4 py-3">Días restantes</th>
              <th class="px-4 py-3">Estado</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let v of filteredVisas()" class="border-t border-slate-200 hover:bg-slate-50 text-sm">
              <td class="px-4 py-3">{{ v.visaType }}</td>
              <td class="px-4 py-3">{{ v.visaNumber || '-' }}</td>
              <td class="px-4 py-3">{{ v.country }}</td>
              <td class="px-4 py-3">{{ v.expiryDate | date:'yyyy-MM-dd' }}</td>
              <td class="px-4 py-3">
                <span
                  class="px-2.5 py-1 rounded-full text-xs font-semibold"
                  [ngClass]="{
                    'bg-red-100 text-red-700': v.daysLeft <= 0,
                    'bg-red-100 text-red-600': v.daysLeft > 0 && v.daysLeft <= 30,
                    'bg-amber-100 text-amber-700': v.daysLeft > 30 && v.daysLeft <= 90,
                    'bg-emerald-100 text-emerald-700': v.daysLeft > 90
                  }"
                >{{ v.daysLeft }}</span>
              </td>
              <td class="px-4 py-3">
                <span
                  class="px-2 py-1 rounded-full text-xs font-medium"
                  [ngClass]="{
                    'bg-red-50 text-red-600 border border-red-200': (v.computedStatus || v.status) === 'expired',
                    'bg-amber-50 text-amber-600 border border-amber-200': (v.computedStatus || v.status) === 'expiring',
                    'bg-emerald-50 text-emerald-600 border border-emerald-200': (v.computedStatus || v.status) === 'valid' || (v.computedStatus || v.status) === 'active'
                  }"
                >{{ v.computedStatus || v.status }}</span>
              </td>
            </tr>
            <tr *ngIf="!loading() && filteredVisas().length === 0">
              <td colspan="6" class="px-4 py-8 text-center text-slate-400">No se encontraron visas</td>
            </tr>
          </tbody>
        </table>

        <!-- Paginación -->
        <div class="flex items-center justify-between px-4 py-3 border-t border-slate-200 bg-slate-50">
          <span class="text-sm text-slate-600">Página {{ page() }} de {{ totalPages() }} — Total: {{ total() }} registros</span>
          <div class="flex gap-2">
            <button (click)="prevPage()" [disabled]="page() <= 1" class="px-4 py-1.5 rounded-lg border text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed bg-white border-slate-300 hover:bg-slate-100">Anterior</button>
            <button (click)="nextPage()" [disabled]="page() >= totalPages()" class="px-4 py-1.5 rounded-lg border text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed bg-white border-slate-300 hover:bg-slate-100">Siguiente</button>
          </div>
        </div>
      </div>

      <div class="mt-3 text-xs text-slate-500 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">RF-030 Notificación automática al equipo cuando vence en 90 días (backend genera alerta y notifica).</div>
    </div>
  `
})
export class VisasComponent implements OnInit {
  loading = signal(false);
  error = signal<string | null>(null);
  visas = signal<any[]>([]);
  msg = signal('');
  form = signal<any>({ studentId: '', visaType: 'student', visaNumber: '', country: 'USA', issueDate: '', expiryDate: '' });
  page = signal(1);
  total = signal(0);
  totalPages = signal(1);
  limit = signal(10);

  filter = signal('');
  visaTypeFilter = signal('');
  expiringMode = signal(false);

  formErrors = signal<{ studentId?: string; visaType?: string; visaNumber?: string; country?: string; issueDate?: string; expiryDate?: string }>({});

  filteredVisas = computed(() => {
    let list = this.visas();
    const f = this.filter().toLowerCase().trim();
    const typeFilter = this.visaTypeFilter();
    if (f) {
      list = list.filter(v =>
        (v.country && v.country.toLowerCase().includes(f)) ||
        (v.visaType && v.visaType.toLowerCase().includes(f)) ||
        (v.visaNumber && v.visaNumber.toLowerCase().includes(f))
      );
    }
    if (typeFilter) {
      list = list.filter(v => v.visaType === typeFilter);
    }
    return list;
  });

  constructor(private svc: VisasService, private toast: ToastService) {}

  ngOnInit() {
    this.load();
  }

  updateForm(field: string, value: string) {
    this.form.update(f => ({ ...f, [field]: value }));
    if ((this.formErrors() as any)[field]) {
      this.formErrors.update(e => ({ ...e, [field]: undefined } as any));
    }
  }

  private sanitize(value: string): string {
    if (!value) return '';
    // Seguridad: strip tags, XSS, path traversal
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
      errors.studentId = 'El Student ID es obligatorio';
    }
    if (!f.visaType || !String(f.visaType).trim()) {
      errors.visaType = 'El tipo de visa es obligatorio';
    }
    if (!f.country || !String(f.country).trim()) {
      errors.country = 'El país es obligatorio';
    }
    if (!f.issueDate || !String(f.issueDate).trim()) {
      errors.issueDate = 'La fecha de expedición es obligatoria';
    }
    if (!f.expiryDate || !String(f.expiryDate).trim()) {
      errors.expiryDate = 'La fecha de vencimiento es obligatoria';
    }

    // Seguridad: detectar XSS en visaNumber y fechas
    const xssPattern = /<\s*script/i;
    if (f.visaNumber && xssPattern.test(f.visaNumber)) {
      errors.visaNumber = 'Contenido no permitido en número de visa';
    }
    if (f.issueDate && xssPattern.test(String(f.issueDate))) {
      errors.issueDate = 'Fecha no válida';
    }
    if (f.expiryDate && xssPattern.test(String(f.expiryDate))) {
      errors.expiryDate = 'Fecha no válida';
    }
    // Seguridad: validar formato de fechas no XSS y fecha válida
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (f.issueDate && !dateRegex.test(String(f.issueDate))) {
      errors.issueDate = errors.issueDate || 'Formato de fecha inválido (YYYY-MM-DD)';
    }
    if (f.expiryDate && !dateRegex.test(String(f.expiryDate))) {
      errors.expiryDate = errors.expiryDate || 'Formato de fecha inválido (YYYY-MM-DD)';
    }

    // Validar expiryDate > issueDate solo si ambos son válidos
    if (!errors.issueDate && !errors.expiryDate && f.issueDate && f.expiryDate) {
      const issue = new Date(f.issueDate);
      const expiry = new Date(f.expiryDate);
      if (isNaN(issue.getTime())) {
        errors.issueDate = 'Fecha de expedición inválida';
      }
      if (isNaN(expiry.getTime())) {
        errors.expiryDate = 'Fecha de vencimiento inválida';
      }
      if (!errors.issueDate && !errors.expiryDate && expiry <= issue) {
        errors.expiryDate = 'La fecha de vencimiento debe ser posterior a la fecha de expedición';
      }
    }

    // Validar visaNumber no contiene caracteres peligrosos tras sanitizar (longitud)
    if (f.visaNumber && String(f.visaNumber).length > 50) {
      errors.visaNumber = 'Número de visa demasiado largo';
    }

    this.formErrors.set(errors);
    return Object.keys(errors).length === 0;
  }

  load() {
    this.loading.set(true);
    this.error.set(null);
    this.expiringMode.set(false);
    this.svc.list({ page: this.page(), limit: this.limit() }).subscribe({
      next: (r) => {
        const data = r.data ?? (Array.isArray(r) ? r : []);
        this.visas.set(data);
        this.total.set(r.total ?? data.length ?? 0);
        const tp = ((r as any).totalPages ?? Math.ceil((r.total ?? data.length ?? 0) / this.limit())) || 1;
        this.totalPages.set(tp);
        this.loading.set(false);
      },
      error: (e) => {
        const message = e.error?.message || e.message || 'Error al cargar visas';
        this.error.set(message);
        this.toast.error(message);
        this.loading.set(false);
      }
    });
  }

  loadExpiring() {
    this.loading.set(true);
    this.error.set(null);
    this.expiringMode.set(true);
    this.svc.expiring(90).subscribe({
      next: (r) => {
        const data = Array.isArray(r) ? r : (r.data ?? []);
        this.visas.set(data);
        // En modo expiring no hay paginación de backend, ajustamos total local
        this.total.set((r as any).total ?? data.length ?? 0);
        this.totalPages.set(1);
        this.page.set(1);
        this.loading.set(false);
      },
      error: (e) => {
        const message = e.error?.message || e.message || 'Error al cargar visas por vencer';
        this.error.set(message);
        this.toast.error(message);
        this.loading.set(false);
      }
    });
  }

  resetAndLoad() {
    this.page.set(1);
    this.load();
  }

  prevPage() {
    if (this.expiringMode()) return;
    if (this.page() > 1) {
      this.page.update(p => p - 1);
      this.load();
    }
  }

  nextPage() {
    if (this.expiringMode()) return;
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

    const sanitized = this.sanitizeForm(this.form());

    // Re-validar después de sanitizar que expiry > issue
    const issue = new Date(sanitized.issueDate);
    const expiry = new Date(sanitized.expiryDate);
    if (expiry <= issue) {
      this.formErrors.update(e => ({ ...e, expiryDate: 'La fecha de vencimiento debe ser posterior a la fecha de expedición' }));
      this.toast.error('La fecha de vencimiento debe ser posterior a la expedición');
      return;
    }

    this.loading.set(true);
    this.error.set(null);
    this.svc.create(sanitized).subscribe({
      next: () => {
        this.msg.set('Visa registrada');
        this.toast.success('Visa registrada correctamente');
        this.form.set({ studentId: '', visaType: 'student', visaNumber: '', country: 'USA', issueDate: '', expiryDate: '' });
        this.formErrors.set({});
        this.loading.set(false);
        this.page.set(1);
        this.load();
      },
      error: (e) => {
        const message = e.error?.message || e.message || 'Error al registrar visa';
        this.msg.set(message);
        this.error.set(message);
        this.toast.error(message);
        this.loading.set(false);
      }
    });
  }
}
