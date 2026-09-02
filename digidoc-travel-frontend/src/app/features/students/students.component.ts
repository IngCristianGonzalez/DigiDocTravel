import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StudentsService } from './students.service';
import { Student } from '../../shared/interfaces/api.interface';
import { LoadingComponent } from '../../shared/components/loading.component';
import { ErrorComponent } from '../../shared/components/error.component';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-students',
  standalone: true,
  imports: [CommonModule, FormsModule, LoadingComponent, ErrorComponent],
  template: `
    <div class="p-6 max-w-6xl mx-auto">
      <h1 class="text-2xl font-bold text-slate-800 mb-6">Gestión de Estudiantes - RF-012 a RF-016</h1>

      <!-- Loading / Error -->
      <app-loading [show]="loading()" message="Cargando estudiantes..."></app-loading>
      <app-error [message]="error()" (retry)="load()"></app-error>

      <!-- RF-012 Registrar Estudiante -->
      <div class="bg-white p-6 rounded-xl shadow-sm border border-slate-200 mb-6">
        <h3 class="text-lg font-semibold text-slate-700 mb-4">Registrar Estudiante - RF-012</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl">
          <!-- firstName -->
          <div>
            <label class="block text-sm font-medium text-slate-600 mb-1">Nombre *</label>
            <input
              placeholder="Nombre"
              [ngModel]="form().firstName"
              (ngModelChange)="updateForm('firstName', $event)"
              class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
              [class.border-red-400]="formErrors().firstName"
              [class.border-slate-300]="!formErrors().firstName"
            >
            <p *ngIf="formErrors().firstName" class="text-xs text-red-500 mt-1">{{ formErrors().firstName }}</p>
          </div>
          <!-- lastName -->
          <div>
            <label class="block text-sm font-medium text-slate-600 mb-1">Apellido *</label>
            <input
              placeholder="Apellido"
              [ngModel]="form().lastName"
              (ngModelChange)="updateForm('lastName', $event)"
              class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
              [class.border-red-400]="formErrors().lastName"
              [class.border-slate-300]="!formErrors().lastName"
            >
            <p *ngIf="formErrors().lastName" class="text-xs text-red-500 mt-1">{{ formErrors().lastName }}</p>
          </div>
          <!-- email -->
          <div>
            <label class="block text-sm font-medium text-slate-600 mb-1">Email *</label>
            <input
              placeholder="Email"
              [ngModel]="form().email"
              (ngModelChange)="updateForm('email', $event)"
              class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
              [class.border-red-400]="formErrors().email"
              [class.border-slate-300]="!formErrors().email"
            >
            <p *ngIf="formErrors().email" class="text-xs text-red-500 mt-1">{{ formErrors().email }}</p>
          </div>
          <!-- countryOrigin -->
          <div>
            <label class="block text-sm font-medium text-slate-600 mb-1">País Origen *</label>
            <input
              placeholder="País Origen"
              [ngModel]="form().countryOrigin"
              (ngModelChange)="updateForm('countryOrigin', $event)"
              class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
              [class.border-red-400]="formErrors().countryOrigin"
              [class.border-slate-300]="!formErrors().countryOrigin"
            >
            <p *ngIf="formErrors().countryOrigin" class="text-xs text-red-500 mt-1">{{ formErrors().countryOrigin }}</p>
          </div>
          <!-- phone -->
          <div>
            <label class="block text-sm font-medium text-slate-600 mb-1">Teléfono</label>
            <input
              placeholder="Teléfono"
              [ngModel]="form().phone"
              (ngModelChange)="updateForm('phone', $event)"
              class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
            >
          </div>
          <!-- university -->
          <div>
            <label class="block text-sm font-medium text-slate-600 mb-1">Universidad</label>
            <input
              placeholder="Universidad"
              [ngModel]="form().university"
              (ngModelChange)="updateForm('university', $event)"
              class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
            >
          </div>
        </div>
        <button (click)="create()" [disabled]="loading()" class="mt-4 bg-sky-500 hover:bg-sky-600 disabled:bg-slate-300 text-white font-medium px-6 py-2 rounded-lg transition-colors">
          Registrar
        </button>
        <div *ngIf="msg()" class="mt-3 text-sm font-medium" [class.text-green-600]="!error()" [class.text-red-600]="error()">{{ msg() }}</div>
      </div>

      <!-- RF-014 Buscar -->
      <div class="flex gap-3 mb-4">
        <input
          placeholder="Buscar por nombre, email o país..."
          [ngModel]="search()"
          (ngModelChange)="search.set($event)"
          (keyup.enter)="resetAndLoad()"
          class="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
        >
        <button (click)="resetAndLoad()" class="bg-slate-800 hover:bg-slate-900 text-white px-6 py-2 rounded-lg font-medium transition-colors">Buscar - RF-014</button>
      </div>

      <!-- Tabla -->
      <div class="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <table class="w-full border-collapse">
          <thead>
            <tr class="bg-slate-100 text-left text-sm font-semibold text-slate-600">
              <th class="px-4 py-3">Nombre</th>
              <th class="px-4 py-3">Email</th>
              <th class="px-4 py-3">País</th>
              <th class="px-4 py-3">Asesor</th>
              <th class="px-4 py-3">Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let s of students()" class="border-t border-slate-200 hover:bg-slate-50 text-sm">
              <td class="px-4 py-3">{{ s.firstName }} {{ s.lastName }}</td>
              <td class="px-4 py-3">{{ s.email }}</td>
              <td class="px-4 py-3">{{ s.countryOrigin }}</td>
              <td class="px-4 py-3">{{ s.advisor?.email || s.advisorId || '-' }}</td>
              <td class="px-4 py-3">
                <button (click)="select(s)" class="text-xs bg-white border border-slate-300 hover:bg-slate-100 px-3 py-1.5 rounded-lg font-medium transition-colors">Ver / Editar RF-013</button>
              </td>
            </tr>
            <tr *ngIf="!loading() && students().length === 0">
              <td colspan="5" class="px-4 py-8 text-center text-slate-400">No se encontraron estudiantes</td>
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

      <!-- RF-015 / RF-016 Detalle -->
      <div *ngIf="selected()" class="bg-white p-6 mt-6 rounded-xl shadow-sm border border-slate-200">
        <h3 class="text-lg font-semibold text-slate-700 mb-4">Editar / Asociar Asesor RF-015 — {{ selected()?.email }}</h3>
        <div class="flex gap-3 items-end">
          <div class="flex-1">
            <label class="block text-sm font-medium text-slate-600 mb-1">Advisor ID</label>
            <input
              placeholder="Advisor ID"
              [ngModel]="advisorId()"
              (ngModelChange)="advisorId.set($event)"
              class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
            >
          </div>
          <button (click)="assignAdvisor()" class="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2 rounded-lg font-medium transition-colors">Asociar Asesor</button>
        </div>

        <div class="mt-6">
          <h4 class="font-semibold text-slate-700 mb-3">Observaciones RF-016</h4>
          <div class="flex gap-3">
            <input
              placeholder="Nueva observación"
              [ngModel]="obsText()"
              (ngModelChange)="obsText.set($event)"
              class="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
              [class.border-red-400]="obsError()"
            >
            <button (click)="addObs()" class="bg-sky-500 hover:bg-sky-600 text-white px-5 py-2 rounded-lg font-medium transition-colors">Agregar</button>
          </div>
          <p *ngIf="obsError()" class="text-xs text-red-500 mt-1">{{ obsError() }}</p>
          <ul class="mt-4 space-y-2">
            <li *ngFor="let o of observations()" class="bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 text-sm flex justify-between">
              <span>{{ o.observation }}</span>
              <span class="text-slate-400">{{ o.createdAt | date:'short' }}</span>
            </li>
            <li *ngIf="observations().length === 0" class="text-sm text-slate-400 italic">Sin observaciones</li>
          </ul>
        </div>
      </div>
    </div>
  `
})
export class StudentsComponent implements OnInit {
  loading = signal(false);
  error = signal<string | null>(null);
  students = signal<Student[]>([]);
  search = signal('');
  form = signal<any>({ firstName: '', lastName: '', email: '', countryOrigin: 'Colombia', phone: '', university: '' });
  msg = signal('');
  selected = signal<Student | null>(null);
  advisorId = signal('');
  obsText = signal('');
  observations = signal<any[]>([]);
  page = signal(1);
  total = signal(0);
  totalPages = signal(1);
  limit = signal(10);

