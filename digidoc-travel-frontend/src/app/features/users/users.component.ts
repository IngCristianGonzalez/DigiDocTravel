import { Component, OnInit, signal, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UsersService, AppUser, AppRole } from './users.service';
import { LoadingComponent } from '../../shared/components/loading.component';
import { ErrorComponent } from '../../shared/components/error.component';
import { ToastService } from '../../core/services/toast.service';
import { I18nService } from '../../core/i18n/i18n.service';

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
import { DropdownModule } from 'primeng/dropdown';

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
    DropdownModule,
  ],
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UsersComponent implements OnInit {
  public i18n = inject(I18nService);
  loading = signal(false);
  error = signal<string | null>(null);
  users = signal<AppUser[]>([]);
  search = signal('');
  // Filtros por columna (ERP PrimeNG) — reemplazan la búsqueda global
  fName = signal('');
  fEmail = signal('');
  fRole = signal('');
  fStatus = signal('');
  get statusOptions(): string[] {
    return [this.i18n.t('common.active'), this.i18n.t('common.inactive')];
  }
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

  // ---- Modal Crear ----
  openCreateModal() {
    this.form.set({ email: '', password: '', firstName: '', lastName: '' });
    this.formErrors.set({});
    this.showCreateModal.set(true);
  }

  closeCreateModal() {
    this.showCreateModal.set(false);
  }

  // ---- Modal Detalle ----
  openDetail(u: AppUser) {
    this.detailUser.set(u);
    this.showDetailModal.set(true);
    this.svc.get(u.id).subscribe({
      next: (d) => this.detailUser.set(d),
      error: (e) => this.toast.error(e.error?.message || this.i18n.t('users.error.getOne')),
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

  // ---- Modal Editar ----
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

  // ---- Modal Roles ----
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

  // ---- Modal Desactivar ----
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
    if (!email) errors.email = this.i18n.t('users.validation.emailRequired');
    else if (!this.emailRegex.test(email)) errors.email = this.i18n.t('users.validation.emailInvalid');

    if (requirePassword) {
      if (!f.password) errors.password = this.i18n.t('users.validation.passwordRequired');
      else if (!this.isStrongPassword(f.password)) errors.password = this.i18n.t('users.validation.passwordWeak');
    }

    if (!(f.firstName ?? '').trim() || (f.firstName ?? '').trim().length < this.MIN_NAME_LENGTH)
      errors.firstName = this.i18n.t('users.validation.firstNameRequired', { min: this.MIN_NAME_LENGTH });
    if (!(f.lastName ?? '').trim() || (f.lastName ?? '').trim().length < this.MIN_NAME_LENGTH)
      errors.lastName = this.i18n.t('users.validation.lastNameRequired', { min: this.MIN_NAME_LENGTH });

    this.formErrors.set(errors);
    return Object.keys(errors).length === 0;
  }

  load() {
    this.loading.set(true);
    this.error.set(null);
    const searchParts = [this.fName().trim(), this.fEmail().trim(), this.search().trim()].filter(Boolean);
    const params: any = { page: this.page(), limit: this.limit() };
    if (searchParts.length) params.search = searchParts.join(' ');
    if (this.fRole().trim()) params.role = this.fRole().trim();
    if (this.fStatus().trim()) {
      const s = this.fStatus().trim();
      params.status = (s === 'Activo' || s === this.i18n.t('common.active')) ? 'true' : 'false';
    }
    this.svc.list(params).subscribe({
      next: (r) => {
        const data = (r as any)?.data ?? (Array.isArray(r) ? r : []);
        const total = (r as any)?.total ?? (Array.isArray(data) ? data.length : 0);
        this.users.set(Array.isArray(data) ? data : []);
        this.total.set(total);
        this.totalPages.set((r as any)?.totalPages ?? (Math.ceil(total / this.limit()) || 1));
        this.loading.set(false);
      },
      error: (e) => {
        const message = e.error?.message || e.message || this.i18n.t('users.error.load');
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
    return !!(this.fName() || this.fEmail() || this.fRole() || this.fStatus() || this.search());
  }

  clearColumnFilters(dt?: any) {
    dt?.clear();
    this.fName.set('');
    this.fEmail.set('');
    this.fRole.set('');
    this.fStatus.set('');
    this.search.set('');
    this.page.set(1);
    this.load();
  }

  create() {
    if (!this.validateForm(true)) {
      this.toast.error(this.i18n.t('users.validation.fixErrors'));
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
      this.toast.error(this.i18n.t('users.validation.invalidAfterSanitize'));
      return;
    }
    this.loading.set(true);
    this.svc.create(payload).subscribe({
      next: () => {
        this.toast.success(this.i18n.t('users.success.created'));
        this.loading.set(false);
        this.closeCreateModal();
        this.page.set(1);
        this.load();
      },
      error: (e) => {
        const message = e.error?.message || this.i18n.t('users.error.create');
        this.toast.error(message);
        this.loading.set(false);
      }
    });
  }

  saveEdit() {
    const target = this.editingUser();
    if (!target) return;
    if (!this.validateForm(false)) {
      this.toast.error(this.i18n.t('users.validation.fixErrors'));
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
        this.toast.success(this.i18n.t('users.success.updated'));
        this.loading.set(false);
        this.closeEditModal();
        this.load();
      },
      error: (e) => {
        this.toast.error(e.error?.message || this.i18n.t('users.error.update'));
        this.loading.set(false);
      }
    });
  }

  saveRoles() {
    const target = this.rolesUser();
    if (!target) return;
    const roleIds = this.selectedRoleIds();
    if (!roleIds.length) {
      this.toast.error(this.i18n.t('users.validation.selectRole'));
      return;
    }
    this.loading.set(true);
    this.svc.assignRoles(target.id, roleIds).subscribe({
      next: () => {
        this.toast.success(this.i18n.t('users.success.rolesAssigned'));
        this.loading.set(false);
        this.closeRolesModal();
        this.load();
      },
      error: (e) => {
        this.toast.error(e.error?.message || this.i18n.t('users.error.assignRoles'));
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
        this.toast.success(this.i18n.t('users.success.deactivated'));
        this.loading.set(false);
        this.closeDeleteModal();
        this.page.set(1);
        this.load();
      },
      error: (e) => {
        this.toast.error(e.error?.message || this.i18n.t('users.error.deactivate'));
        this.loading.set(false);
      }
    });
  }
}
