import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardService } from './dashboard.service';
import { DashboardSummary } from '../../shared/interfaces/api.interface';
import { LoadingComponent } from '../../shared/components/loading.component';
import { ErrorComponent } from '../../shared/components/error.component';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, LoadingComponent, ErrorComponent],
  template: `
    <div class="p-6 max-w-7xl mx-auto">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-slate-800">Dashboard</h1>
        <p class="text-sm text-slate-500 mt-1">Indicadores RF-051 a RF-056 — Resumen general del sistema</p>
      </div>

      <!-- Loading / Error -->
      <app-loading [show]="loading()" message="Cargando resumen del dashboard..."></app-loading>
      <app-error [message]="error()" (retry)="load()"></app-error>

      <!-- Skeleton placeholders mientras carga -->
      <div *ngIf="loading()" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
        <div *ngFor="let i of [1,2,3,4,5,6]" class="bg-white p-6 rounded-xl shadow-sm border border-slate-200 animate-pulse">
          <div class="flex items-center gap-4 mb-4">
            <div class="w-12 h-12 bg-slate-200 rounded-lg"></div>
            <div class="flex-1 space-y-2">
              <div class="h-4 bg-slate-200 rounded w-3/4"></div>
              <div class="h-3 bg-slate-100 rounded w-1/2"></div>
            </div>
          </div>
          <div class="h-8 bg-slate-200 rounded w-1/3 mb-2"></div>
          <div class="h-3 bg-slate-100 rounded w-2/3"></div>
        </div>
      </div>

      <!-- Contenido real -->
      <div *ngIf="!loading() && summary() as s" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
        <!-- RF-051 Indicadores Generales -->
        <div class="bg-white p-6 rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
          <div class="flex items-center justify-between mb-3">
            <h3 class="text-sm font-semibold text-slate-600 uppercase tracking-wide">Indicadores Generales</h3>
            <span class="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded-full font-medium">RF-051</span>
          </div>
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center text-indigo-600 text-xl">📊</div>
            <div>
              <p class="text-3xl font-bold text-slate-800">{{ safeNumber(s.users?.total) }}</p>
              <p class="text-sm text-slate-500">Total usuarios</p>
            </div>
          </div>
          <div class="mt-4 pt-4 border-t border-slate-100 flex justify-between text-xs text-slate-500">
            <span>Activos: {{ safeNumber(s.students.active) }}</span>
            <span>Total estudiantes: {{ safeNumber(s.students.total) }}</span>
          </div>
        </div>

        <!-- RF-052 Estudiantes Activos -->
        <div class="bg-white p-6 rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
          <div class="flex items-center justify-between mb-3">
            <h3 class="text-sm font-semibold text-slate-600 uppercase tracking-wide">Estudiantes Activos</h3>
            <span class="text-xs bg-sky-100 text-sky-700 px-2 py-1 rounded-full font-medium">RF-052</span>
          </div>
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 bg-sky-100 rounded-xl flex items-center justify-center text-sky-600 text-xl">🎓</div>
            <div>
              <p class="text-3xl font-bold text-slate-800">{{ safeNumber(s.students.active) }} <span class="text-lg font-normal text-slate-400">/ {{ safeNumber(s.students.total) }}</span></p>
              <p class="text-sm text-slate-500">Activos / Totales</p>
            </div>
          </div>
          <div class="mt-4 flex items-center gap-2 text-sm">
            <span class="w-2 h-2 bg-emerald-500 rounded-full"></span>
            <span class="text-slate-600">Nuevos este mes:</span>
            <span class="font-semibold text-emerald-600">{{ safeNumber(s.students.newThisMonth) }}</span>
          </div>
          <div class="mt-3 w-full bg-slate-100 rounded-full h-2 overflow-hidden">
            <div class="bg-sky-500 h-2 rounded-full transition-all" [style.width.%]="getStudentsProgress(s)"></div>
          </div>
        </div>

        <!-- RF-053 Documentos Pendientes -->
        <div class="bg-white p-6 rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
          <div class="flex items-center justify-between mb-3">
            <h3 class="text-sm font-semibold text-slate-600 uppercase tracking-wide">Documentos Pendientes</h3>
            <span class="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded-full font-medium">RF-053</span>
          </div>
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center text-amber-600 text-xl">📄</div>
            <div>
              <p class="text-3xl font-bold text-amber-600">{{ safeNumber(s.documents.pending) }}</p>
              <p class="text-sm text-slate-500">Pendientes por revisar</p>
            </div>
          </div>
          <div class="mt-4 pt-4 border-t border-slate-100 flex justify-between text-xs">
            <span class="text-slate-500">Total documentos: <span class="font-semibold text-slate-700">{{ safeNumber(s.documents.total) }}</span></span>
            <span *ngIf="s.documents.pending > 0" class="text-amber-600 font-medium">Requiere atención</span>
            <span *ngIf="s.documents.pending === 0" class="text-emerald-600 font-medium">Al día</span>
          </div>
        </div>

        <!-- RF-054 Visas por vencer -->
        <div class="bg-white p-6 rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
          <div class="flex items-center justify-between mb-3">
            <h3 class="text-sm font-semibold text-slate-600 uppercase tracking-wide">Visas por Vencer</h3>
            <span class="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded-full font-medium">RF-054</span>
          </div>
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center text-orange-600 text-xl">🛂</div>
            <div>
              <p class="text-3xl font-bold text-orange-500">{{ safeNumber(s.visas.expiringIn90Days) }}</p>
              <p class="text-sm text-slate-500">Expiran en 90 días</p>
            </div>
          </div>
          <div class="mt-4 flex items-center justify-between text-sm">
            <span class="text-slate-500">Vencidas: <span class="font-bold text-red-600">{{ safeNumber(s.visas.expired) }}</span></span>
            <span *ngIf="s.visas.expired > 0" class="bg-red-50 text-red-600 px-2 py-1 rounded-full text-xs font-medium">Acción requerida</span>
            <span *ngIf="s.visas.expired === 0 && s.visas.expiringIn90Days === 0" class="bg-emerald-50 text-emerald-600 px-2 py-1 rounded-full text-xs font-medium">Sin alertas</span>
          </div>
        </div>

        <!-- RF-055 Pagos Pendientes -->
        <div class="bg-white p-6 rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
          <div class="flex items-center justify-between mb-3">
            <h3 class="text-sm font-semibold text-slate-600 uppercase tracking-wide">Pagos Pendientes</h3>
            <span class="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full font-medium">RF-055</span>
          </div>
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center text-red-600 text-xl">💳</div>
            <div>
              <p class="text-3xl font-bold text-red-500">{{ safeNumber(s.payments.pending) }}</p>
              <p class="text-sm text-slate-500">Cuotas pendientes</p>
            </div>
          </div>
          <div class="mt-4 space-y-1 text-sm">
            <div class="flex justify-between">
              <span class="text-slate-500">Atrasados:</span>
              <span class="font-semibold text-red-600">{{ safeNumber(s.payments.overdue) }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-slate-500">Monto total:</span>
              <span class="font-semibold text-slate-800">\${{ safeNumber(s.payments.totalAmount) }}</span>
            </div>
          </div>
        </div>

        <!-- RF-056 Próximos Eventos -->
        <div class="bg-white p-6 rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
          <div class="flex items-center justify-between mb-3">
            <h3 class="text-sm font-semibold text-slate-600 uppercase tracking-wide">Próximos Eventos</h3>
            <span class="text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full font-medium">RF-056</span>
          </div>
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-600 text-xl">📅</div>
            <div>
              <p class="text-3xl font-bold text-slate-800">{{ safeNumber(s.events.next7Days) }}</p>
              <p class="text-sm text-slate-500">En los próximos 7 días</p>
            </div>
          </div>
          <div class="mt-4 pt-4 border-t border-slate-100 flex justify-between text-xs text-slate-500">
            <span>Total eventos: <span class="font-semibold text-slate-700">{{ safeNumber(s.events.total) }}</span></span>
            <span *ngIf="s.events.next7Days > 0" class="text-emerald-600 font-medium">● Próximamente</span>
          </div>
        </div>
      </div>

      <!-- Estado vacío / sin datos -->
      <div *ngIf="!loading() && !error() && !summary()" class="mt-8 bg-white p-12 rounded-xl shadow-sm border border-slate-200 text-center">
        <div class="text-4xl mb-3">📭</div>
        <p class="text-slate-600 font-medium">No hay datos disponibles</p>
        <p class="text-sm text-slate-400 mt-1">Intenta recargar el dashboard</p>
        <button (click)="load()" class="mt-4 bg-slate-800 hover:bg-slate-900 text-white px-5 py-2 rounded-lg text-sm font-medium transition-colors">Recargar</button>
      </div>
    </div>
  `
})
export class DashboardComponent implements OnInit {
  summary = signal<DashboardSummary | null>(null);
  loading = signal(true);
  error = signal<string | null>(null);