  formErrors = signal<{ firstName?: string; lastName?: string; email?: string; countryOrigin?: string }>({});
  obsError = signal<string | null>(null);

  private emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  constructor(private svc: StudentsService, private toast: ToastService) {}

  ngOnInit() {
    this.load();
  }

  updateForm(field: string, value: string) {
    this.form.update(f => ({ ...f, [field]: value }));
    // limpiar error inline del campo al escribir
    if ((this.formErrors() as any)[field]) {
      this.formErrors.update(e => ({ ...e, [field]: undefined } as any));
    }
  }

  private sanitize(value: string): string {
    if (!value) return '';
    // RF seguridad: strip tags y caracteres peligrosos < > .. / \
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

    if (!f.firstName || !f.firstName.trim()) {
      errors.firstName = 'El nombre es obligatorio';
    }
    if (!f.lastName || !f.lastName.trim()) {
      errors.lastName = 'El apellido es obligatorio';
    }
    if (!f.email || !f.email.trim()) {
      errors.email = 'El email es obligatorio';
    } else if (!this.emailRegex.test(f.email.trim())) {
      errors.email = 'Formato de email inválido';
    }
    if (!f.countryOrigin || !f.countryOrigin.trim()) {
      errors.countryOrigin = 'El país de origen es obligatorio';
    }

    this.formErrors.set(errors);
    return Object.keys(errors).length === 0;
  }

