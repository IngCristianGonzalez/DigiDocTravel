import { Component, OnInit, signal, computed, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StudentsService } from './students.service';
import { Student } from '../../shared/interfaces/api.interface';
import { LoadingComponent } from '../../shared/components/loading.component';
import { ErrorComponent } from '../../shared/components/error.component';
import { ToastService } from '../../core/services/toast.service';
import { COUNTRIES, Country } from './countries.data';

// PrimeNG - SL Global (lara-light-amber)
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { FloatLabelModule } from 'primeng/floatlabel';
import { TableModule, Table } from 'primeng/table';
import { SkeletonModule } from 'primeng/skeleton';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { DialogModule } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown';

// Fix PrimeNG Table dataToRender crash (chunk-N2JOYJBE.js:4 t.slice / primeng_table.js:13454)
// Revisado con puppeteer: _data.slice is not a function cuando paginator llama con number
try {
  const proto: any = (Table as any).prototype;
  const orig = proto.dataToRender;
  if (orig && !(orig as any).__patched) {
    const patched = function (this: any, data: any) {
      const _data = data ?? this.processedData;
      if (_data && this.paginator) {
        if (!Array.isArray(_data)) {
          const fallback = Array.isArray(this.processedData) ? this.processedData : [];
          const first = this.lazy ? 0 : this.first;
          return fallback.slice(first, first + this.rows);
        }
        const first = this.lazy ? 0 : this.first;
        return _data.slice(first, first + this.rows);
      }
      return Array.isArray(_data) ? _data : (Array.isArray(this.processedData) ? this.processedData : []);
    };
    (patched as any).__patched = true;
    (patched as any).__orig = orig;
    proto.dataToRender = patched;
  }
} catch {}

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

  // modal + paises/universidades
  showCreateModal = signal(false);
  countries = signal<Country[]>(COUNTRIES);
  selectedCountry = signal<Country | null>(COUNTRIES.find(c => c.code === 'CO') ?? COUNTRIES[0]);
  phoneNumber = signal('');
  formErrors = signal<{ firstName?: string; lastName?: string; email?: string; countryOrigin?: string; phone?: string; university?: string }>({});
  obsError = signal<string | null>(null);

  // computed helpers
  dialCode = computed(() => this.selectedCountry()?.dialCode ?? '');
  universitiesForCountry = computed(() => this.selectedCountry()?.universities ?? []);

  readonly skeletonRows = Array.from({ length: 8 }, () => ({} as Student));

  private emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  // Solo letras (incluye acentos), espacios, apóstrofe y guion. Bloquea @ * { } [ ] etc.
  private nameRegex = /^[A-Za-zÁÉÍÓÚáéíóúÑñÜü\s'-]+$/;
  private forbiddenCharsRegex = /[@*{}[\]#\$%\^&+=\|~`<>]/;

  constructor(private svc: StudentsService, private toast: ToastService) {}

  ngOnInit() {
    this.load();
    // inicializa countryOrigin desde selectedCountry
    if (this.selectedCountry()) {
      this.form.update(f => ({ ...f, countryOrigin: this.selectedCountry()!.name }));
    }
  }

  // Modal controls
  openCreateModal() {
    // reset form + errores
    this.form.set({ firstName: '', lastName: '', email: '', countryOrigin: this.selectedCountry()?.name ?? 'Colombia', phone: '', university: '' });
    this.phoneNumber.set('');
    this.formErrors.set({});
    this.showCreateModal.set(true);
  }

  closeCreateModal() {
    this.showCreateModal.set(false);
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
    } else if (firstName.length < 3) {
      errors.firstName = 'Mínimo 3 caracteres';
    } else if (this.forbiddenCharsRegex.test(firstName) || !this.nameRegex.test(firstName)) {
      errors.firstName = 'No se permiten caracteres especiales (@ * { } etc.)';
    }

    const lastName = (f.lastName ?? '').trim();
    if (!lastName) {
      errors.lastName = 'El apellido es obligatorio';
    } else if (lastName.length < 4) {
      errors.lastName = 'Mínimo 4 caracteres';
    } else if (this.forbiddenCharsRegex.test(lastName) || !this.nameRegex.test(lastName)) {
      errors.lastName = 'No se permiten caracteres especiales (@ * { } etc.)';
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
      // marca que hay errores en todos los campos visibles
      this.toast.error('Corrige los errores del formulario');
      return;
    }

    // arma payload con país, teléfono con indicativo y universidad
    const base = this.sanitizeForm(this.form());
    const dial = this.dialCode();
    const phoneDigits = this.phoneNumber().trim();
    const fullPhone = phoneDigits ? `${dial} ${phoneDigits}`.trim() : '';
    const payload = {
      ...base,
      countryOrigin: this.selectedCountry()?.name ?? base.countryOrigin,
      phone: fullPhone,
      // university ya sanitizada
    };

    if (!this.emailRegex.test(payload.email)) {
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
        this.form.set({ firstName: '', lastName: '', email: '', countryOrigin: this.selectedCountry()?.name ?? 'Colombia', phone: '', university: '' });
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
