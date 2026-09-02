import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReportsService } from './reports.service';
import { LoadingComponent } from '../../shared/components/loading.component';
import { ErrorComponent } from '../../shared/components/error.component';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule, FormsModule, LoadingComponent, ErrorComponent],
  template: `
    <div class="p-6 max-w-6xl mx-auto">
      <h1 class="text-2xl font-bold text-slate-800 mb-6">Reportes - RF-046 a RF-050</h1>

      <!-- Loading / Error / Toast -->
      <app-loading [show]="loading()" message="Cargando reporte..."></app-loading>
      <app-error [message]="error()" (retry)="reload()"></app-error>

      <div class="flex flex-wrap gap-3 mb-6">
        <button (click)="load('students')" [class.bg-indigo-600]="currentType()==='students'" [class.bg-slate-800]="currentType()!=='students'" class="hover:opacity-90 text-white font-medium px-5 py-2.5 rounded-lg shadow-sm transition-colors">
          Estudiantes RF-046
        </button>
        <button (click)="load('documents')" [class.bg-indigo-600]="currentType()==='documents'" [class.bg-slate-800]="currentType()!=='documents'" class="hover:opacity-90 text-white font-medium px-5 py-2.5 rounded-lg shadow-sm transition-colors">
          Documentos RF-047
        </button>
        <button (click)="load('visas')" [class.bg-indigo-600]="currentType()==='visas'" [class.bg-slate-800]="currentType()!=='visas'" class="hover:opacity-90 text-white font-medium px-5 py-2.5 rounded-lg shadow-sm transition-colors">
          Visas RF-048
        </button>
        <button (click)="load('payments')" [class.bg-indigo-600]="currentType()==='payments'" [class.bg-slate-800]="currentType()!=='payments'" class="hover:opacity-90 text-white font-medium px-5 py-2.5 rounded-lg shadow-sm transition-colors">
          Pagos RF-049
        </button>
      </div>

      <div *ngIf="data()" class="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <div class="flex items-start justify-between gap-4 mb-4">
          <div>
            <h3 class="text-lg font-semibold text-slate-700">Resultado - Total: {{data()?.total}} - Generado: {{data()?.generatedAt | date:'short'}}</h3>
            <p *ngIf="data()?.totalAmount" class="text-sm text-slate-600 mt-1">Total monto: \${{data()?.totalAmount}}</p>
            <p class="text-xs text-slate-400 mt-1">Tipo actual: {{ currentType() }} — Página {{ page() }}</p>
          </div>
          <span class="px-3 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-700">{{ currentType() | uppercase }}</span>
        </div>

        <div class="bg-slate-50 border border-slate-200 rounded-lg p-4">
          <p class="text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wide">JSON sanitizado</p>
          <pre class="max-h-[320px] overflow-auto bg-white border border-slate-200 rounded-lg p-3 text-xs leading-relaxed text-slate-700">{{ sanitizedJson() }}</pre>
        </div>

        <div class="mt-6 flex flex-wrap gap-3">
          <button (click)="export('pdf')" [disabled]="loading()" class="bg-sky-500 hover:bg-sky-600 disabled:bg-slate-300 text-white font-medium px-5 py-2 rounded-lg transition-colors">
            Exportar PDF RF-050
          </button>
          <button (click)="export('excel')" [disabled]="loading()" class="bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-300 text-white font-medium px-5 py-2 rounded-lg transition-colors">
            Exportar Excel RF-050
          </button>
        </div>
        <div *ngIf="exportMsg()" class="mt-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-lg text-sm font-medium">{{exportMsg()}}</div>
      </div>

      <div *ngIf="!loading() && !data() && !error()" class="bg-white p-12 rounded-xl shadow-sm border border-slate-200 text-center mt-6">
        <p class="text-slate-400">Selecciona un tipo de reporte para visualizar datos</p>
        <p class="text-xs text-slate-300 mt-2">RF-046 students · RF-047 documents · RF-048 visas · RF-049 payments · RF-050 export</p>
      </div>
    </div>
  `
})
export class ReportsComponent {
  loading = signal(false);
  error = signal<string | null>(null);
  data = signal<any>(null);
  currentType = signal<string>('students');
  exportMsg = signal('');
  page = signal(1);