  load() {
    this.loading.set(true);
    this.error.set(null);
    this.svc.list({ search: this.search(), page: this.page(), limit: this.limit() }).subscribe({
      next: (r) => {
        this.students.set(r.data ?? []);
        this.total.set(r.total ?? r.data?.length ?? 0);
        // calcular totalPages si no viene del backend
        const tp = ((r as any).totalPages ?? Math.ceil((r.total ?? 0) / this.limit())) || 1;
        this.totalPages.set(tp);
        this.loading.set(false);
      },
      error: (e) => {
        const message = e.error?.message || e.message || 'Error al cargar estudiantes';
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

  create() {
    if (!this.validateForm()) {
      this.toast.error('Corrige los errores del formulario');
      return;
    }

    const sanitized = this.sanitizeForm(this.form());
    // validación adicional de email después de sanitizar
    if (!this.emailRegex.test(sanitized.email)) {
      this.formErrors.update(e => ({ ...e, email: 'Formato de email inválido' }));
      this.toast.error('Email inválido');
      return;
    }

    this.loading.set(true);
    this.error.set(null);
    this.svc.create(sanitized).subscribe({
      next: () => {
        this.msg.set('Estudiante registrado');
        this.toast.success('Estudiante registrado correctamente');
        // reset form manteniendo countryOrigin por defecto
        this.form.set({ firstName: '', lastName: '', email: '', countryOrigin: 'Colombia', phone: '', university: '' });
        this.formErrors.set({});
        this.loading.set(false);
        this.page.set(1);
        this.load();
      },
      error: (e) => {
        const message = e.error?.message || e.message || 'Error al registrar estudiante';
        this.msg.set(message);
        this.error.set(message);
        this.toast.error(message);
        this.loading.set(false);
      }
    });
  }

  select(s: Student) {
    this.selected.set(s);
    this.loading.set(true);
    this.svc.get(s.id).subscribe({
      next: (d) => {
        this.selected.set(d as any);
        this.loading.set(false);
      },
      error: (e) => {
        const message = e.error?.message || 'Error al obtener estudiante';
        this.toast.error(message);
        this.loading.set(false);
      }
    });
    this.svc.getObservations(s.id).subscribe({
      next: (v) => this.observations.set(Array.isArray(v) ? v : (v as any)?.data ?? []),
      error: () => this.observations.set([])
    });
  }

  assignAdvisor() {
    const id = this.selected()?.id;
    if (!id) return;
    const sanitizedAdvisorId = this.sanitize(this.advisorId());
    if (!sanitizedAdvisorId) {
      this.toast.error('Advisor ID es obligatorio');
      return;
    }
    this.svc.assignAdvisor(id, sanitizedAdvisorId).subscribe({
      next: () => {
        this.msg.set('Asesor asociado');
        this.toast.success('Asesor asociado correctamente');
        this.load();
      },
      error: (e) => {
        const message = e.error?.message || 'Error al asociar asesor';
        this.toast.error(message);
      }
    });
  }

  addObs() {
    const id = this.selected()?.id;
    if (!id) return;

    const raw = this.obsText();
    this.obsError.set(null);

    if (!raw || !raw.trim()) {
      this.obsError.set('La observación no puede estar vacía');
      return;
    }
    // Seguridad: validar que no contiene <script
    if (/<\s*script/i.test(raw)) {
      this.obsError.set('Contenido no permitido: <script> detectado');
      this.toast.error('Observación contiene contenido no permitido');
      return;
    }

    const sanitized = this.sanitize(raw);
    if (!sanitized) {
      this.obsError.set('La observación no puede estar vacía');
      return;
    }

    this.svc.addObservation(id, sanitized).subscribe({
      next: () => {
        this.obsText.set('');
        this.toast.success('Observación agregada');
        this.svc.getObservations(id).subscribe(v => this.observations.set(Array.isArray(v) ? v : (v as any)?.data ?? []));
      },
      error: (e) => {
        const message = e.error?.message || 'Error al agregar observación';
        this.toast.error(message);
      }
    });
  }
}
