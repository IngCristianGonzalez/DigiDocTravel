import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UsersService } from './users.service';
import { LoadingComponent } from '../../shared/components/loading.component';
import { ErrorComponent } from '../../shared/components/error.component';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule, FormsModule, LoadingComponent, ErrorComponent],
  template: `
    <div class="p-6 max-w-6xl mx-auto">
      <h1 class="text-2xl font-bold text-slate-800 mb-6">Gestión de Usuarios - RF-007 a RF-011</h1>

      <!-- Loading / Error -->
      <app-loading [show]="loading()" message="Cargando usuarios..."></app-loading>
      <app-error [message]="error()" (retry)="load()"></app-error>

      <!-- RF-007 Registrar Usuario -->
      <div class="bg-white p-6 rounded-xl shadow-sm border border-slate-200 mb-6">
        <h3 class="text-lg font-semibold text-slate-700 mb-4">Registrar Usuario - RF-007</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl">
          <!-- email -->
          <div>
            <label class="block text-sm font-medium text-slate-600 mb-1">Email *</label>
            <input
              placeholder="usuario@ejemplo.com"
              [ngModel]="form().email"
              (ngModelChange)="updateForm('email', $event)"
              class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
              [class.border-red-400]="formErrors().email"
              [class.border-slate-300]="!formErrors().email"
            >
            <p *ngIf="formErrors().email" class="text-xs text-red-500 mt-1">{{ formErrors().email }}</p>
          </div>
          <!-- password -->
          <div>
            <label class="block text-sm font-medium text-slate-600 mb-1">Password *</label>
            <input
              placeholder="Mín 8 chars, mayús/minús/número/especial"
              type="password"
              [ngModel]="form().password"
              (ngModelChange)="updateForm('password', $event)"
              class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
              [class.border-red-400]="formErrors().password"
              [class.border-slate-300]="!formErrors().password"
            >
            <p *ngIf="formErrors().password" class="text-xs text-red-500 mt-1">{{ formErrors().password }}</p>
            <p class="text-[11px] text-slate-400 mt-1">Requiere mayúscula, minúscula, número y carácter especial</p>
          </div>
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
        </div>
        <button (click)="create()" [disabled]="loading()" class="mt-4 bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-300 text-white font-medium px-6 py-2 rounded-lg transition-colors">
          Crear RF-007
        </button>
        <div *ngIf="msg()" class="mt-3 text-sm font-medium" [class.text-green-600]="!error()" [class.text-red-600]="error()">{{ msg() }}</div>
      </div>

      <!-- RF-010 Buscar / Consultar -->
      <div class="flex gap-3 mb-4">
        <input
          placeholder="Buscar por email o nombre..."
          [ngModel]="search()"
          (ngModelChange)="search.set($event)"
          (keyup.enter)="resetAndLoad()"
          class="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
        >
        <button (click)="resetAndLoad()" class="bg-slate-800 hover:bg-slate-900 text-white px-6 py-2 rounded-lg font-medium transition-colors">Consultar RF-010</button>
      </div>

      <!-- Tabla -->
      <div class="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full border-collapse">
            <thead>
              <tr class="bg-slate-100 text-left text-sm font-semibold text-slate-600">
                <th class="px-4 py-3">Email</th>
                <th class="px-4 py-3">Nombre</th>
                <th class="px-4 py-3">Roles</th>
                <th class="px-4 py-3">Estado</th>
                <th class="px-4 py-3">Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let u of users()" class="border-t border-slate-200 hover:bg-slate-50 text-sm">
                <td class="px-4 py-3 font-medium text-slate-800">{{ u.email }}</td>
                <td class="px-4 py-3">{{ u.firstName }} {{ u.lastName }}</td>
                <td class="px-4 py-3">
                  <span *ngIf="u.roles?.length; else noRoles" class="inline-flex flex-wrap gap-1">
                    <span *ngFor="let r of u.roles" class="px-2 py-0.5 bg-sky-100 text-sky-700 rounded-full text-xs font-medium">{{ r.name }}</span>
                  </span>
                  <ng-template #noRoles><span class="text-slate-400">-</span></ng-template>
                </td>
                <td class="px-4 py-3">
                  <span class="px-2 py-1 rounded-full text-xs font-medium" [class.bg-emerald-100]="u.status" [class.text-emerald-700]="u.status" [class.bg-slate-100]="!u.status" [class.text-slate-600]="!u.status">
                    {{ u.status ? 'Activo' : 'Inactivo' }}
                  </span>
                </td>
                <td class="px-4 py-3">
                  <div class="flex flex-wrap gap-1.5">
                    <button (click)="deactivate(u.id)" [disabled]="!u.status" class="text-xs bg-amber-500 hover:bg-amber-600 disabled:bg-slate-200 disabled:text-slate-400 text-white px-3 py-1.5 rounded-lg font-medium transition-colors">Desactivar RF-009</button>
                    <button (click)="assignRole(u.id)" class="text-xs bg-white border border-slate-300 hover:bg-slate-100 px-3 py-1.5 rounded-lg font-medium transition-colors">Asignar Rol RF-011</button>
                  </div>
                </td>
              </tr>
              <tr *ngIf="!loading() && users().length === 0">
                <td colspan="5" class="px-4 py-8 text-center text-slate-400">No se encontraron usuarios</td>
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
    </div>
  `
})
export class UsersComponent implements OnInit {
  loading = signal(false);
  error = signal<string | null>(null);
  users = signal<any[]>([]);
  search = signal('');
  form = signal<any>({ email: '', password: '', firstName: '', lastName: '' });
  msg = signal('');
  page = signal(1);
  total = signal(0);
  totalPages = signal(1);
  limit = signal(10);

  formErrors = signal<{ email?: string; password?: string; firstName?: string; lastName?: string }>({});

