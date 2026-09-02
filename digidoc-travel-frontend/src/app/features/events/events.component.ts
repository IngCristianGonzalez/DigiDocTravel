import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EventsService } from './events.service';
import { LoadingComponent } from '../../shared/components/loading.component';
import { ErrorComponent } from '../../shared/components/error.component';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-events',
  standalone: true,
  imports: [CommonModule, FormsModule, LoadingComponent, ErrorComponent],
  template: `
    <div class="p-6 max-w-6xl mx-auto">
      <h1 class="text-2xl font-bold text-slate-800 mb-6">Gestión de Eventos - RF-037 a RF-041</h1>

      <!-- Loading / Error -->
      <app-loading [show]="loading()" message="Cargando eventos..."></app-loading>
      <app-error [message]="error()" (retry)="load()"></app-error>

      <!-- Crear Evento RF-037 -->
      <div class="bg-white p-6 rounded-xl shadow-sm border border-slate-200 mb-6">
        <h3 class="text-lg font-semibold text-slate-700 mb-4">Crear Evento RF-037</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl">
          <div>
            <label class="block text-sm font-medium text-slate-600 mb-1">Título *</label>
            <input
              placeholder="Título"
              [ngModel]="form().title"
              (ngModelChange)="updateForm('title', $event)"
              class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
              [class.border-red-400]="formErrors().title"
              [class.border-slate-300]="!formErrors().title"
            >
            <p *ngIf="formErrors().title" class="text-xs text-red-500 mt-1">{{ formErrors().title }}</p>
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-600 mb-1">Ubicación</label>
            <input
              placeholder="Ubicación"
              [ngModel]="form().location"
              (ngModelChange)="updateForm('location', $event)"
              class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
            >
          </div>
          <div class="md:col-span-2">
            <label class="block text-sm font-medium text-slate-600 mb-1">Descripción</label>
            <input
              placeholder="Descripción"
              [ngModel]="form().description"
              (ngModelChange)="updateForm('description', $event)"
              class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
              [class.border-red-400]="formErrors().description"
              [class.border-slate-300]="!formErrors().description"
            >
            <p *ngIf="formErrors().description" class="text-xs text-red-500 mt-1">{{ formErrors().description }}</p>
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-600 mb-1">Fecha del Evento *</label>
            <input
              type="datetime-local"
              [ngModel]="form().eventDate"
              (ngModelChange)="updateForm('eventDate', $event)"
              class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
              [class.border-red-400]="formErrors().eventDate"
              [class.border-slate-300]="!formErrors().eventDate"
            >
            <p *ngIf="formErrors().eventDate" class="text-xs text-red-500 mt-1">{{ formErrors().eventDate }}</p>
          </div>
        </div>
        <button (click)="create()" [disabled]="loading()" class="mt-4 bg-sky-500 hover:bg-sky-600 disabled:bg-slate-300 text-white font-medium px-6 py-2 rounded-lg transition-colors">
          Crear - genera QR RF-039 y Link RF-040
        </button>
        <div *ngIf="msg()" class="mt-3 text-sm font-medium" [class.text-green-600]="!error()" [class.text-red-600]="error()">{{ msg() }}</div>
      </div>

      <!-- Tabla con QR y link -->
      <div class="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <table class="w-full border-collapse">
          <thead>
            <tr class="bg-slate-100 text-left text-sm font-semibold text-slate-600">
              <th class="px-4 py-3">Título</th>
              <th class="px-4 py-3">Fecha</th>
              <th class="px-4 py-3">Ubicación</th>
              <th class="px-4 py-3">QR RF-039</th>
              <th class="px-4 py-3">Link RF-040</th>
              <th class="px-4 py-3">Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let e of events()" class="border-t border-slate-200 hover:bg-slate-50 text-sm">
              <td class="px-4 py-3">{{ e.title }}</td>
              <td class="px-4 py-3">{{ e.eventDate | date:'short' }}</td>
              <td class="px-4 py-3">{{ e.location }}</td>
              <td class="px-4 py-3">
                <button (click)="viewQr(e.id)" class="text-xs bg-white border border-slate-300 hover:bg-slate-100 px-3 py-1.5 rounded-lg font-medium transition-colors">Ver QR - RF-039</button>
              </td>
              <td class="px-4 py-3">
                <a [href]="'http://localhost:4200/events/link/'+e.uniqueLink" target="_blank" class="text-xs text-sky-600 hover:text-sky-800 underline">{{ e.uniqueLink | slice:0:8 }}... - RF-040</a>
              </td>
              <td class="px-4 py-3">
                <button (click)="edit(e)" class="text-xs bg-slate-800 hover:bg-slate-900 text-white px-3 py-1.5 rounded-lg font-medium transition-colors">Editar RF-038</button>
              </td>
            </tr>
            <tr *ngIf="!loading() && events().length === 0">
              <td colspan="6" class="px-4 py-8 text-center text-slate-400">No se encontraron eventos</td>
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

      <!-- QR y Enlace único -->
      <div *ngIf="qr()" class="bg-white p-6 mt-6 rounded-xl shadow-sm border border-slate-200">
        <h4 class="text-lg font-semibold text-slate-700 mb-3">QR y Enlace único</h4>
        <img [src]="qr()?.qrCode" class="w-[120px] h-[120px] bg-slate-100 rounded-lg border border-slate-200 object-contain">
        <div class="mt-3 text-sm text-slate-600 break-all">Link: http://localhost:4200/events/link/{{ qr()?.uniqueLink }}</div>
        <small class="block mt-2 text-xs text-slate-400">RF-041 Recordatorio 24h antes vía email/notificación (backend).</small>
      </div>
    </div>
  `
})
export class EventsComponent implements OnInit {
  loading = signal(false);
  error = signal<string | null>(null);
  events = signal<any[]>([]);
  msg = signal('');
  form = signal<any>({ title: '', description: '', eventDate: '', location: '' });
  qr = signal<any>(null);
  page = signal(1);
  total = signal(0);
  totalPages = signal(1);
  limit = signal(10);

