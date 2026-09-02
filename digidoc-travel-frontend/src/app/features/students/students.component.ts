import { Component, OnInit, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StudentsService } from './students.service';
import { Student } from '../../shared/interfaces/api.interface';
import { LoadingComponent } from '../../shared/components/loading.component';
import { ErrorComponent } from '../../shared/components/error.component';
import { ToastService } from '../../core/services/toast.service';

// PrimeNG - SL Global (lara-light-amber)
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { FloatLabelModule } from 'primeng/floatlabel';
import { TableModule } from 'primeng/table';
import { SkeletonModule } from 'primeng/skeleton';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';

@Component({
  selector: 'app-students',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    LoadingComponent,
    ErrorComponent,
    // PrimeNG
    ButtonModule,
    InputTextModule,
    FloatLabelModule,
    TableModule,
    SkeletonModule,
    TagModule,
    TooltipModule,
  ],
  templateUrl: './students.component.html',
  styleUrls: ['./students.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
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

  // skeleton placeholder rows (p-table flex pattern)
  readonly skeletonRows = Array.from({ length: 8 }, () => ({} as Student));

  private emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  constructor(private svc: StudentsService, private toast: ToastService) {}

  ngOnInit() {
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
