import { Component, OnInit, signal, computed, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UsersService, AppUser } from '../users/users.service';
import { StudentsService } from '../students/students.service';
import { Student } from '../../shared/interfaces/api.interface';
import { LoadingComponent } from '../../shared/components/loading.component';
import { ErrorComponent } from '../../shared/components/error.component';
import { ToastService } from '../../core/services/toast.service';

// PrimeNG 17
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { FloatLabelModule } from 'primeng/floatlabel';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { DialogModule } from 'primeng/dialog';

// Rol asesor confirmado contra DB (spec 017 T1: roles admin/supervisor/consultor/asesor)
export const ADVISOR_ROLE = 'asesor';

@Component({
  selector: 'app-advisors',
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
    TagModule,
    TooltipModule,
    DialogModule,
  ],
  templateUrl: './advisors.component.html',
  styleUrls: ['./advisors.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdvisorsComponent implements OnInit {
  loading = signal(false);
  error = signal<string | null>(null);
  advisors = signal<AppUser[]>([]);
  search = signal('');
  page = signal(1);
  total = signal(0);
  totalPages = signal(1);
  limit = signal(10);

  showCreateModal = signal(false);
  showDetailModal = signal(false);
  showDeleteModal = signal(false);
  showConfirmModal = signal(false);
  confirmLines = signal<{ label: string; value: string }[]>([]);

  detailAdvisor = signal<AppUser | null>(null);
  advisedStudents = signal<Student[]>([]);
  deleteTarget = signal<AppUser | null>(null);
  advisedCount = signal(0);

  form = signal<any>({ email: '', password: '', firstName: '', lastName: '' });
  formErrors = signal<{ email?: string; password?: string; firstName?: string; lastName?: string }>({});

  private emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  private nameRegex = /^[A-Za-zÁÉÍÓÚáéíóúÑñÜü\s'-]+$/;
  private nameInputFilter = /[^A-Za-zÁÉÍÓÚáéíóúÑñÜü\s'-]/g;

  constructor(private users: UsersService, private students: StudentsService, private toast: ToastService) {}

  ngOnInit() {
    this.load();
  }

  // ---- Lista: solo asesores activos ----
  load() {
    this.loading.set(true);
    this.error.set(null);
    const params: any = { page: this.page(), limit: this.limit(), role: ADVISOR_ROLE, status: 'true' };
    if (this.search().trim()) params.search = this.search().trim();
    this.users.list(params).subscribe({
      next: (r) => {
        const data = (r as any)?.data ?? (Array.isArray(r) ? r : []);
        const total = (r as any)?.total ?? (Array.isArray(data) ? data.length : 0);
        this.advisors.set(Array.isArray(data) ? data : []);
        this.total.set(total);
        this.totalPages.set(Math.ceil(total / this.limit()) || 1);
        this.loading.set(false);
      },
      error: (e) => {
        const message = e.error?.message || e.message || 'Error al cargar asesores';
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

  onPageChange(e: { first: number; rows: number }) {
    this.page.set(Math.floor(e.first / e.rows) + 1);
    this.limit.set(e.rows);
    this.load();
  }

  fullName(u: AppUser | null): string {
    if (!u) return '—';
    return `${u.firstName ?? ''} ${u.lastName ?? ''}`.trim() || u.email;
  }

  // ---- Crear (rol asesor preasignado, sin selector de rol) ----
  openCreateModal() {
    this.form.set({ email: '', password: '', firstName: '', lastName: '' });
    this.formErrors.set({});
    this.showCreateModal.set(true);
  }

  closeCreateModal() {
    this.showCreateModal.set(false);
  }

  onNameInput(field: 'firstName' | 'lastName', value: string) {
    const clean = (value ?? '').replace(this.nameInputFilter, '');
    this.form.update(f => ({ ...f, [field]: clean }));
    const v = clean.trim();
    if (v.length > 0 && v.length < 3) {
      this.formErrors.update(e => ({ ...e, [field]: 'Mínimo 3 caracteres, solo letras' }));
      return;
    }
    if ((this.formErrors() as any)[field]) this.formErrors.update(e => ({ ...e, [field]: undefined }));
  }

  private isStrongPassword(pwd: string): boolean {
    if (!pwd || pwd.length < 8) return false;
    return /[A-Z]/.test(pwd) && /[a-z]/.test(pwd) && /[0-9]/.test(pwd) && /[^A-Za-z0-9]/.test(pwd);
  }

  private validateCreate(): boolean {
    const f = this.form();
    const errors: any = {};
    const email = (f.email ?? '').trim();
    if (!email) errors.email = 'El email es obligatorio';
    else if (!this.emailRegex.test(email)) errors.email = 'Formato inválido — Ej: nombre@dominio.com';
    if (!this.isStrongPassword(f.password ?? '')) errors.password = 'Mínimo 8 caracteres con mayúscula, minúscula, número y símbolo';
    const fn = (f.firstName ?? '').trim();
    if (!fn) errors.firstName = 'El nombre es obligatorio';
    else if (fn.length < 3) errors.firstName = 'Mínimo 3 caracteres, solo letras';
    else if (!this.nameRegex.test(fn)) errors.firstName = 'Solo letras';
    const ln = (f.lastName ?? '').trim();
    if (!ln) errors.lastName = 'El apellido es obligatorio';
    else if (ln.length < 3) errors.lastName = 'Mínimo 3 caracteres, solo letras';
    else if (!this.nameRegex.test(ln)) errors.lastName = 'Solo letras';
    this.formErrors.set(errors);
    return Object.keys(errors).length === 0;
  }

  create() {
    if (!this.validateCreate()) {
      this.toast.error('Corrige los errores del formulario');
      return;
    }
    const f = this.form();
    this.confirmLines.set([
      { label: 'Nombre', value: `${f.firstName.trim()} ${f.lastName.trim()}` },
      { label: 'Email', value: f.email.trim().toLowerCase() },
      { label: 'Rol', value: ADVISOR_ROLE },
    ]);
    this.showConfirmModal.set(true);
  }

  backToForm() {
    this.showConfirmModal.set(false);
  }

  proceedConfirm() {
    this.showConfirmModal.set(false);
    const f = this.form();
    const payload = {
      email: f.email.trim().toLowerCase(),
      password: f.password,
      firstName: f.firstName.trim(),
      lastName: f.lastName.trim(),
    };
    this.loading.set(true);
    this.users.create(payload).subscribe({
      next: (created: any) => {
        const id = created?.id ?? created?.data?.id;
        // Rol asesor preasignado: se resuelve el id del rol por nombre
        this.users.listRoles().subscribe({
          next: (roles) => {
            const role = roles.find(r => r.name === ADVISOR_ROLE);
            if (!role) {
              this.loading.set(false);
              this.toast.error(`Asesor creado sin rol: rol '${ADVISOR_ROLE}' no encontrado. Asígnalo desde Usuarios.`);
              this.showCreateModal.set(false);
              this.resetAndLoad();
              return;
            }
            this.users.assignRoles(id, [role.id]).subscribe({
              next: () => {
                this.toast.success('Asesor creado correctamente');
                this.loading.set(false);
                this.showCreateModal.set(false);
                this.resetAndLoad();
              },
              error: (e2) => {
                this.loading.set(false);
                this.toast.error(e2.error?.message || 'Asesor creado sin rol: reintenta la asignación desde Usuarios.');
                this.showCreateModal.set(false);
                this.resetAndLoad();
              }
            });
          },
          error: (e) => {
            this.loading.set(false);
            this.toast.error(e.error?.message || 'Error al resolver el rol asesor');
          }
        });
      },
      error: (e) => {
        this.loading.set(false);
        this.toast.error(e.error?.message || 'Error al crear asesor');
      }
    });
  }

  // ---- Detalle + estudiantes asociados ----
  openDetail(u: AppUser) {
    this.detailAdvisor.set(u);
    this.advisedStudents.set([]);
    this.showDetailModal.set(true);
    this.users.get(u.id).subscribe({
      next: (d) => this.detailAdvisor.set(d),
      error: (e) => this.toast.error(e.error?.message || 'Error al obtener asesor'),
    });
    this.students.list({ advisorId: u.id, status: 'true', limit: 50 } as any).subscribe({
      next: (r: any) => this.advisedStudents.set(r?.data ?? (Array.isArray(r) ? r : [])),
      error: () => this.advisedStudents.set([]),
    });
  }

  closeDetailModal() {
    this.showDetailModal.set(false);
    this.detailAdvisor.set(null);
  }

  // ---- Desactivar con conteo de asociados ----
  openDelete(u: AppUser) {
    this.deleteTarget.set(u);
    this.advisedCount.set(0);
    this.showDeleteModal.set(true);
    this.students.list({ advisorId: u.id, status: 'true', limit: 1 } as any).subscribe({
      next: (r: any) => this.advisedCount.set(r?.total ?? (Array.isArray(r?.data) ? r.data.length : 0)),
      error: () => this.advisedCount.set(0),
    });
  }

  closeDeleteModal() {
    this.showDeleteModal.set(false);
    this.deleteTarget.set(null);
  }

  confirmDelete() {
    const target = this.deleteTarget();
    if (!target) return;
    this.loading.set(true);
    this.users.deactivate(target.id).subscribe({
      next: () => {
        this.toast.success('Asesor desactivado correctamente');
        this.loading.set(false);
        this.closeDeleteModal();
        this.resetAndLoad();
      },
      error: (e) => {
        this.toast.error(e.error?.message || 'Error al desactivar asesor');
        this.loading.set(false);
      }
    });
  }
}