  formErrors = signal<{ title?: string; eventDate?: string; description?: string }>({});

  constructor(private svc: EventsService, private toast: ToastService) {}

  ngOnInit() { this.load(); }

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
    if (!title) {
      errors.title = 'El título es obligatorio';
    } else if (/<\s*script/i.test(f.title)) {
      errors.title = 'Contenido no permitido en el título';
    }

    if (!f.eventDate || !String(f.eventDate).trim()) {
      errors.eventDate = 'La fecha del evento es obligatoria';
    } else {
      const d = new Date(f.eventDate);
      if (isNaN(d.getTime())) {
        errors.eventDate = 'Fecha inválida (ISO requerido)';
      } else {
        // validar ISO válido
        try {
          const iso = d.toISOString();
          if (!iso) errors.eventDate = 'Fecha inválida (ISO requerido)';
        } catch {
          errors.eventDate = 'Fecha inválida (ISO requerido)';
        }
        // Seguridad: validar eventDate no pasado lejano (>1 año atrás)
        const oneYearAgo = new Date();
        oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
        if (d < oneYearAgo) {
          errors.eventDate = 'La fecha no puede ser muy antigua (más de 1 año en el pasado)';
        }
        // validación descripción sanitizada (opcional pero seguridad)
        if (f.description && /<\s*script/i.test(f.description)) {
          errors.description = 'Contenido no permitido en la descripción';
        }
      }
    }

    this.formErrors.set(errors);
    return Object.keys(errors).length === 0;
  }

  load() {
    this.loading.set(true);
    this.error.set(null);
    this.svc.list({ page: this.page(), limit: this.limit() }).subscribe({
      next: (r) => {
        this.events.set(r.data ?? r ?? []);
        const totalVal = (r as any).total ?? (Array.isArray(r.data) ? r.data.length : Array.isArray(r) ? r.length : 0);
        this.total.set(totalVal);
        const tp = ((r as any).totalPages ?? Math.ceil(totalVal / this.limit())) || 1;
        this.totalPages.set(tp);
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

    const raw = this.form();
    const sanitized = this.sanitizeForm(raw);

    // Re-validar título sanitizado no vacío
    if (!sanitized.title) {
      this.formErrors.update(e => ({ ...e, title: 'El título es obligatorio' }));
      this.toast.error('El título es obligatorio');
      return;
    }

    // Convertir eventDate a ISO válido
    let isoDate: string;
    try {
      isoDate = new Date(sanitized.eventDate).toISOString();
    } catch {
      this.formErrors.update(e => ({ ...e, eventDate: 'Fecha inválida (ISO requerido)' }));
      this.toast.error('Fecha inválida');
      return;
    }

    if (isNaN(new Date(isoDate).getTime())) {
      this.formErrors.update(e => ({ ...e, eventDate: 'Fecha inválida (ISO requerido)' }));
      this.toast.error('Fecha inválida');
      return;
    }

    // Seguridad: re-validar no pasado lejano después de sanitizar
    const d = new Date(isoDate);
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
    if (d < oneYearAgo) {
      this.formErrors.update(e => ({ ...e, eventDate: 'La fecha no puede ser muy antigua (más de 1 año en el pasado)' }));
      this.toast.error('La fecha no puede ser muy antigua');
      return;
    }

    const payload = { ...sanitized, eventDate: isoDate };

    this.loading.set(true);
    this.error.set(null);
    this.svc.create(payload).subscribe({
      next: () => {
        this.msg.set('Evento creado');
        this.toast.success('Evento creado correctamente');
        this.form.set({ title: '', description: '', eventDate: '', location: '' });
        this.formErrors.set({});
        this.loading.set(false);
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

  viewQr(id: string) {
    this.loading.set(true);
    this.error.set(null);
    this.svc.getQr(id).subscribe({
      next: (r) => {
        this.qr.set(r);
        this.loading.set(false);
      },
      error: (e) => {
        const message = e.error?.message || e.message || 'Error al obtener QR';
        this.error.set(message);
        this.toast.error(message);
        this.loading.set(false);
      }
    });
  }

  edit(e: any) {
    const t = prompt('Nuevo título', e.title);
    if (!t) return;
    if (/<\s*script/i.test(t)) {
      this.toast.error('Contenido no permitido en el título');
      return;
    }
    const sanitized = this.sanitize(t);
    if (!sanitized) {
      this.toast.error('El título es obligatorio');
      return;
    }
    this.loading.set(true);
    this.svc.update(e.id, { title: sanitized }).subscribe({
      next: () => {
        this.toast.success('Evento actualizado');
        this.loading.set(false);
        this.load();
      },
      error: (err) => {
        const message = err.error?.message || err.message || 'Error al actualizar evento';
        this.toast.error(message);
        this.loading.set(false);
      }
    });
  }
}
