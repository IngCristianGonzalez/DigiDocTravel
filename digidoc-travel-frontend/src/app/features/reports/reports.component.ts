import { Component, signal, computed, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReportsService } from './reports.service';
import { LoadingComponent } from '../../shared/components/loading.component';
import { ErrorComponent } from '../../shared/components/error.component';
import { ToastService } from '../../core/services/toast.service';

// PrimeNG - SL Global · PrimeNG 17
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';

export type ReportType = 'students' | 'documents' | 'visas' | 'payments';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule, FormsModule, LoadingComponent, ErrorComponent, ButtonModule, TagModule],
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReportsComponent {
  loading = signal(false);
  error = signal<string | null>(null);
  data = signal<any>(null);
  currentType = signal<ReportType>('students');
  exportMsg = signal('');
  page = signal(1);

  readonly reportTabs: { value: ReportType; label: string }[] = [
    { value: 'students', label: 'Estudiantes' },
    { value: 'documents', label: 'Documentos' },
    { value: 'visas', label: 'Visas' },
    { value: 'payments', label: 'Pagos' },
  ];

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

    this.currentType.set(sanitizedType as ReportType);
    this.loading.set(true);
    this.error.set(null);
    this.exportMsg.set('');

    // Reportes por módulo (students, documents, visas, payments)
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

    // Export PDF/Excel
    this.svc.export(type, sanitizedFmt).subscribe({
      next: (r) => {
        const filename = this.sanitize(r.filename || `${type}.${sanitizedFmt}`);
        const contentType = this.sanitize(r.contentType || '');
        this.exportMsg.set(`Exportado: ${filename} (${contentType})`);
        this.toast.success(`Exportado: ${filename} (${contentType})`);
        this.loading.set(false);
      },
      error: (e) => {
        const message = e?.error?.message || e?.message || 'Error al exportar reporte';
        this.error.set(message);
        this.toast.error(message);
        this.loading.set(false);
      }
    });
  }
}
