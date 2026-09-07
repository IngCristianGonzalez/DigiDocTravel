import { Component, OnInit, signal, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DocumentsService } from './documents.service';
import { Document } from '../../shared/interfaces/api.interface';
import { LoadingComponent } from '../../shared/components/loading.component';
import { ErrorComponent } from '../../shared/components/error.component';
import { ToastService } from '../../core/services/toast.service';
import { I18nService } from '../../core/i18n/i18n.service';

// PrimeNG - SL Global · PrimeNG 17 (mismo patrón que Students/Users)
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
  selector: 'app-documents',
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
  templateUrl: './documents.component.html',
  styleUrls: ['./documents.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DocumentsComponent implements OnInit {
  readonly i18n = inject(I18nService);
  loading = signal(false);
  error = signal<string | null>(null);
  docs = signal<Document[]>([]);
  search = signal('');
  filterType = signal('');
  // Filtros por columna (ERP PrimeNG) — reemplazan la búsqueda global
  fName = signal('');
  fType = signal('');
  fCategory = signal('');
  fStatus = signal('');
  readonly statusOptions = ['pending', 'approved', 'rejected'];
  form = signal<any>({ studentId: '', type: 'passport', name: '', description: '', category: '', fileUrl: '', fileType: '', fileSize: null });
  msg = signal('');
  history = signal<any[]>([]);
  historyDoc = signal<Document | null>(null);
  page = signal(1);
  total = signal(0);
  totalPages = signal(1);
  limit = signal(10);
  file = signal<any>(null);

  formErrors = signal<{ studentId?: string; type?: string; name?: string }>({});
  fileError = signal<string | null>(null);

  // Modales — todo por modales, nada inline ni prompt/confirm nativos
  showCreateModal = signal(false);
  showEditModal = signal(false);
  showDetailModal = signal(false);
  showHistoryModal = signal(false);
  showDeleteModal = signal(false);
  detailDoc = signal<Document | null>(null);
  editingDoc = signal<Document | null>(null);
  deleteTarget = signal<Document | null>(null);

  readonly typeOptions = ['passport', 'visa', 'academic', 'financial', 'identity'];
  readonly categoryOptions = ['identity', 'academic', 'financial'];
  readonly skeletonRows = Array.from({ length: 8 }, () => ({} as Document));

  private readonly allowedExt = ['pdf', 'jpg', 'jpeg', 'png'];
  private readonly allowedMime = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
  private readonly maxSize = 10 * 1024 * 1024;
  private readonly uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

  constructor(private svc: DocumentsService, private toast: ToastService) {}

  ngOnInit() {
    this.load();
  }

  // ---- Modales ----
  openCreateModal() {
    this.form.set({ studentId: '', type: 'passport', name: '', description: '', category: '', fileUrl: '', fileType: '', fileSize: null });
    this.formErrors.set({});
    this.file.set(null);
    this.fileError.set(null);
    this.showCreateModal.set(true);
  }

  closeCreateModal() {
    this.showCreateModal.set(false);
  }

  openDetail(d: Document) {
    this.detailDoc.set(d);
    this.showDetailModal.set(true);
    this.svc.get(d.id).subscribe({
      next: (v: any) => this.detailDoc.set(v?.data ?? v),
      error: (e) => this.toast.error(e.error?.message || this.i18n.t('docs.errorGet')),
    });
  }

  closeDetailModal() {
    this.showDetailModal.set(false);
    this.detailDoc.set(null);
  }

  goFromDetailToEdit() {
    const d = this.detailDoc();
    this.closeDetailModal();
    if (d) this.openEdit(d);
  }

  openEdit(d: Document) {
    this.editingDoc.set(d);
    this.form.set({ studentId: d.studentId ?? '', type: d.type ?? 'passport', name: d.name ?? '', description: d.description ?? '', category: d.category ?? '', fileUrl: d.fileUrl ?? '', fileType: d.fileType ?? '', fileSize: d.fileSize ?? null });
    this.formErrors.set({});
    this.showEditModal.set(true);
  }

  closeEditModal() {
    this.showEditModal.set(false);
    this.editingDoc.set(null);
    this.formErrors.set({});
  }

  openHistory(d: Document) {
    this.historyDoc.set(d);
    this.history.set([]);
    this.showHistoryModal.set(true);
    this.viewHistory(d.id);
  }

  closeHistoryModal() {
    this.showHistoryModal.set(false);
    this.historyDoc.set(null);
    this.history.set([]);
  }

  openDelete(d: Document) {
    this.deleteTarget.set(d);
    this.showDeleteModal.set(true);
  }

  closeDeleteModal() {
    this.showDeleteModal.set(false);
    this.deleteTarget.set(null);
  }

  onPageChange(event: { first: number; rows: number }) {
    const rows = event.rows || this.limit();
    this.limit.set(rows);
    this.page.set(Math.floor((event.first || 0) / rows) + 1);
    this.load();
  }

  statusSeverity(s?: string): 'success' | 'warning' | 'danger' | 'secondary' {
    if (s === 'approved') return 'success';
    if (s === 'pending') return 'warning';
    if (s === 'rejected') return 'danger';
    return 'secondary';
  }

  updateForm(field: string, value: string) {
    this.form.update(f => ({ ...f, [field]: value }));
    if ((this.formErrors() as any)[field]) {
      this.formErrors.update(e => ({ ...e, [field]: undefined } as any));
    }
  }

  // Sanitización: strip < >, .., /\ y tags
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
      if (typeof val === 'string') {
        if (key === 'name' || key === 'fileUrl') {
          sanitized[key] = this.sanitize(val);
        } else {
          sanitized[key] = val.trim().replace(/<[^>]*>/g, '');
        }
      } else {
        sanitized[key] = val;
      }
    }
    return sanitized;
  }

  // Seguridad: isAllowedUrl check cliente (SSRF)
  private isAllowedUrl(url: string): boolean {
    try {
      const parsed = new URL(url);
      if (!['http:', 'https:'].includes(parsed.protocol)) return false;
      const blocked = new Set(['169.254.169.254', '0.0.0.0', '127.0.0.1']);
      if (blocked.has(parsed.hostname)) return false;
      if (/^10\./.test(parsed.hostname) || /^192\.168\./.test(parsed.hostname) || /^172\.(1[6-9]|2[0-9]|3[0-1])\./.test(parsed.hostname)) return false;
      if (parsed.hostname.includes('s3.mock') || parsed.hostname === 'localhost') return true;
      const allowed = new Set(['digidoc.travel', 'localhost', '127.0.0.1', 's3.amazonaws.com', 's3.mock', 'storage.googleapis.com']);
      return allowed.has(parsed.hostname) || parsed.hostname.endsWith('.amazonaws.com');
    } catch {
      return false;
    }
  }

  private validateForm(): boolean {
    const f = this.form();
    const errors: any = {};
    const studentId = String(f.studentId ?? '').trim();
    if (!studentId) errors.studentId = this.i18n.t('docs.validation.studentRequired');
    else if (!this.uuidRegex.test(studentId)) errors.studentId = this.i18n.t('docs.validation.studentInvalid');
    if (!f.type || !String(f.type).trim()) errors.type = this.i18n.t('docs.validation.typeRequired');
    if (!f.name || !String(f.name).trim()) errors.name = this.i18n.t('docs.validation.nameRequired');
    this.formErrors.set(errors);
    return Object.keys(errors).length === 0;
  }

  private hasValidMagicBytes(buffer: ArrayBuffer, mime: string): boolean {
    const bytes = new Uint8Array(buffer.slice(0, 4));
    const header = Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
    if (mime === 'application/pdf') return header.startsWith('25504446');
    if (mime === 'image/png') return header === '89504e47';
    if (mime.includes('jpeg') || mime === 'image/jpg') return header.startsWith('ffd8ff');
    return true;
  }

  load() {
    this.loading.set(true);
    this.error.set(null);
    const params: any = { page: this.page(), limit: this.limit() };
    if (this.fName().trim()) params.search = this.fName().trim();
    const effectiveType = this.fType().trim() || (this.filterType().trim() || '');
    if (effectiveType) params.type = effectiveType;
    if (this.fCategory().trim()) params.category = this.fCategory().trim();
    if (this.fStatus().trim()) params.status = this.fStatus().trim();
    this.svc.list(params).subscribe({
      next: (r: any) => {
        const data = r?.data ?? (Array.isArray(r) ? r : []);
        const total = r?.total ?? (Array.isArray(data) ? data.length : 0);
        this.docs.set(Array.isArray(data) ? data : []);
        this.total.set(total);
        this.totalPages.set(r?.totalPages ?? (Math.ceil(total / this.limit()) || 1));
        this.loading.set(false);
      },
      error: (e: any) => {
        const message = e.error?.message || e.message || this.i18n.t('docs.errorLoad');
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

  // ---- Filtros por columna (ERP) ----
  onColumnFilter() {
    this.page.set(1);
    this.load();
  }

  hasActiveFilters(): boolean {
    return !!(this.fName() || this.fType() || this.fCategory() || this.fStatus() || this.search() || this.filterType());
  }

  clearColumnFilters(dt?: any) {
    dt?.clear();
    this.fName.set('');
    this.fType.set('');
    this.fCategory.set('');
    this.fStatus.set('');
    this.search.set('');
    this.filterType.set('');
    this.page.set(1);
    this.load();
  }

  onFile(e: any) {
    const selected: any = e.target.files?.[0] || null;
    this.file.set(selected);
    this.fileError.set(null);
    if (!selected) return;

    // Seguridad: validar file type/size antes de upload
    const ext = (selected.name?.split('.').pop()?.toLowerCase() || '');
    if (!this.allowedExt.includes(ext)) {
      const msg = this.i18n.t('docs.fileExtInvalid');
      this.fileError.set(msg);
      this.toast.error(msg);
      this.file.set(null);
      e.target.value = '';
      return;
    }
    if (selected.type && !this.allowedMime.includes(selected.type)) {
      const msg = this.i18n.t('docs.fileMimeInvalid');
      this.fileError.set(msg);
      this.toast.error(msg);
      this.file.set(null);
      e.target.value = '';
      return;
    }
    if (selected.size > this.maxSize) {
      const msg = this.i18n.t('docs.fileTooLarge');
      this.fileError.set(msg);
      this.toast.error(msg);
      this.file.set(null);
      e.target.value = '';
      return;
    }

    // Seguridad: validar magic bytes simple
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const buffer = reader.result as ArrayBuffer;
        const mime = selected.type || 'application/octet-stream';
        if (!this.hasValidMagicBytes(buffer, mime)) {
          const msg = this.i18n.t('docs.fileMagicInvalid');
          this.fileError.set(msg);
          this.toast.error(msg);
          this.file.set(null);
          e.target.value = '';
          return;
        }
        // Si pasa magic bytes, hacer upload
        this.loading.set(true);
        this.svc.upload(selected).subscribe({
          next: (r: any) => {
            const sanitizedUrl = this.sanitize(r.fileUrl || '');
            if (r.fileUrl && !this.isAllowedUrl(r.fileUrl)) {
              this.fileError.set(this.i18n.t('docs.fileUrlBlocked'));
              this.toast.error(this.i18n.t('docs.toastUrlBlocked'));
              this.loading.set(false);
              return;
            }
            this.form.update(f => ({ ...f, fileUrl: sanitizedUrl || r.fileUrl, fileType: r.fileType, fileSize: r.fileSize }));
            this.toast.success(this.i18n.t('docs.toastFileOk'));
            this.loading.set(false);
          },
          error: (err: any) => {
            const message = err.error?.message || this.i18n.t('docs.errorUpload');
            this.fileError.set(message);
            this.toast.error(message);
            this.loading.set(false);
          }
        });
      } catch {
        this.fileError.set(this.i18n.t('docs.fileValidateError'));
        this.loading.set(false);
      }
    };
    reader.onerror = () => {
      this.fileError.set(this.i18n.t('docs.fileReadError'));
      this.toast.error(this.i18n.t('docs.fileReadError'));
    };
    // Leer solo primeros bytes para magic bytes
    reader.readAsArrayBuffer(selected.slice(0, 8));
  }

  private buildPayload(): any | null {
    if (!this.validateForm()) {
      this.toast.error(this.i18n.t('docs.formFixErrors'));
      return null;
    }
    const sanitized = this.sanitizeForm(this.form());
    if (!sanitized.studentId || !sanitized.type || !sanitized.name) {
      this.toast.error(this.i18n.t('docs.formEmptyAfterSanitize'));
      return null;
    }
    if (!this.uuidRegex.test(sanitized.studentId)) {
      this.formErrors.update(e => ({ ...e, studentId: this.i18n.t('docs.validation.studentInvalid') }));
      this.toast.error(this.i18n.t('docs.studentInvalidToast'));
      return null;
    }
    if (sanitized.fileUrl && !this.isAllowedUrl(sanitized.fileUrl)) {
      this.toast.error(this.i18n.t('docs.fileUrlNotAllowed'));
      return null;
    }
    const payload: any = {
      studentId: sanitized.studentId,
      type: sanitized.type,
      name: sanitized.name,
    };
    if (sanitized.description) payload.description = sanitized.description;
    if (sanitized.category) payload.category = sanitized.category;
    if (sanitized.fileUrl) {
      payload.fileUrl = sanitized.fileUrl;
      if (sanitized.fileType) payload.fileType = sanitized.fileType;
      if (sanitized.fileSize != null) payload.fileSize = sanitized.fileSize;
    }
    return payload;
  }

  create() {
    const payload = this.buildPayload();
    if (!payload) return;
    this.loading.set(true);
    this.error.set(null);
    this.svc.create(payload).subscribe({
      next: () => {
        this.msg.set(this.i18n.t('docs.createdOk'));
        this.toast.success(this.i18n.t('docs.createdToast'));
        this.loading.set(false);
        this.closeCreateModal();
        this.page.set(1);
        this.load();
      },
      error: (e: any) => {
        const message = e.error?.message || e.message || this.i18n.t('docs.errorCreate');
        this.msg.set(message);
        this.error.set(message);
        this.toast.error(message);
        this.loading.set(false);
      }
    });
  }

  saveEdit() {
    const target = this.editingDoc();
    if (!target) return;
    const payload = this.buildPayload();
    if (!payload) return;
    // studentId no se edita (vínculo inmutable)
    delete payload.studentId;
    this.loading.set(true);
    this.svc.update(target.id, payload).subscribe({
      next: () => {
        this.toast.success(this.i18n.t('docs.updatedToast'));
        this.loading.set(false);
        this.closeEditModal();
        this.load();
      },
      error: (e: any) => {
        const message = e.error?.message || this.i18n.t('docs.errorUpdate');
        this.toast.error(message);
        this.error.set(message);
        this.loading.set(false);
      }
    });
  }

  download(id: string) {
    this.loading.set(true);
    this.svc.download(id).subscribe({
      next: (r: any) => {
        if (r.url && this.isAllowedUrl(r.url)) {
          window.open(r.url, '_blank');
        } else {
          this.toast.info(this.i18n.t('docs.tempUrl', { url: r.url }));
        }
        this.loading.set(false);
      },
      error: (e: any) => {
        const message = e.error?.message || this.i18n.t('docs.errorDownload');
        this.toast.error(message);
        this.error.set(message);
        this.loading.set(false);
      }
    });
  }

  confirmDelete() {
    const target = this.deleteTarget();
    if (!target) return;
    this.loading.set(true);
    this.svc.remove(target.id).subscribe({
      next: () => {
        this.toast.success(this.i18n.t('docs.deletedToast'));
        this.loading.set(false);
        this.closeDeleteModal();
        this.page.set(1);
        this.load();
      },
      error: (e: any) => {
        const message = e.error?.message || this.i18n.t('docs.errorDelete');
        this.toast.error(message);
        this.error.set(message);
        this.loading.set(false);
      }
    });
  }

  viewHistory(id: string) {
    this.svc.history(id).subscribe({
      next: (r: any) => {
        const data = Array.isArray(r) ? r : r.data ?? [];
        this.history.set(data);
      },
      error: (e: any) => {
        const message = e.error?.message || this.i18n.t('docs.errorHistory');
        this.toast.error(message);
      }
    });
  }
}
