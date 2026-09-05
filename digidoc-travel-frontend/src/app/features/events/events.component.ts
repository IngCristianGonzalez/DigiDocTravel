import { Component, OnInit, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EventsService } from './events.service';
import { Event } from '../../shared/interfaces/api.interface';
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

@Component({
  selector: 'app-events',
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
  ],
  templateUrl: './events.component.html',
  styleUrls: ['./events.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EventsComponent implements OnInit {
  loading = signal(false);
  error = signal<string | null>(null);
  events = signal<Event[]>([]);
  msg = signal('');
  form = signal<any>({ title: '', description: '', eventDate: '', location: '' });
  page = signal(1);
  total = signal(0);
  totalPages = signal(1);
  limit = signal(10);
  search = signal('');

  formErrors = signal<{ title?: string; eventDate?: string; description?: string }>({});

  // Modales — crear, editar, detalle y QR (sin prompt nativo ni panel inline)
  showCreateModal = signal(false);
  showEditModal = signal(false);
  showDetailModal = signal(false);
  showQrModal = signal(false);
  detailEvent = signal<Event | null>(null);
  editingEvent = signal<Event | null>(null);
  qrEvent = signal<Event | null>(null);
  qrData = signal<{ qrCode?: string; uniqueLink?: string } | null>(null);

  readonly skeletonRows = Array.from({ length: 8 }, () => ({} as Event));

  constructor(private svc: EventsService, private toast: ToastService) {}

  ngOnInit() { this.load(); }

  // ---- Modales ----
  openCreateModal() {
    this.form.set({ title: '', description: '', eventDate: '', location: '' });
    this.formErrors.set({});
    this.showCreateModal.set(true);
  }

  closeCreateModal() {
    this.showCreateModal.set(false);
  }

  openDetail(e: Event) {
    this.detailEvent.set(e);
    this.showDetailModal.set(true);
    this.svc.get(e.id).subscribe({
      next: (r: any) => this.detailEvent.set(r?.data ?? r),
      error: (err) => this.toast.error(err.error?.message || 'Error al obtener evento'),
    });
  }

  closeDetailModal() {
    this.showDetailModal.set(false);
    this.detailEvent.set(null);
  }

  goFromDetailToEdit() {
    const d = this.detailEvent();
    this.closeDetailModal();
    if (d) this.openEdit(d);
  }

  openEdit(e: Event) {
    this.editingEvent.set(e);
    this.form.set({
      title: e.title ?? '',
      description: e.description ?? '',
      eventDate: this.toLocalInput(e.eventDate ?? ''),
      location: e.location ?? '',
    });
    this.formErrors.set({});
    this.showEditModal.set(true);
  }

  closeEditModal() {
    this.showEditModal.set(false);
    this.editingEvent.set(null);
    this.formErrors.set({});
  }

  openQr(e: Event) {
    this.qrEvent.set(e);
    this.qrData.set(e.qrCode || e.uniqueLink ? { qrCode: e.qrCode, uniqueLink: e.uniqueLink } : null);
    this.showQrModal.set(true);
    this.viewQr(e.id);
  }

  closeQrModal() {
    this.showQrModal.set(false);
    this.qrEvent.set(null);
    this.qrData.set(null);
  }

  onPageChange(event: { first: number; rows: number }) {
    const rows = event.rows || this.limit();
    this.limit.set(rows);
    this.page.set(Math.floor((event.first || 0) / rows) + 1);
    this.load();
  }

  isUpcoming(dateStr?: string): boolean {
    if (!dateStr) return false;
    return new Date(dateStr).getTime() >= Date.now();
  }

  /** Convierte ISO del backend a valor datetime-local */
  private toLocalInput(iso: string): string {
    if (!iso) return '';
    const d = new Date(iso);
    if (isNaN(d.getTime())) return '';
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
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

    const title = f.title ? this.sanitize(f.title) : '';
    if (!title) errors.title = 'El título es obligatorio';
    else if (/<\s*script/i.test(f.title)) errors.title = 'Contenido no permitido en el título';

    if (!f.eventDate || !String(f.eventDate).trim()) {
      errors.eventDate = 'La fecha del evento es obligatoria';
    } else {
      const d = new Date(f.eventDate);
      if (isNaN(d.getTime())) {
        errors.eventDate = 'Fecha inválida';
      } else {
        const oneYearAgo = new Date();
        oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
        if (d < oneYearAgo) errors.eventDate = 'La fecha no puede ser muy antigua (más de 1 año)';
        if (f.description && /<\s*script/i.test(f.description)) errors.description = 'Contenido no permitido en la descripción';
      }
    }

    this.formErrors.set(errors);
    return Object.keys(errors).length === 0;
  }

  private buildPayload(): any | null {
    if (!this.validateForm()) {
      this.toast.error('Corrige los errores del formulario');
      return null;
    }
    const sanitized = this.sanitizeForm(this.form());
    if (!sanitized.title) {
      this.toast.error('El título es obligatorio');
      return null;
    }
    let isoDate: string;
    try {
      isoDate = new Date(sanitized.eventDate).toISOString();
    } catch {
      this.toast.error('Fecha inválida');
      return null;
    }
    if (isNaN(new Date(isoDate).getTime())) {
      this.toast.error('Fecha inválida');
      return null;
    }
    const payload: any = { title: sanitized.title, eventDate: isoDate };
    if (sanitized.description) payload.description = sanitized.description;
    if (sanitized.location) payload.location = sanitized.location;
    return payload;
  }

  load() {
    this.loading.set(true);
    this.error.set(null);
    this.svc.list({ search: this.search() || undefined, page: this.page(), limit: this.limit() }).subscribe({
      next: (r: any) => {
        const data = r?.data ?? (Array.isArray(r) ? r : []);
        const total = r?.total ?? (Array.isArray(data) ? data.length : 0);
        this.events.set(Array.isArray(data) ? data : []);
        this.total.set(total);
        this.totalPages.set(r?.totalPages ?? (Math.ceil(total / this.limit()) || 1));
        this.loading.set(false);
      },
      error: (e) => {
        const message = e.error?.message || e.message || 'Error al cargar eventos';
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

  create() {
    const payload = this.buildPayload();
    if (!payload) return;
    this.loading.set(true);
    this.error.set(null);
    this.svc.create(payload).subscribe({
      next: () => {
        this.msg.set('Evento creado');
        this.toast.success('Evento creado correctamente');
        this.loading.set(false);
        this.closeCreateModal();
        this.page.set(1);
        this.load();
      },
      error: (e) => {
        const message = e.error?.message || e.message || 'Error al crear evento';
        this.msg.set(message);
        this.error.set(message);
        this.toast.error(message);
        this.loading.set(false);
      }
    });
  }

  saveEdit() {
    const target = this.editingEvent();
    if (!target) return;
    const payload = this.buildPayload();
    if (!payload) return;
    this.loading.set(true);
    this.svc.update(target.id, payload).subscribe({
      next: () => {
        this.toast.success('Evento actualizado');
        this.loading.set(false);
        this.closeEditModal();
        this.load();
      },
      error: (err) => {
        this.toast.error(err.error?.message || 'Error al actualizar evento');
        this.loading.set(false);
      }
    });
  }

  viewQr(id: string) {
    this.svc.getQr(id).subscribe({
      next: (r: any) => {
        const data = r?.data ?? r;
        this.qrData.set({ qrCode: data?.qrCode, uniqueLink: data?.uniqueLink });
      },
      error: (e) => {
        this.toast.error(e.error?.message || 'Error al obtener QR');
      }
    });
  }

  shareLink(): string {
    const link = this.qrData()?.uniqueLink ?? this.qrEvent()?.uniqueLink ?? '';
    return link ? `${window.location.origin}/events/link/${link}` : '';
  }

  copyLink() {
    const url = this.shareLink();
    if (!url) {
      this.toast.error('No hay enlace para copiar');
      return;
    }
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url).then(
        () => this.toast.success('Enlace copiado'),
        () => this.toast.error('No se pudo copiar el enlace'),
      );
    } else {
      this.toast.info(url);
    }
  }
}
