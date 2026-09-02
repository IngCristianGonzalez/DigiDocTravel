import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DocumentsService } from './documents.service';
import { LoadingComponent } from '../../shared/components/loading.component';
import { ErrorComponent } from '../../shared/components/error.component';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-documents',
  standalone: true,
  imports: [CommonModule, FormsModule, LoadingComponent, ErrorComponent],
  template: `
    <div class="p-6 max-w-6xl mx-auto">
      <h1 class="text-2xl font-bold text-slate-800 mb-6">Gestión Documental - RF-017 a RF-024</h1>

      <!-- Loading / Error -->
      <app-loading [show]="loading()" message="Cargando documentos..."></app-loading>
      <app-error [message]="error()" (retry)="load()"></app-error>

      <!-- RF-017 / RF-018 Registrar / Cargar Documento -->
      <div class="bg-white p-6 rounded-xl shadow-sm border border-slate-200 mb-6">
        <h3 class="text-lg font-semibold text-slate-700 mb-4">Registrar / Cargar Documento RF-017/018</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl">
          <div>
            <label class="block text-sm font-medium text-slate-600 mb-1">Student ID *</label>
            <input
              placeholder="Student ID (UUID)"
              [ngModel]="form().studentId"
              (ngModelChange)="updateForm('studentId', $event)"
              class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
              [class.border-red-400]="formErrors().studentId"
              [class.border-slate-300]="!formErrors().studentId"
            >
            <p *ngIf="formErrors().studentId" class="text-xs text-red-500 mt-1">{{ formErrors().studentId }}</p>
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-600 mb-1">Tipo *</label>
            <input
              placeholder="Tipo (passport, visa...)"
              [ngModel]="form().type"
              (ngModelChange)="updateForm('type', $event)"
              class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
              [class.border-red-400]="formErrors().type"
              [class.border-slate-300]="!formErrors().type"
            >
            <p *ngIf="formErrors().type" class="text-xs text-red-500 mt-1">{{ formErrors().type }}</p>
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-600 mb-1">Nombre *</label>
            <input
              placeholder="Nombre"
              [ngModel]="form().name"
              (ngModelChange)="updateForm('name', $event)"
              class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
              [class.border-red-400]="formErrors().name"
              [class.border-slate-300]="!formErrors().name"
            >
            <p *ngIf="formErrors().name" class="text-xs text-red-500 mt-1">{{ formErrors().name }}</p>
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-600 mb-1">Categoría</label>
            <select
              [ngModel]="form().category"
              (ngModelChange)="updateForm('category', $event)"
              class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 bg-white"
            >
              <option value="">Sin categoría</option>
              <option value="identity">Identidad - RF-023</option>
              <option value="academic">Académico</option>
              <option value="financial">Financiero</option>
            </select>
          </div>
          <div class="md:col-span-2">
            <label class="block text-sm font-medium text-slate-600 mb-1">Archivo (PDF, JPG, PNG — máx 10MB)</label>
            <input type="file" (change)="onFile($event)" accept=".pdf,.jpg,.jpeg,.png" class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 bg-white file:mr-4 file:py-1 file:px-3 file:rounded-lg file:border-0 file:bg-slate-100 file:text-slate-700">
            <p *ngIf="fileError()" class="text-xs text-red-500 mt-1">{{ fileError() }}</p>
            <p *ngIf="form().fileUrl" class="text-xs text-emerald-600 mt-1 truncate">✓ {{ form().fileUrl }} ({{ form().fileType }} - {{ form().fileSize }} bytes)</p>
          </div>
        </div>
        <button (click)="create()" [disabled]="loading()" class="mt-4 bg-sky-500 hover:bg-sky-600 disabled:bg-slate-300 text-white font-medium px-6 py-2 rounded-lg transition-colors">
          Registrar
        </button>
        <div *ngIf="msg()" class="mt-3 text-sm font-medium" [class.text-green-600]="!error()" [class.text-red-600]="error()">{{ msg() }}</div>
      </div>

      <!-- RF-022 Filtros / Buscar -->
      <div class="flex flex-col sm:flex-row gap-3 mb-4">
        <input
          placeholder="Buscar por nombre o tipo..."
          [ngModel]="search()"
          (ngModelChange)="search.set($event)"
          (keyup.enter)="resetAndLoad()"
          class="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
        >
        <select
          [ngModel]="filterType()"
          (ngModelChange)="filterType.set($event)"
          class="px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 bg-white"
        >
          <option value="">Todos tipos</option>
          <option value="passport">Passport</option>
          <option value="visa">Visa</option>
          <option value="financial">Financial</option>
          <option value="academic">Academic</option>
        </select>
        <button (click)="resetAndLoad()" class="bg-slate-800 hover:bg-slate-900 text-white px-6 py-2 rounded-lg font-medium transition-colors">Buscar RF-022</button>
      </div>

      <!-- Tabla -->
      <div class="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full border-collapse">
            <thead>
              <tr class="bg-slate-100 text-left text-sm font-semibold text-slate-600">
                <th class="px-4 py-3">Nombre</th>
                <th class="px-4 py-3">Tipo</th>
                <th class="px-4 py-3">Categoría</th>
                <th class="px-4 py-3">Estado</th>
                <th class="px-4 py-3">Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let d of docs()" class="border-t border-slate-200 hover:bg-slate-50 text-sm">
                <td class="px-4 py-3 font-medium text-slate-800">{{ d.name }}</td>
                <td class="px-4 py-3">{{ d.type }}</td>
                <td class="px-4 py-3">{{ d.category || '-' }}</td>
                <td class="px-4 py-3"><span class="px-2 py-1 rounded-full text-xs font-medium" [class.bg-emerald-100]="d.status==='approved'" [class.text-emerald-700]="d.status==='approved'" [class.bg-amber-100]="d.status==='pending'" [class.text-amber-700]="d.status==='pending'" [class.bg-slate-100]="!d.status || (d.status!=='approved' && d.status!=='pending')">{{ d.status || 'pending' }}</span></td>
                <td class="px-4 py-3">
                  <div class="flex flex-wrap gap-1.5">
                    <button (click)="download(d.id)" class="text-xs bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-200 px-3 py-1.5 rounded-lg font-medium transition-colors">Descargar RF-021</button>
                    <button (click)="edit(d)" class="text-xs bg-white hover:bg-slate-100 border border-slate-300 px-3 py-1.5 rounded-lg font-medium transition-colors">Editar RF-019</button>
                    <button (click)="remove(d.id)" class="text-xs bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded-lg font-medium transition-colors">Eliminar RF-020</button>
                    <button (click)="viewHistory(d.id)" class="text-xs bg-slate-800 hover:bg-slate-900 text-white px-3 py-1.5 rounded-lg font-medium transition-colors">Historial RF-024</button>
                  </div>
                </td>
              </tr>
              <tr *ngIf="!loading() && docs().length === 0">
                <td colspan="5" class="px-4 py-8 text-center text-slate-400">No se encontraron documentos</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Paginación -->
        <div class="flex items-center justify-between px-4 py-3 border-t border-slate-200 bg-slate-50">
          <span class="text-sm text-slate-600">Página {{ page() }} de {{ totalPages() }} — Total: {{ total() }} registros</span>
          <div class="flex gap-2">
            <button (click)="prevPage()" [disabled]="page() <= 1" class="px-4 py-1.5 rounded-lg border text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed bg-white border-slate-300 hover:bg-slate-100">Anterior</button>
            <button (click)="nextPage()" [disabled]="page() >= totalPages()" class="px-4 py-1.5 rounded-lg border text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed bg-white border-slate-300 hover:bg-slate-100">Siguiente</button>
          </div>
        </div>
      </div>

      <!-- Historial RF-024 -->
      <div *ngIf="history().length" class="bg-white p-6 mt-6 rounded-xl shadow-sm border border-slate-200">
        <h4 class="text-base font-semibold text-slate-700 mb-3">Historial RF-024</h4>
        <ul class="space-y-2">
          <li *ngFor="let h of history()" class="bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 text-sm flex justify-between gap-4">
            <span class="font-medium text-slate-700">{{ h.action }}</span>
            <span class="text-slate-500">{{ h.createdAt | date:'short' }}</span>
            <span class="text-slate-400 truncate max-w-[40%]">{{ h.changes | json }}</span>
          </li>
        </ul>
      </div>
    </div>
  `
})
export class DocumentsComponent implements OnInit {
  loading = signal(false);
  error = signal<string | null>(null);
  docs = signal<any[]>([]);
  search = signal('');
  filterType = signal('');
  form = signal<any>({ studentId: '', type: 'passport', name: '', category: '', fileUrl: '', fileType: '', fileSize: null });
  msg = signal('');
  history = signal<any[]>([]);
  page = signal(1);
  total = signal(0);
  totalPages = signal(1);
  limit = signal(10);
  file = signal<any>(null);