  // Seguridad: whitelist de tipos permitidos
  private readonly allowedTypes = ['students', 'documents', 'visas', 'payments'] as const;
  private readonly allowedExport = ['pdf', 'excel'] as const;

  // Sanitización: strip tags, < >, .., /\ y trim
  private sanitize(value: string): string {
    if (!value) return '';
    return value
      .replace(/<[^>]*>/g, '')
      .replace(/[<>]/g, '')
      .replace(/\.\./g, '')
      .replace(/[\/\\]/g, '')
      .trim();
  }

  private isValidType(type: string): boolean {
    return (this.allowedTypes as readonly string[]).includes(type);
  }

  // Computed: data sanitizada para pre con json sanitizado
  sanitizedData = computed(() => {
    const raw = this.data();
    if (!raw) return null;
    try {
      const str = JSON.stringify(raw);
      // sanitizar strings peligrosas dentro del JSON
      const sanitizedStr = str
        .replace(/<[^>]*>/g, '')
        .replace(/javascript:/gi, '')
        .replace(/on\w+=/gi, '');
      return JSON.parse(sanitizedStr);
    } catch {
      return raw;
    }
  });

  sanitizedJson = computed(() => {
    const d = this.sanitizedData();
    if (!d) return '';
    try {
      // pretty print sanitizado
      return JSON.stringify(d, null, 2)
        .replace(/<[^>]*>/g, '');
    } catch {
      return '';
    }
  });

  constructor(private svc: ReportsService, private toast: ToastService) {}

  reload() {
    this.load(this.currentType());
  }

  load(type: string) {
    // Validación y sanitización de tipo de reporte
    const sanitizedType = this.sanitize(type);

    // Seguridad: validar type en whitelist [students,documents,visas,payments]
    if (!sanitizedType || !this.isValidType(sanitizedType)) {
      const msg = `Tipo de reporte no permitido: ${sanitizedType || type}. Permitidos: ${this.allowedTypes.join(', ')}`;
      this.error.set(msg);
      this.toast.error(msg);
      return;
    }

    this.currentType.set(sanitizedType);
    this.loading.set(true);
    this.error.set(null);
    this.exportMsg.set('');

    // Mantener RF-046 a RF-050 intactos (students RF-046, documents RF-047, visas RF-048, payments RF-049)
    const obs =
      sanitizedType === 'students' ? this.svc.students({ page: this.page() }) :
      sanitizedType === 'documents' ? this.svc.documents({ page: this.page() }) :
      sanitizedType === 'visas' ? this.svc.visas({ page: this.page() }) :
      this.svc.payments({ page: this.page() });

    obs.subscribe({
      next: (r) => {
        this.data.set(r);
        this.loading.set(false);
        this.toast.success(`Reporte ${sanitizedType} cargado correctamente`);
      },
      error: (e) => {
        const message = e?.error?.message || e?.message || `Error al cargar reporte ${sanitizedType}`;
        this.error.set(message);
        this.toast.error(message);
        this.loading.set(false);
      }
    });
  }

  export(fmt: 'pdf' | 'excel') {
    // Sanitizar y validar formato
    const sanitizedFmt = this.sanitize(fmt) as 'pdf' | 'excel';
    if (!(this.allowedExport as readonly string[]).includes(sanitizedFmt)) {
      const msg = `Formato de exportación no permitido: ${sanitizedFmt}`;
      this.toast.error(msg);
      this.error.set(msg);
      return;
    }

    // Seguridad: validar type en whitelist antes de export
    const type = this.sanitize(this.currentType());
    if (!this.isValidType(type)) {
      const msg = `Tipo de reporte no permitido para exportar: ${type}`;
      this.toast.error(msg);
      this.error.set(msg);
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    // Export PDF/Excel RF-050 intacto
    this.svc.export(type, sanitizedFmt).subscribe({
      next: (r) => {
        const filename = this.sanitize(r.filename || `${type}.${sanitizedFmt}`);
        const contentType = this.sanitize(r.contentType || '');
        this.exportMsg.set(`Exportado: ${filename} (${contentType})`);
        this.toast.success(`Exportado: ${filename} (${contentType}) - RF-050`);
        this.loading.set(false);
      },
      error: (e) => {
        const message = e?.error?.message || e?.message || 'Error al exportar reporte RF-050';
        this.error.set(message);
        this.toast.error(message);
        this.loading.set(false);
      }
    });
  }
}