  private emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  constructor(private svc: UsersService, private toast: ToastService) {}

  ngOnInit() {
    this.load();
  }

  updateForm(field: string, value: string) {
    this.form.update(f => ({ ...f, [field]: value }));
    if ((this.formErrors() as any)[field]) {
      this.formErrors.update(e => ({ ...e, [field]: undefined } as any));
    }
  }

  // Sanitización: strip < > .. /\ y tags HTML
  private sanitize(value: string): string {
    if (!value) return '';
    return value
      .replace(/<[^>]*>/g, '')
      .replace(/[<>]/g, '')
      .replace(/\.\.\//g, '')
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

  // Seguridad: validar fuerza de password antes de crear
  private isStrongPassword(pwd: string): boolean {
    if (!pwd || pwd.length < 8) return false;
    const hasUpper = /[A-Z]/.test(pwd);
    const hasLower = /[a-z]/.test(pwd);
    const hasNumber = /[0-9]/.test(pwd);
    const hasSpecial = /[^A-Za-z0-9]/.test(pwd);
    return hasUpper && hasLower && hasNumber && hasSpecial;
  }

  private validateForm(): boolean {
    const f = this.form();
    const errors: any = {};

    if (!f.email || !f.email.trim()) {
      errors.email = 'El email es obligatorio';
    } else if (!this.emailRegex.test(f.email.trim())) {
      errors.email = 'Formato de email inválido';
    }

    if (!f.password || !f.password.trim()) {
      errors.password = 'La contraseña es obligatoria';
    } else if (f.password.length < 8) {
      errors.password = 'Mínimo 8 caracteres';
    } else if (!this.isStrongPassword(f.password)) {
      errors.password = 'Debe incluir mayúscula, minúscula, número y carácter especial';
    }

    if (!f.firstName || !f.firstName.trim()) {
      errors.firstName = 'El nombre es obligatorio';
    }

    if (!f.lastName || !f.lastName.trim()) {
      errors.lastName = 'El apellido es obligatorio';
    }

    this.formErrors.set(errors);
    return Object.keys(errors).length === 0;
  }

  load() {
    this.loading.set(true);
    this.error.set(null);
    this.svc.list({ search: this.search() || undefined, page: this.page(), limit: this.limit() }).subscribe({
      next: (r: any) => {
        this.users.set(r.data ?? r ?? []);
        const totalVal = r.total ?? (Array.isArray(r.data) ? r.data.length : Array.isArray(r) ? r.length : 0);
        this.total.set(totalVal);
        const tp = (r.totalPages ?? Math.ceil(totalVal / this.limit())) || 1;
        this.totalPages.set(tp);
        this.loading.set(false);
      },
      error: (e: any) => {
        const message = e.error?.message || e.message || 'Error al cargar usuarios';
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

  // RF-007 crear - con sanitización y validación de fuerza
  create() {
    if (!this.validateForm()) {
      this.toast.error('Corrige los errores del formulario');
      return;
    }

    const sanitized = this.sanitizeForm(this.form());

    // Seguridad: sanitizar email y re-validar formato
    if (!this.emailRegex.test(sanitized.email)) {
      this.formErrors.update(e => ({ ...e, email: 'Formato de email inválido tras sanitización' }));
      this.toast.error('Email inválido');
      return;
    }

    // Seguridad: validar password strength antes de crear (defensa en profundidad)
    if (!this.isStrongPassword(sanitized.password)) {
      this.formErrors.update(e => ({ ...e, password: 'Contraseña no cumple política de seguridad' }));
      this.toast.error('Contraseña débil: requiere mayúscula, minúscula, número y especial (mín 8)');
      return;
    }

    // Validar que firstName/lastName no queden vacíos tras sanitización
    if (!sanitized.firstName || !sanitized.lastName) {
      this.toast.error('Nombre y apellido no pueden quedar vacíos tras sanitización');
      return;
    }

    this.loading.set(true);
    this.error.set(null);
    this.svc.create(sanitized).subscribe({
      next: () => {
        this.msg.set('Usuario creado');
        this.toast.success('Usuario creado correctamente');
        this.form.set({ email: '', password: '', firstName: '', lastName: '' });
        this.formErrors.set({});
        this.loading.set(false);
        this.page.set(1);
        this.load();
      },
      error: (e: any) => {
        const message = e.error?.message || e.message || 'Error al crear usuario';
        this.msg.set(message);
        this.error.set(message);
        this.toast.error(message);
        this.loading.set(false);
      }
    });
  }

  // RF-009 desactivar
  deactivate(id: string) {
    if (!confirm('¿Desactivar usuario?')) return;
    this.loading.set(true);
    this.svc.deactivate(id).subscribe({
      next: () => {
        this.toast.success('Usuario desactivado');
        this.loading.set(false);
        this.load();
      },
      error: (e: any) => {
        const message = e.error?.message || e.message || 'Error al desactivar usuario';
        this.toast.error(message);
        this.error.set(message);
        this.loading.set(false);
      }
    });
  }

  // RF-011 asignar roles
  assignRole(id: string) {
    const roleId = prompt('Ingrese roleId (ej: uuid de admin)');
    if (!roleId) return;
    const sanitizedRoleId = this.sanitize(roleId);
    if (!sanitizedRoleId) {
      this.toast.error('roleId inválido');
      return;
    }
    this.loading.set(true);
    this.svc.assignRoles(id, [sanitizedRoleId]).subscribe({
      next: () => {
        this.toast.success('Rol asignado correctamente');
        this.loading.set(false);
        this.load();
      },
      error: (e: any) => {
        const message = e.error?.message || e.message || 'Error al asignar rol';
        this.toast.error(message);
        this.error.set(message);
        this.loading.set(false);
      }
    });
  }
}