  constructor(private svc: DashboardService, private toast: ToastService) {}

  ngOnInit() {
    this.load();
  }

  load() {
    this.loading.set(true);
    this.error.set(null);
    // Mantener llamada a getSummary() intacta pero con mejor UX
    this.svc.getSummary().subscribe({
      next: v => {
        this.summary.set(this.sanitizeSummary(v));
        this.loading.set(false);
      },
      error: e => {
        const msg = e.error?.message || e.message || 'Error cargando dashboard';
        const sanitizedMsg = this.sanitizeString(msg);
        this.error.set(sanitizedMsg);
        this.toast.error(sanitizedMsg);
        this.loading.set(false);
      }
    });
  }

  /** Seguridad: sanitizar strings antes de mostrar — no usar innerHTML sin sanitizar */
  private sanitizeString(value: string): string {
    if (!value || typeof value !== 'string') return '';
    return value
      .replace(/<[^>]*>/g, '')
      .replace(/[<>]/g, '')
      .replace(/\.\./g, '')
      .replace(/[\/\\]/g, '')
      .trim()
      .slice(0, 500);
  }

  private sanitizeSummary(data: DashboardSummary): DashboardSummary {
    // Los números se validan; strings no hay en DashboardSummary pero se sanitiza por si backend envía datos inyectados
    // Usamos interpolación {{ }} en template que ya escapa HTML, y aquí aseguramos tipos numéricos
    return {
      students: {
        total: this.toSafeInt(data.students?.total),
        active: this.toSafeInt(data.students?.active),
        newThisMonth: this.toSafeInt(data.students?.newThisMonth)
      },
      documents: {
        total: this.toSafeInt(data.documents?.total),
        pending: this.toSafeInt(data.documents?.pending)
      },
      visas: {
        expiringIn90Days: this.toSafeInt(data.visas?.expiringIn90Days),
        expired: this.toSafeInt(data.visas?.expired)
      },
      payments: {
        pending: this.toSafeInt(data.payments?.pending),
        overdue: this.toSafeInt(data.payments?.overdue),
        totalAmount: this.toSafeNumber(data.payments?.totalAmount)
      },
      events: {
        next7Days: this.toSafeInt(data.events?.next7Days),
        total: this.toSafeInt(data.events?.total)
      },
      users: data.users ? { total: this.toSafeInt(data.users.total) } : undefined
    };
  }

  private toSafeInt(v: any): number {
    const n = Number(v);
    return Number.isFinite(n) && n >= 0 ? Math.floor(n) : 0;
  }

  private toSafeNumber(v: any): number {
    const n = Number(v);
    return Number.isFinite(n) && n >= 0 ? n : 0;
  }

  // Helpers para template — sanitizan antes de mostrar
  safeNumber(v: any): number | string {
    if (v === null || v === undefined) return '-';
    const n = Number(v);
    return Number.isFinite(n) ? n : '-';
  }

  getStudentsProgress(s: DashboardSummary): number {
    if (!s.students?.total) return 0;
    const pct = (s.students.active / s.students.total) * 100;
    return Math.min(100, Math.max(0, Math.round(pct)));
  }
}
