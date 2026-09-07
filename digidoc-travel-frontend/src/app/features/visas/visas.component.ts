import { Component, OnInit, signal, computed, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { VisasService } from './visas.service';
import { Visa } from '../../shared/interfaces/api.interface';
import { LoadingComponent } from '../../shared/components/loading.component';
import { ErrorComponent } from '../../shared/components/error.component';
import { ToastService } from '../../core/services/toast.service';
import { I18nService } from '../../core/i18n/i18n.service';

// PrimeNG - SL Global · PrimeNG 17 (mismo patrón que Students/Users/Documents)
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
  selector: 'app-visas',
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
  templateUrl: './visas.component.html',
  styleUrls: ['./visas.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VisasComponent implements OnInit {
  readonly i18n = inject(I18nService);
  loading = signal(false);
  error = signal<string | null>(null);
  visas = signal<Visa[]>([]);
  msg = signal('');
  form = signal<any>({ studentId: '', visaType: 'student', visaNumber: '', country: '', issueDate: '', expiryDate: '' });
  page = signal(1);
  total = signal(0);
  totalPages = signal(1);
  limit = signal(10);

  search = signal('');
  visaTypeFilter = signal('');
  // Filtros por columna (ERP PrimeNG) — reemplazan la búsqueda global
  fType = signal('');
  fNumber = signal('');
  fCountry = signal('');
  fExpiry = signal('');
  fDays = signal('');
  fStatus = signal('');
  viewMode = signal<'all' | 'expiring'>('all');
  expiringMode = computed(() => this.viewMode() === 'expiring');

  formErrors = signal<{ studentId?: string; visaType?: string; visaNumber?: string; country?: string; issueDate?: string; expiryDate?: string }>({});

  // Modales — todo por modales, nada inline
  showCreateModal = signal(false);
  showEditModal = signal(false);
  showDetailModal = signal(false);
  detailVisa = signal<Visa | null>(null);
  editingVisa = signal<Visa | null>(null);

  readonly typeOptions = ['student', 'tourist', 'work', 'transit'];
  readonly statusOptions = ['valid', 'expiring', 'expired'];
  readonly skeletonRows = Array.from({ length: 8 }, () => ({} as Visa));

  private readonly uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

  constructor(private svc: VisasService, private toast: ToastService) {}

  ngOnInit() {
    this.load();
  }

  // ---- Modales ----
  openCreateModal() {
    this.form.set({ studentId: '', visaType: 'student', visaNumber: '', country: '', issueDate: '', expiryDate: '' });
    this.formErrors.set({});
    this.showCreateModal.set(true);
  }

  closeCreateModal() {
    this.showCreateModal.set(false);
  }

  openDetail(v: Visa) {
    this.detailVisa.set(v);
    this.showDetailModal.set(true);
    this.svc.get(v.id).subscribe({
      next: (r: any) => this.detailVisa.set(r?.data ?? r),
      error: (e) => this.toast.error(e.error?.message || this.i18n.t('visas.errorGet')),
    });
  }

  closeDetailModal() {
    this.showDetailModal.set(false);
    this.detailVisa.set(null);
  }

  goFromDetailToEdit() {
    const d = this.detailVisa();
    this.closeDetailModal();
    if (d) this.openEdit(d);
  }

  openEdit(v: Visa) {
    this.editingVisa.set(v);
    this.form.set({
      studentId: v.studentId ?? '',
      visaType: v.visaType ?? 'student',
      visaNumber: v.visaNumber ?? '',
      country: v.country ?? '',
      issueDate: (v.issueDate ?? '').slice(0, 10),
      expiryDate: (v.expiryDate ?? '').slice(0, 10),
    });
    this.formErrors.set({});
    this.showEditModal.set(true);
  }

  closeEditModal() {
    this.showEditModal.set(false);
    this.editingVisa.set(null);
    this.formErrors.set({});
  }

  onPageChange(event: { first: number; rows: number }) {
    if (this.expiringMode()) return;
    const rows = event.rows || this.limit();
    this.limit.set(rows);
    this.page.set(Math.floor((event.first || 0) / rows) + 1);
    this.load();
  }

  setViewMode(mode: 'all' | 'expiring') {
    this.viewMode.set(mode);
    this.page.set(1);
    if (mode === 'expiring') this.loadExpiring();
    else this.load();
  }

  daysLeftOf(v: Visa): number {
    if (typeof v.daysLeft === 'number') return v.daysLeft;
    const expiry = new Date(v.expiryDate);
    if (isNaN(expiry.getTime())) return 0;
    return Math.ceil((expiry.getTime() - Date.now()) / 86400000);
  }

  daysSeverity(days: number): 'success' | 'warning' | 'danger' | 'secondary' {
    if (days <= 0 || days <= 30) return 'danger';
    if (days <= 90) return 'warning';
    return 'success';
  }

  statusSeverity(s?: string): 'success' | 'warning' | 'danger' | 'secondary' {
    if (s === 'valid' || s === 'active') return 'success';
    if (s === 'expiring') return 'warning';
    if (s === 'expired') return 'danger';
    return 'secondary';
  }

  statusOf(v: Visa): string {
    return v.computedStatus || v.status;
  }

  updateForm(field: string, value: string) {
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

    const studentId = String(f.studentId ?? '').trim();
    if (!studentId) errors.studentId = this.i18n.t('visas.validation.studentRequired');
    else if (!this.uuidRegex.test(studentId)) errors.studentId = this.i18n.t('visas.validation.studentInvalid');
    if (!f.visaType || !String(f.visaType).trim()) errors.visaType = this.i18n.t('visas.validation.typeRequired');
    if (!f.country || !String(f.country).trim()) errors.country = this.i18n.t('visas.validation.countryRequired');
    if (!f.issueDate || !String(f.issueDate).trim()) errors.issueDate = this.i18n.t('visas.validation.issueRequired');
    if (!f.expiryDate || !String(f.expiryDate).trim()) errors.expiryDate = this.i18n.t('visas.validation.expiryRequired');

    const xssPattern = /<\s*script/i;
    if (f.visaNumber && xssPattern.test(f.visaNumber)) errors.visaNumber = this.i18n.t('visas.validation.numberXss');
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (f.issueDate && !dateRegex.test(String(f.issueDate))) errors.issueDate = errors.issueDate || this.i18n.t('visas.validation.dateFormat');
    if (f.expiryDate && !dateRegex.test(String(f.expiryDate))) errors.expiryDate = errors.expiryDate || this.i18n.t('visas.validation.dateFormat');

    if (!errors.issueDate && !errors.expiryDate && f.issueDate && f.expiryDate) {
      const issue = new Date(f.issueDate);
      const expiry = new Date(f.expiryDate);
      if (isNaN(issue.getTime())) errors.issueDate = this.i18n.t('visas.validation.issueInvalid');
      if (isNaN(expiry.getTime())) errors.expiryDate = this.i18n.t('visas.validation.expiryInvalid');
      if (!errors.issueDate && !errors.expiryDate && expiry <= issue)
        errors.expiryDate = this.i18n.t('visas.validation.expiryBeforeIssue');
    }

    if (f.visaNumber && String(f.visaNumber).length > 50) errors.visaNumber = this.i18n.t('visas.validation.numberTooLong');

    this.formErrors.set(errors);
    return Object.keys(errors).length === 0;
  }

  private buildPayload(includeStudent: boolean): any | null {
    if (!this.validateForm()) {
      this.toast.error(this.i18n.t('visas.formFixErrors'));
      return null;
    }
    const s = this.sanitizeForm(this.form());
    const issue = new Date(s.issueDate);
    const expiry = new Date(s.expiryDate);
    if (expiry <= issue) {
      this.formErrors.update(e => ({ ...e, expiryDate: this.i18n.t('visas.validation.expiryBeforeIssue') }));
      this.toast.error(this.i18n.t('visas.validation.expiryBeforeIssue'));
      return null;
    }
    const payload: any = {
      visaType: s.visaType,
      country: s.country,
      issueDate: s.issueDate,
      expiryDate: s.expiryDate,
    };
    if (includeStudent) payload.studentId = s.studentId;
    if (s.visaNumber) payload.visaNumber = s.visaNumber;
    return payload;
  }

  load() {
    this.loading.set(true);
    this.error.set(null);
    this.viewMode.set('all');
    const searchParts = [this.fNumber().trim(), this.fCountry().trim(), this.search().trim()].filter(Boolean);
    const params: any = { page: this.page(), limit: this.limit() };
    if (searchParts.length) params.search = searchParts.join(' ');
    if (this.fType().trim()) {
      params.visaType = this.fType().trim();
      params.type = this.fType().trim();
    }
    if (this.fExpiry().trim()) params.expiryDate = this.fExpiry().trim();
    if (this.fDays().trim()) params.daysLeft = this.fDays().trim();
    if (this.fStatus().trim()) params.status = this.fStatus().trim();
    this.svc.list(params).subscribe({
      next: (r: any) => {
        const data = r?.data ?? (Array.isArray(r) ? r : []);
        const total = r?.total ?? (Array.isArray(data) ? data.length : 0);
        this.visas.set(Array.isArray(data) ? data : []);
        this.total.set(total);
        this.totalPages.set(r?.totalPages ?? (Math.ceil(total / this.limit()) || 1));
        this.loading.set(false);
      },
      error: (e) => {
        const message = e.error?.message || e.message || this.i18n.t('visas.errorLoad');
        this.error.set(message);
        this.toast.error(message);
        this.loading.set(false);
      }
    });
  }

  loadExpiring() {
    this.loading.set(true);
    this.error.set(null);
    this.viewMode.set('expiring');
    this.svc.expiring(90).subscribe({
      next: (r: any) => {
        const data = Array.isArray(r) ? r : (r.data ?? []);
        this.visas.set(data);
        this.total.set(r?.total ?? data.length ?? 0);
        this.totalPages.set(1);
        this.page.set(1);
        this.loading.set(false);
      },
      error: (e) => {
        const message = e.error?.message || e.message || this.i18n.t('visas.errorExpiring');
        this.toast.error(message);
        this.loading.set(false);
      }
    });
  }

  resetAndLoad() {
    this.page.set(1);
    if (this.expiringMode()) this.loadExpiring();
    else this.load();
  }

  // ---- Filtros por columna (ERP) ----
  onColumnFilter() {
    this.page.set(1);
    this.load();
  }

  hasActiveFilters(): boolean {
    return !!(this.fType() || this.fNumber() || this.fCountry() || this.fExpiry() || this.fDays() || this.fStatus() || this.search() || this.visaTypeFilter());
  }

  clearColumnFilters(dt?: any) {
    dt?.clear();
    this.fType.set('');
    this.fNumber.set('');
    this.fCountry.set('');
    this.fExpiry.set('');
    this.fDays.set('');
    this.fStatus.set('');
    this.search.set('');
    this.visaTypeFilter.set('');
    this.page.set(1);
    this.load();
  }

  create() {
    const payload = this.buildPayload(true);
    if (!payload) return;
    this.loading.set(true);
    this.error.set(null);
    this.svc.create(payload).subscribe({
      next: () => {
        this.msg.set(this.i18n.t('visas.createdMsg'));
        this.toast.success(this.i18n.t('visas.createdToast'));
        this.loading.set(false);
        this.closeCreateModal();
        this.page.set(1);
        this.load();
      },
      error: (e) => {
        const message = e.error?.message || e.message || this.i18n.t('visas.errorCreate');
        this.msg.set(message);
        this.error.set(message);
        this.toast.error(message);
        this.loading.set(false);
      }
    });
  }

  saveEdit() {
    const target = this.editingVisa();
    if (!target) return;
    const payload = this.buildPayload(false);
    if (!payload) return;
    this.loading.set(true);
    this.svc.update(target.id, payload).subscribe({
      next: () => {
        this.toast.success(this.i18n.t('visas.updatedToast'));
        this.loading.set(false);
        this.closeEditModal();
        this.resetAndLoad();
      },
      error: (e) => {
        this.toast.error(e.error?.message || this.i18n.t('visas.errorUpdate'));
        this.loading.set(false);
      }
    });
  }
}
