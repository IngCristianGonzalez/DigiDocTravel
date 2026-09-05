import { Component, OnInit, signal, computed, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StudentsService } from './students.service';
import { CatalogService } from './catalog.service';
import { Student } from '../../shared/interfaces/api.interface';
import { LoadingComponent } from '../../shared/components/loading.component';
import { ErrorComponent } from '../../shared/components/error.component';
import { ToastService } from '../../core/services/toast.service';
import { COUNTRIES, Country } from './countries.data';

// PrimeNG - SL Global (lara-light-amber) · PrimeNG 17
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { FloatLabelModule } from 'primeng/floatlabel';
import { TableModule } from 'primeng/table';
import { SkeletonModule } from 'primeng/skeleton';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { DialogModule } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown';

@Component({
  selector: 'app-students',
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
    DropdownModule,
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
  // form base (modal)
  form = signal<any>({ firstName: '', lastName: '', identification: '', email: '', countryOrigin: 'Colombia', phone: '', university: '' });
  msg = signal('');
  selected = signal<Student | null>(null);
  advisorId = signal('');
  obsText = signal('');
  observations = signal<any[]>([]);
  page = signal(1);
  total = signal(0);
  totalPages = signal(1);
  limit = signal(10);

  // modal + paises/universidades
  showCreateModal = signal(false);
  // PoC UX: todo por modales — detalle, edición, observaciones y desactivar
  showDetailModal = signal(false);
  showEditModal = signal(false);
  showObsModal = signal(false);
  showDeleteModal = signal(false);
  detailStudent = signal<Student | null>(null);
  editingStudent = signal<Student | null>(null);
  obsStudent = signal<Student | null>(null);
  deleteTarget = signal<Student | null>(null);
  countries = signal<Country[]>(COUNTRIES);
  selectedCountry = signal<Country | null>(COUNTRIES.find(c => c.code === 'CO') ?? COUNTRIES[0]);
  phoneNumber = signal('');
  formErrors = signal<{ firstName?: string; lastName?: string; identification?: string; email?: string; countryOrigin?: string; phone?: string; university?: string }>({});
  obsError = signal<string | null>(null);

  // computed helpers
  dialCode = computed(() => this.selectedCountry()?.dialCode ?? '');
  universitiesForCountry = computed(() => this.selectedCountry()?.universities ?? []);

  readonly skeletonRows = Array.from({ length: 8 }, () => ({} as Student));

  private emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  // Solo letras (incluye acentos), espacios, apóstrofe y guion. Bloquea @ * { } [ ] etc.
  private nameRegex = /^[A-Za-zÁÉÍÓÚáéíóúÑñÜü\s'-]+$/;
  private forbiddenCharsRegex = /[@*{}[\]#\$%\^&+=\|~`<>]/;

  // Convención formularios de registro: nombres y apellidos mínimo 3 caracteres
  readonly MIN_NAME_LENGTH = 3;
  readonly MAX_NAME_LENGTH = 50;
  // Identificación: obligatoria, mínimo 4 caracteres (letras, números, puntos y guiones)
  readonly MIN_ID_LENGTH = 4;
  readonly MAX_ID_LENGTH = 50;
  private identificationRegex = /^[A-Za-z0-9.\-]+$/;

  constructor(private svc: StudentsService, private catalog: CatalogService, private toast: ToastService) {}

  ngOnInit() {
    this.load();
    this.loadCatalog();
    // inicializa countryOrigin desde selectedCountry
    if (this.selectedCountry()) {
      this.form.update(f => ({ ...f, countryOrigin: this.selectedCountry()!.name }));
    }
  }

  // Catálogo países/universidades desde la DB (fallback local si la API falla)
  loadCatalog() {
    this.catalog.listCountries().subscribe({
      next: (res) => {
        if (!res || res.length === 0) return;
        const currentCode = this.selectedCountry()?.code ?? 'CO';
        const mapped: Country[] = res.map(c => ({
          code: c.code,
          name: c.name,
          dialCode: c.dialCode,
          flag: c.flag ?? '',
          universities: (c.universities ?? []).map(u => u.name),
        }));
        this.countries.set(mapped);
        const keep = mapped.find(c => c.code === currentCode) ?? mapped[0];
        this.selectedCountry.set(keep);
        this.form.update(f => ({ ...f, countryOrigin: keep.name, university: '' }));
      },
      error: () => {
        // fallback silencioso: se conserva COUNTRIES local
      }
    });
  }

  // Modal controls
  openCreateModal() {
    // reset form + errores
    this.form.set({ firstName: '', lastName: '', identification: '', email: '', countryOrigin: this.selectedCountry()?.name ?? 'Colombia', phone: '', university: '' });
    this.phoneNumber.set('');
    this.formErrors.set({});
    this.showCreateModal.set(true);
  }

  closeCreateModal() {
    this.showCreateModal.set(false);
  }

  // ---- PoC UX: acciones de fila abren modales (nada inline en la página) ----
  openDetail(s: Student) {
    this.detailStudent.set(s);
    this.showDetailModal.set(true);
    this.loadObservationsFor(s.id);
  }

  closeDetailModal() {
    this.showDetailModal.set(false);
    this.detailStudent.set(null);
  }

  goFromDetailToEdit() {
    const d = this.detailStudent();
    this.closeDetailModal();
    if (d) this.openEdit(d);
  }

  openEdit(s: Student) {
    this.editingStudent.set(s);
    this.form.set({
      firstName: s.firstName ?? '',
      lastName: s.lastName ?? '',
      identification: s.identification ?? '',
      email: s.email ?? '',
      countryOrigin: s.countryOrigin ?? this.selectedCountry()?.name ?? 'Colombia',
      phone: s.phone ?? '',
      university: s.university ?? '',
    });
    this.formErrors.set({});
    // Sincroniza país + dígitos del teléfono con el indicativo
    const match = this.countries().find(c => c.name === (s.countryOrigin ?? ''));
    if (match) this.selectedCountry.set(match);
    const digits = (s.phone ?? '').replace(/\D/g, '');
    const dial = (match?.dialCode ?? this.dialCode()).replace(/\D/g, '');
    this.phoneNumber.set(digits.startsWith(dial) && dial ? digits.slice(dial.length) : digits);
    this.advisorId.set((s as any).advisorId ?? '');
    this.showEditModal.set(true);
  }

  closeEditModal() {
    this.showEditModal.set(false);
    this.editingStudent.set(null);
    this.formErrors.set({});
  }

  openObs(s: Student) {
    this.obsStudent.set(s);
    this.obsText.set('');
    this.obsError.set(null);
    this.loadObservationsFor(s.id);
    this.showObsModal.set(true);
  }

  closeObsModal() {
    this.showObsModal.set(false);
    this.obsStudent.set(null);
    this.obsText.set('');
    this.obsError.set(null);
  }

  openDelete(s: Student) {
    this.deleteTarget.set(s);
    this.showDeleteModal.set(true);
  }

  closeDeleteModal() {
    this.showDeleteModal.set(false);
    this.deleteTarget.set(null);
  }

  private loadObservationsFor(studentId: string) {
    this.svc.getObservations(studentId).subscribe({
      next: (v) => this.observations.set(Array.isArray(v) ? v : (v as any)?.data ?? []),
      error: () => this.observations.set([])
    });
  }

  // Paginación servidor vía p-table lazy: un solo control de paginación
  onPageChange(event: { first: number; rows: number }) {
    const rows = event.rows || this.limit();
    const nextPage = Math.floor((event.first || 0) / rows) + 1;
    this.limit.set(rows);
    this.page.set(nextPage);
    this.load();
  }

  onCountryChange(country: Country | null) {
    if (!country) return;
    this.selectedCountry.set(country);
    this.form.update(f => ({ ...f, countryOrigin: country.name, university: '' }));
    // limpia error de pais/universidad
    if (this.formErrors().countryOrigin) {
      this.formErrors.update(e => ({ ...e, countryOrigin: undefined }));
    }
    if (this.formErrors().university) {
      this.formErrors.update(e => ({ ...e, university: undefined }));
    }
  }

  onUniversityChange(value: string) {
    this.form.update(f => ({ ...f, university: value }));
  }

  onPhoneNumberChange(value: string) {
    // solo digitos, max 15
    const digits = value.replace(/\D/g, '').slice(0, 15);
    this.phoneNumber.set(digits);
    this.form.update(f => ({ ...f, phone: digits ? `${this.dialCode()} ${digits}`.trim() : '' }));
    if (this.formErrors().phone) {
      this.formErrors.update(e => ({ ...e, phone: undefined }));
    }
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

    const firstName = (f.firstName ?? '').trim();
    if (!firstName) {
      errors.firstName = 'El nombre es obligatorio';
    } else if (firstName.length < this.MIN_NAME_LENGTH) {
      errors.firstName = `Mínimo ${this.MIN_NAME_LENGTH} caracteres`;
    } else if (this.forbiddenCharsRegex.test(firstName) || !this.nameRegex.test(firstName)) {
      errors.firstName = 'No se permiten caracteres especiales (@ * { } etc.)';
    }

    const lastName = (f.lastName ?? '').trim();
    if (!lastName) {
      errors.lastName = 'El apellido es obligatorio';
    } else if (lastName.length < this.MIN_NAME_LENGTH) {
      errors.lastName = `Mínimo ${this.MIN_NAME_LENGTH} caracteres`;
    } else if (this.forbiddenCharsRegex.test(lastName) || !this.nameRegex.test(lastName)) {
      errors.lastName = 'No se permiten caracteres especiales (@ * { } etc.)';
    }

    const identification = (f.identification ?? '').trim();
    if (!identification) {
      errors.identification = 'La identificación es obligatoria';
    } else if (identification.length < this.MIN_ID_LENGTH) {
      errors.identification = `Mínimo ${this.MIN_ID_LENGTH} caracteres`;
    } else if (!this.identificationRegex.test(identification)) {
      errors.identification = 'Solo letras, números, puntos y guiones';
    }

    const email = (f.email ?? '').trim();
    if (!email) {
      errors.email = 'El email es obligatorio';
    } else if (!this.emailRegex.test(email)) {
      errors.email = 'Formato de email inválido (ej: nombre@dominio.com)';
    } else if (this.forbiddenCharsRegex.test(email) && /[@*{}]/.test(email.replace(/[@.]/g, ''))) {
      // email ya valida arroba/punto, pero bloquea * { }
      if (/[*{}]/.test(email)) errors.email = 'Email contiene caracteres no permitidos';
    }

    const country = this.selectedCountry()?.name ?? (f.countryOrigin ?? '').trim();
    if (!country) {
      errors.countryOrigin = 'Selecciona un país';
    } else if (!this.countries().some(c => c.name === country)) {
      errors.countryOrigin = 'País no válido';
    }

    const phoneDigits = this.phoneNumber().trim();
    if (phoneDigits) {
      if (!/^\d{7,15}$/.test(phoneDigits)) {
        errors.phone = 'Teléfono: 7 a 15 dígitos';
      }
    }

    // universidad opcional, pero si hay país y valor, debe pertenecer a la lista
    const uni = (f.university ?? '').trim();
    if (uni && this.universitiesForCountry().length > 0 && !this.universitiesForCountry().includes(uni)) {
      // permitimos universidad libre? Por requerimiento 1:N, validamos que si elige de la lista exista.
      // Si escribe manualmente y no está en lista, advertimos pero no bloqueamos — solo si usa dropdown encaja.
      // Para no ser estricto, no error si es texto libre fuera de lista.
    }

    this.formErrors.set(errors);
    return Object.keys(errors).length === 0;
  }

  load() {
    this.loading.set(true);
    this.error.set(null);
    this.svc.list({ search: this.search(), page: this.page(), limit: this.limit() }).subscribe({
      next: (r) => {
        // r ya viene desenvuelto por StudentsService.list (soporta {success,data} y PaginatedResponse directo)
        const data = (r as any)?.data ?? (Array.isArray(r) ? r : []);
        const total = (r as any)?.total ?? (Array.isArray(data) ? data.length : 0);
        const tpFromServer = (r as any)?.totalPages;
        const totalPages = tpFromServer !== undefined && tpFromServer !== null ? tpFromServer : (Math.ceil(total / this.limit()) || 1);
        this.students.set(Array.isArray(data) ? data : []);
        this.total.set(total);
        this.totalPages.set(totalPages);
        this.loading.set(false);
      },
      error: (e) => {
        // e.error puede venir envuelto {success:false, message}
        const message = e.error?.message || e.error?.data?.message || e.message || 'Error al cargar estudiantes';
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
      // marca que hay errores en todos los campos visibles
      this.toast.error('Corrige los errores del formulario');
      return;
    }

    // Payload estrictamente whitelisteado (backend: whitelist + forbidNonWhitelisted).
    // Normaliza: trim, email en minúsculas, opcionales vacíos se omiten (undefined)
    // para que el registro efectivamente persista en el sistema.
    const raw = this.form();
    const dial = this.dialCode();
    const phoneDigits = this.phoneNumber().replace(/\D/g, '').slice(0, 15);
    const fullPhone = phoneDigits ? `${dial} ${phoneDigits}`.trim() : undefined;
    const university = (raw.university ?? '').trim() || undefined;
    const payload: Record<string, unknown> = {
      firstName: this.sanitize(raw.firstName ?? '').trim(),
      lastName: this.sanitize(raw.lastName ?? '').trim(),
      identification: this.sanitize(raw.identification ?? '').trim(),
      email: this.sanitize(raw.email ?? '').trim().toLowerCase(),
      countryOrigin: this.selectedCountry()?.name ?? this.sanitize(raw.countryOrigin ?? '').trim(),
    };
    if (fullPhone) payload['phone'] = fullPhone;
    if (university) payload['university'] = this.sanitize(university);

    if (!this.emailRegex.test(payload['email'] as string)) {
      this.formErrors.update(e => ({ ...e, email: 'Formato de email inválido' }));
      this.toast.error('Email inválido');
      return;
    }

    this.loading.set(true);
    this.error.set(null);
    this.svc.create(payload).subscribe({
      next: () => {
        this.msg.set('Estudiante registrado');
        this.toast.success('Estudiante registrado correctamente');
        this.form.set({ firstName: '', lastName: '', identification: '', email: '', countryOrigin: this.selectedCountry()?.name ?? 'Colombia', phone: '', university: '' });
        this.phoneNumber.set('');
        this.formErrors.set({});
        this.loading.set(false);
        this.showCreateModal.set(false);
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

  // Compat: la acción "Ver" de la tabla abre el modal de detalle
  select(s: Student) {
    this.openDetail(s);
    this.svc.get(s.id).subscribe({
      next: (d) => {
        this.detailStudent.set(d as any);
        this.selected.set(d as any);
      },
      error: (e) => {
        const message = e.error?.message || 'Error al obtener estudiante';
        this.toast.error(message);
      }
    });
  }

  saveEdit() {
    const target = this.editingStudent();
    if (!target) return;
    if (!this.validateForm()) {
      this.toast.error('Corrige los errores del formulario');
      return;
    }
    const raw = this.form();
    const dial = this.dialCode();
    const phoneDigits = this.phoneNumber().replace(/\D/g, '').slice(0, 15);
    const fullPhone = phoneDigits ? `${dial} ${phoneDigits}`.trim() : undefined;
    const university = (raw.university ?? '').trim() || undefined;
    const payload: Record<string, unknown> = {
      firstName: this.sanitize(raw.firstName ?? '').trim(),
      lastName: this.sanitize(raw.lastName ?? '').trim(),
      identification: this.sanitize(raw.identification ?? '').trim(),
      email: this.sanitize(raw.email ?? '').trim().toLowerCase(),
      countryOrigin: this.selectedCountry()?.name ?? this.sanitize(raw.countryOrigin ?? '').trim(),
    };
    if (fullPhone) payload['phone'] = fullPhone;
    if (university) payload['university'] = this.sanitize(university);

    this.loading.set(true);
    this.svc.update(target.id, payload).subscribe({
      next: () => {
        this.toast.success('Estudiante actualizado correctamente');
        this.loading.set(false);
        this.closeEditModal();
        this.load();
      },
      error: (e) => {
        const message = e.error?.message || 'Error al actualizar estudiante';
        this.toast.error(message);
        this.loading.set(false);
      }
    });
  }

  confirmDelete() {
    const target = this.deleteTarget();
    if (!target) return;
    this.loading.set(true);
    this.svc.remove(target.id).subscribe({
      next: () => {
        this.toast.success('Estudiante desactivado correctamente');
        this.loading.set(false);
        this.closeDeleteModal();
        this.page.set(1);
        this.load();
      },
      error: (e) => {
        const message = e.error?.message || 'Error al desactivar estudiante';
        this.toast.error(message);
        this.loading.set(false);
      }
    });
  }

  assignAdvisor() {
    const id = this.editingStudent()?.id ?? this.detailStudent()?.id ?? this.selected()?.id;
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
    const id = this.obsStudent()?.id ?? this.selected()?.id;
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
        this.loadObservationsFor(id);
      },
      error: (e) => {
        const message = e.error?.message || 'Error al agregar observación';
        this.toast.error(message);
      }
    });
  }
}
