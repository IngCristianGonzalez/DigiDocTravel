import { Component, OnInit, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UsersService, AppUser, AppRole } from './users.service';
import { LoadingComponent } from '../../shared/components/loading.component';
import { ErrorComponent } from '../../shared/components/error.component';
import { ToastService } from '../../core/services/toast.service';

// PrimeNG - SL Global · PrimeNG 17 (mismo patrón que StudentsComponent)
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { FloatLabelModule } from 'primeng/floatlabel';
import { TableModule } from 'primeng/table';
import { SkeletonModule } from 'primeng/skeleton';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { DialogModule } from 'primeng/dialog';
import { PasswordModule } from 'primeng/password';
import { MultiSelectModule } from 'primeng/multiselect';

@Component({
  selector: 'app-users',
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
    PasswordModule,
    MultiSelectModule,
  ],
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UsersComponent implements OnInit {
  loading = signal(false);
  error = signal<string | null>(null);
  users = signal<AppUser[]>([]);
  search = signal('');
  msg = signal('');
  page = signal(1);
  total = signal(0);
  totalPages = signal(1);
  limit = signal(10);

  // Form (crear / editar — editar no toca password)
  form = signal<any>({ email: '', password: '', firstName: '', lastName: '' });
  formErrors = signal<{ email?: string; password?: string; firstName?: string; lastName?: string }>({});

  // Modales — todo por modales, nada inline
  showCreateModal = signal(false);
  showEditModal = signal(false);
  showDetailModal = signal(false);
  showRolesModal = signal(false);
  showDeleteModal = signal(false);
  detailUser = signal<AppUser | null>(null);
  editingUser = signal<AppUser | null>(null);
  rolesUser = signal<AppUser | null>(null);
  deleteTarget = signal<AppUser | null>(null);

  // Catálogo de roles + selección
  allRoles = signal<AppRole[]>([]);
  selectedRoleIds = signal<string[]>([]);

  readonly skeletonRows = Array.from({ length: 8 }, () => ({} as AppUser));

  private emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  readonly MIN_NAME_LENGTH = 3;

  constructor(private svc: UsersService, private toast: ToastService) {}

  ngOnInit() {
    this.load();
    this.loadRoles();
  }

  loadRoles() {
    this.svc.listRoles().subscribe({
      next: (roles) => this.allRoles.set(Array.isArray(roles) ? roles : []),
      error: () => this.allRoles.set([]),
    });
  }

  // ---- Modal Crear (RF-007) ----
  openCreateModal() {
    this.form.set({ email: '', password: '', firstName: '', lastName: '' });
    this.formErrors.set({});
    this.showCreateModal.set(true);
  }

  closeCreateModal() {
    this.showCreateModal.set(false);
  }

  // ---- Modal Detalle (RF-010) ----
  openDetail(u: AppUser) {
    this.detailUser.set(u);
    this.showDetailModal.set(true);
    this.svc.get(u.id).subscribe({
      next: (d) => this.detailUser.set(d),
      error: (e) => this.toast.error(e.error?.message || 'Error al obtener usuario'),
    });
  }

  closeDetailModal() {
    this.showDetailModal.set(false);
    this.detailUser.set(null);
  }

  goFromDetailToEdit() {
    const d = this.detailUser();
    this.closeDetailModal();
    if (d) this.openEdit(d);
  }

  // ---- Modal Editar (RF-008) ----
  openEdit(u: AppUser) {
    this.editingUser.set(u);
    this.form.set({ email: u.email ?? '', password: '', firstName: u.firstName ?? '', lastName: u.lastName ?? '' });
    this.formErrors.set({});
    this.showEditModal.set(true);
  }

  closeEditModal() {
    this.showEditModal.set(false);
    this.editingUser.set(null);
    this.formErrors.set({});
  }

  // ---- Modal Roles (RF-011) ----
  openRoles(u: AppUser) {
    this.rolesUser.set(u);
    this.selectedRoleIds.set((u.roles ?? []).map(r => r.id));
    this.showRolesModal.set(true);
  }

  closeRolesModal() {
    this.showRolesModal.set(false);
    this.rolesUser.set(null);
    this.selectedRoleIds.set([]);
  }

  // ---- Modal Desactivar (RF-009) ----
  openDelete(u: AppUser) {
    this.deleteTarget.set(u);
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

  private isStrongPassword(pwd: string): boolean {
    if (!pwd || pwd.length < 8) return false;
    return /[A-Z]/.test(pwd) && /[a-z]/.test(pwd) && /[0-9]/.test(pwd) && /[^A-Za-z0-9]/.test(pwd);
  }

  private validateForm(requirePassword: boolean): boolean {
    const f = this.form();
    const errors: any = {};

    const email = (f.email ?? '').trim();
    if (!email) errors.email = 'El email es obligatorio';
    else if (!this.emailRegex.test(email)) errors.email = 'Formato de email inválido (ej: nombre@dominio.com)';

    if (requirePassword) {
      if (!f.password) errors.password = 'La contraseña es obligatoria';
      else if (!this.isStrongPassword(f.password)) errors.password = 'Mín 8: mayúscula, minúscula, número y especial';
    }

    if (!(f.firstName ?? '').trim() || (f.firstName ?? '').trim().length < this.MIN_NAME_LENGTH)
      errors.firstName = `El nombre es obligatorio (mín ${this.MIN_NAME_LENGTH})`;
    if (!(f.lastName ?? '').trim() || (f.lastName ?? '').trim().length < this.MIN_NAME_LENGTH)
      errors.lastName = `El apellido es obligatorio (mín ${this.MIN_NAME_LENGTH})`;

    this.formErrors.set(errors);
    return Object.keys(errors).length === 0;
  }

  load() {
    this.loading.set(true);
    this.error.set(null);
    this.svc.list({ search: this.search() || undefined, page: this.page(), limit: this.limit() }).subscribe({
      next: (r) => {
        const data = (r as any)?.data ?? (Array.isArray(r) ? r : []);
        const total = (r as any)?.total ?? (Array.isArray(data) ? data.length : 0);
        this.users.set(Array.isArray(data) ? data : []);
        this.total.set(total);
        this.totalPages.set((r as any)?.totalPages ?? (Math.ceil(total / this.limit()) || 1));
        this.loading.set(false);
      },
      error: (e) => {
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

  create() {
    if (!this.validateForm(true)) {
      this.toast.error('Corrige los errores del formulario');
      return;
    }
    const raw = this.form();
    const payload = {
      email: this.sanitize(raw.email).toLowerCase(),
      password: raw.password,
      firstName: this.sanitize(raw.firstName),
      lastName: this.sanitize(raw.lastName),
    };
    if (!this.emailRegex.test(payload.email) || !payload.firstName || !payload.lastName || !this.isStrongPassword(payload.password)) {
      this.toast.error('Datos inválidos tras sanitización');
      return;
    }
    this.loading.set(true);
    this.svc.create(payload).subscribe({
      next: () => {
        this.toast.success('Usuario creado correctamente');
        this.loading.set(false);
        this.closeCreateModal();
        this.page.set(1);
        this.load();
      },
      error: (e) => {
        const message = e.error?.message || 'Error al crear usuario';
        this.toast.error(message);
        this.loading.set(false);
      }
    });
  }

  saveEdit() {
    const target = this.editingUser();
    if (!target) return;
    if (!this.validateForm(false)) {
      this.toast.error('Corrige los errores del formulario');
      return;
    }
    const raw = this.form();
    const payload = {
      email: this.sanitize(raw.email).toLowerCase(),
      firstName: this.sanitize(raw.firstName),
      lastName: this.sanitize(raw.lastName),
    };
    this.loading.set(true);
    this.svc.update(target.id, payload).subscribe({
      next: () => {
        this.toast.success('Usuario actualizado correctamente');
        this.loading.set(false);
        this.closeEditModal();
        this.load();
      },
      error: (e) => {
        this.toast.error(e.error?.message || 'Error al actualizar usuario');
        this.loading.set(false);
      }
    });
  }

  saveRoles() {
    const target = this.rolesUser();
    if (!target) return;
    const roleIds = this.selectedRoleIds();
    if (!roleIds.length) {
      this.toast.error('Selecciona al menos un rol');
      return;
    }
    this.loading.set(true);
    this.svc.assignRoles(target.id, roleIds).subscribe({
      next: () => {
        this.toast.success('Roles asignados correctamente');
        this.loading.set(false);
        this.closeRolesModal();
        this.load();
      },
      error: (e) => {
        this.toast.error(e.error?.message || 'Error al asignar roles');
        this.loading.set(false);
      }
    });
  }

  confirmDelete() {
    const target = this.deleteTarget();
    if (!target) return;
    this.loading.set(true);
    this.svc.deactivate(target.id).subscribe({
      next: () => {
        this.toast.success('Usuario desactivado correctamente');
        this.loading.set(false);
        this.closeDeleteModal();
        this.page.set(1);
        this.load();
      },
      error: (e) => {
        this.toast.error(e.error?.message || 'Error al desactivar usuario');
        this.loading.set(false);
      }
    });
  }
}
