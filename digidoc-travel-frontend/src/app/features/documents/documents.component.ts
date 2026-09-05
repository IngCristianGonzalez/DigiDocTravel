import { Component, OnInit, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DocumentsService } from './documents.service';
import { Document } from '../../shared/interfaces/api.interface';
import { LoadingComponent } from '../../shared/components/loading.component';
import { ErrorComponent } from '../../shared/components/error.component';
import { ToastService } from '../../core/services/toast.service';

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
  loading = signal(false);
  error = signal<string | null>(null);
  docs = signal<Document[]>([]);
  search = signal('');
  filterType = signal('');
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
      error: (e) => this.toast.error(e.error?.message || 'Error al obtener documento'),
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
    if (!studentId) errors.studentId = 'Student ID es obligatorio';
    else if (!this.uuidRegex.test(studentId)) errors.studentId = 'Debe ser un UUID válido';
    if (!f.type || !String(f.type).trim()) errors.type = 'Tipo es obligatorio';
    if (!f.name || !String(f.name).trim()) errors.name = 'Nombre es obligatorio';
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
    this.svc.list({ search: this.search() || undefined, type: this.filterType() || undefined, page: this.page(), limit: this.limit() }).subscribe({
      next: (r: any) => {
        const data = r?.data ?? (Array.isArray(r) ? r : []);
        const total = r?.total ?? (Array.isArray(data) ? data.length : 0);
        this.docs.set(Array.isArray(data) ? data : []);
        this.total.set(total);
        this.totalPages.set(r?.totalPages ?? (Math.ceil(total / this.limit()) || 1));
        this.loading.set(false);
      },
      error: (e: any) => {
        const message = e.error?.message || e.message || 'Error al cargar documentos';
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

  onFile(e: any) {
    const selected: any = e.target.files?.[0] || null;
    this.file.set(selected);
    this.fileError.set(null);
    if (!selected) return;

    // Seguridad: validar file type/size antes de upload
    const ext = (selected.name?.split('.').pop()?.toLowerCase() || '');
    if (!this.allowedExt.includes(ext)) {
      const msg = 'Tipo de archivo no permitido. Solo pdf, jpg, jpeg, png';
      this.fileError.set(msg);
      this.toast.error(msg);
      this.file.set(null);
      e.target.value = '';
      return;
    }
    if (selected.type && !this.allowedMime.includes(selected.type)) {
      const msg = 'Mimetype no permitido';
      this.fileError.set(msg);
      this.toast.error(msg);
      this.file.set(null);
      e.target.value = '';
      return;
    }
    if (selected.size > this.maxSize) {
      const msg = 'Archivo excede 10MB';
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
          const msg = 'Contenido no coincide con el tipo declarado (magic bytes)';
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
              this.fileError.set('URL de archivo no permitida (SSRF)');
              this.toast.error('URL generada no permitida');
              this.loading.set(false);
              return;
            }
            this.form.update(f => ({ ...f, fileUrl: sanitizedUrl || r.fileUrl, fileType: r.fileType, fileSize: r.fileSize }));
            this.toast.success('Archivo cargado correctamente');
            this.loading.set(false);
          },
          error: (err: any) => {
            const message = err.error?.message || 'Error al subir archivo';
            this.fileError.set(message);
            this.toast.error(message);
            this.loading.set(false);
          }
        });
      } catch {
        this.fileError.set('Error al validar archivo');
        this.loading.set(false);
      }
    };
    reader.onerror = () => {
      this.fileError.set('Error al leer archivo');
      this.toast.error('Error al leer archivo');
    };
    // Leer solo primeros bytes para magic bytes
    reader.readAsArrayBuffer(selected.slice(0, 8));
  }

  private buildPayload(): any | null {
    if (!this.validateForm()) {
      this.toast.error('Corrige los errores del formulario');
      return null;
    }
    const sanitized = this.sanitizeForm(this.form());
    if (!sanitized.studentId || !sanitized.type || !sanitized.name) {
      this.toast.error('Campos obligatorios vacíos tras sanitización');
      return null;
    }
    if (!this.uuidRegex.test(sanitized.studentId)) {
      this.formErrors.update(e => ({ ...e, studentId: 'Debe ser un UUID válido' }));
      this.toast.error('Student ID inválido');
      return null;
    }
    if (sanitized.fileUrl && !this.isAllowedUrl(sanitized.fileUrl)) {
      this.toast.error('fileUrl no permitida');
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
        this.msg.set('Documento registrado');
        this.toast.success('Documento registrado correctamente');
        this.loading.set(false);
        this.closeCreateModal();
        this.page.set(1);
        this.load();
      },
      error: (e: any) => {
        const message = e.error?.message || e.message || 'Error al crear documento';
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
        this.toast.success('Documento actualizado');
        this.loading.set(false);
        this.closeEditModal();
        this.load();
      },
      error: (e: any) => {
        const message = e.error?.message || 'Error al editar';
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
          this.toast.info('URL temporal (1h): ' + r.url);
        }
        this.loading.set(false);
      },
      error: (e: any) => {
        const message = e.error?.message || 'Error al descargar';
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
        this.toast.success('Documento eliminado');
        this.loading.set(false);
        this.closeDeleteModal();
        this.page.set(1);
        this.load();
      },
      error: (e: any) => {
        const message = e.error?.message || 'Error al eliminar';
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
        const message = e.error?.message || 'Error al cargar historial';
        this.toast.error(message);
      }
    });
  }
}