  formErrors = signal<{ studentId?: string; type?: string; name?: string }>({});
  fileError = signal<string | null>(null);

  private readonly allowedExt = ['pdf', 'jpg', 'jpeg', 'png'];
  private readonly allowedMime = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
  private readonly maxSize = 10 * 1024 * 1024;

  constructor(private svc: DocumentsService, private toast: ToastService) {}

  ngOnInit() {
    this.load();
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
        // name y fileUrl requieren sanitización estricta
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
    if (!f.studentId || !String(f.studentId).trim()) errors.studentId = 'Student ID es obligatorio';
    if (!f.type || !String(f.type).trim()) errors.type = 'Tipo es obligatorio';
    if (!f.name || !String(f.name).trim()) errors.name = 'Nombre es obligatorio';
    this.formErrors.set(errors);
    return Object.keys(errors).length === 0;
  }

  private validateFileType(mime: string, name: string): boolean {
    const ext = name.split('.').pop()?.toLowerCase() || '';
    return this.allowedMime.includes(mime) && this.allowedExt.includes(ext);
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
        this.docs.set(r.data ?? []);
        this.total.set(r.total ?? r.data?.length ?? 0);
        const tp = (r.totalPages ?? Math.ceil((r.total ?? 0) / this.limit())) || 1;
        this.totalPages.set(tp);
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
            // Seguridad: sanitizar fileUrl con isAllowedUrl check cliente
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

  create() {
    if (!this.validateForm()) {
      this.toast.error('Corrige los errores del formulario');
      return;
    }
    const sanitized = this.sanitizeForm(this.form());
    // Validación sanitizada no vacía
    if (!sanitized.studentId || !sanitized.type || !sanitized.name) {
      this.toast.error('Campos obligatorios vacíos tras sanitización');
      return;
    }
    // Seguridad: sanitizar fileUrl con isAllowedUrl check cliente si existe
    if (sanitized.fileUrl) {
      if (!this.isAllowedUrl(sanitized.fileUrl)) {
        this.toast.error('fileUrl no permitida');
        this.error.set('fileUrl no permitida');
        return;
      }
    }
    this.loading.set(true);
    this.error.set(null);
    this.svc.create({ ...sanitized }).subscribe({
      next: () => {
        this.msg.set('Documento registrado');
        this.toast.success('Documento registrado correctamente');
        this.form.set({ studentId: '', type: 'passport', name: '', category: '', fileUrl: '', fileType: '', fileSize: null });
        this.formErrors.set({});
        this.file.set(null);
        this.fileError.set(null);
        this.loading.set(false);
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

  download(id: string) {
    this.loading.set(true);
    this.svc.download(id).subscribe({
      next: (r: any) => {
        this.toast.info('URL temporal (1h): ' + r.url);
        // Opcional: abrir en nueva pestaña si esAllowedUrl
        if (r.url && this.isAllowedUrl(r.url)) {
          window.open(r.url, '_blank');
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

  edit(d: any) {
    const raw = prompt('Nuevo nombre', d.name);
    if (raw === null) return;
    const sanitized = this.sanitize(raw);
    if (!sanitized) {
      this.toast.error('Nombre no puede estar vacío');
      return;
    }
    this.loading.set(true);
    this.svc.update(d.id, { name: sanitized }).subscribe({
      next: () => {
        this.toast.success('Documento actualizado');
        this.loading.set(false);
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

  remove(id: string) {
    if (!confirm('¿Eliminar documento?')) return;
    this.loading.set(true);
    this.svc.remove(id).subscribe({
      next: () => {
        this.toast.success('Documento eliminado');
        this.loading.set(false);
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
    this.loading.set(true);
    this.svc.history(id).subscribe({
      next: (r: any) => {
        const data = Array.isArray(r) ? r : r.data ?? [];
        this.history.set(data);
        this.loading.set(false);
      },
      error: (e: any) => {
        const message = e.error?.message || 'Error al cargar historial';
        this.toast.error(message);
        this.error.set(message);
        this.loading.set(false);
      }
    });
  }
}
