import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NotificationsService } from './notifications.service';
import { LoadingComponent } from '../../shared/components/loading.component';
import { ErrorComponent } from '../../shared/components/error.component';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule, FormsModule, LoadingComponent, ErrorComponent],
  template: `
    <div class="p-6 max-w-6xl mx-auto">
      <h1 class="text-2xl font-bold text-slate-800 mb-6">Notificaciones - RF-042 a RF-045</h1>

      <!-- Loading / Error -->
      <app-loading [show]="loading()" message="Cargando notificaciones..."></app-loading>
      <app-error [message]="error()" (retry)="load()"></app-error>

      <!-- Header RF-042 in-app + RF-044 -->
      <div class="flex flex-wrap items-center gap-3 mb-6 bg-white p-4 rounded-xl shadow-sm border border-slate-200">
        <span class="text-sm text-slate-700">No leídas: <b class="text-sky-600">{{ unreadCount() }}</b> - RF-042 in-app</span>
        <span class="flex-1"></span>
        <button (click)="markAll()" [disabled]="loading() || unreadCount() === 0" class="bg-sky-500 hover:bg-sky-600 disabled:bg-slate-300 text-white font-medium px-5 py-2 rounded-lg transition-colors text-sm">Marcar todas leídas RF-044</button>
        <button (click)="load()" [disabled]="loading()" class="bg-slate-800 hover:bg-slate-900 disabled:bg-slate-300 text-white font-medium px-5 py-2 rounded-lg transition-colors text-sm">Refrescar</button>
      </div>

      <!-- RF-045 Historial filtros por tipo/estado -->
      <div class="bg-white p-4 rounded-xl shadow-sm border border-slate-200 mb-6">
        <h3 class="text-sm font-semibold text-slate-700 mb-3">Filtros historial RF-045</h3>
        <div class="flex flex-col sm:flex-row gap-3">
          <select
            [ngModel]="filterType()"
            (ngModelChange)="filterType.set($event)"
            class="px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 bg-white text-sm flex-1"
          >
            <option value="">Todos los tipos</option>
            <option value="info">Info</option>
            <option value="warning">Warning</option>
            <option value="success">Success</option>
            <option value="error">Error</option>
            <option value="visa">Visa</option>
            <option value="payment">Payment</option>
            <option value="document">Document</option>
          </select>
          <select
            [ngModel]="filterStatus()"
            (ngModelChange)="filterStatus.set($event)"
            class="px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 bg-white text-sm flex-1"
          >
            <option value="">Todos los estados</option>
            <option value="unread">No leídas</option>
            <option value="read">Leídas</option>
          </select>
          <button (click)="resetAndLoad()" class="bg-slate-800 hover:bg-slate-900 text-white px-6 py-2 rounded-lg font-medium transition-colors text-sm">Filtrar RF-045</button>
          <button (click)="clearFilters()" class="bg-white hover:bg-slate-100 border border-slate-300 px-6 py-2 rounded-lg font-medium transition-colors text-sm">Limpiar</button>
        </div>
      </div>

      <!-- Lista RF-042 -->
      <div class="grid gap-3">
        <div *ngFor="let n of filteredNotifs()" class="bg-white p-4 rounded-xl shadow-sm border border-slate-200 border-l-4 border-l-sky-500 transition-opacity" [class.opacity-60]="n.read" [class.opacity-100]="!n.read">
          <div class="flex justify-between items-start gap-4 mb-1">
            <!-- Seguridad: interpolación (no innerHTML) + sanitización en TS -->
            <b class="text-sm text-slate-800">{{ displayTitle(n) }} - <span class="font-normal text-slate-500">{{ displayType(n) }}</span></b>
            <small class="text-xs text-slate-400 whitespace-nowrap">{{ n.createdAt | date:'short' }}</small>
          </div>
          <div class="text-sm text-slate-600 mb-2">{{ displayMessage(n) }}</div>
          <div class="text-xs text-slate-500 flex flex-wrap gap-3 items-center">
            <span>Ref: {{ displayReference(n) }}</span>
            <span class="px-2 py-0.5 rounded-full text-xs font-medium" [class.bg-emerald-100]="n.emailSent" [class.text-emerald-700]="n.emailSent" [class.bg-slate-100]="!n.emailSent" [class.text-slate-500]="!n.emailSent">
              Email enviado: {{ n.emailSent ? 'Sí RF-043' : 'No' }}
            </span>
            <span *ngIf="n.read" class="px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 text-xs">Leída</span>
            <span *ngIf="!n.read" class="px-2 py-0.5 rounded-full bg-sky-100 text-sky-700 text-xs">No leída</span>
          </div>
          <button *ngIf="!n.read" (click)="markOne(n.id)" [disabled]="loading()" class="mt-3 text-xs bg-white hover:bg-slate-100 border border-slate-300 px-3 py-1.5 rounded-lg font-medium transition-colors disabled:opacity-40">Marcar leída</button>
        </div>

        <div *ngIf="!loading() && filteredNotifs().length === 0" class="bg-white p-8 rounded-xl shadow-sm border border-slate-200 text-center text-slate-400 text-sm">
          No se encontraron notificaciones
        </div>
      </div>

      <!-- Paginación Anterior/Siguiente -->
      <div class="flex items-center justify-between px-4 py-3 border border-slate-200 bg-slate-50 rounded-xl mt-4">
        <span class="text-sm text-slate-600">Página {{ page() }} de {{ totalPages() }} — Total: {{ total() }} registros</span>
        <div class="flex gap-2">
          <button (click)="prevPage()" [disabled]="page() <= 1" class="px-4 py-1.5 rounded-lg border text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed bg-white border-slate-300 hover:bg-slate-100">Anterior</button>
          <button (click)="nextPage()" [disabled]="page() >= totalPages()" class="px-4 py-1.5 rounded-lg border text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed bg-white border-slate-300 hover:bg-slate-100">Siguiente</button>
        </div>
      </div>

      <div class="mt-4 text-xs text-slate-500 bg-white p-3 rounded-lg border border-slate-200">RF-045 Historial completo con filtros por tipo/estado. RF-042 list in-app · RF-043 emailSent flag · RF-044 markRead/markAll.</div>
    </div>
  `
})
export class NotificationsComponent implements OnInit {
  loading = signal(false);
  error = signal<string | null>(null);
  notifs = signal<any[]>([]);
  unreadCount = signal(0);
  page = signal(1);
  total = signal(0);
  totalPages = signal(1);
  limit = signal(10);

  // RF-045 filtros historial intactos
  filterType = signal('');
  filterStatus = signal('');

  constructor(private svc: NotificationsService, private toast: ToastService) {}

  ngOnInit() {
    this.load();
    this.loadUnread();
  }

  // Seguridad: sanitizar message/title antes de mostrar (strip tags, <>, .., /\)
  private sanitize(value: string): string {
    if (!value) return '';
    return value
      .replace(/<[^>]*>/g, '')
      .replace(/[<>]/g, '')
      .replace(/\.\./g, '')
      .replace(/[\/\\]/g, '')
      .trim();
  }

  // Helpers de display sanitizado - nunca usar innerHTML, solo interpolación
  displayTitle(n: any): string {
    return this.sanitize(String(n.title ?? ''));
  }
  displayMessage(n: any): string {
    return this.sanitize(String(n.message ?? ''));
  }
  displayType(n: any): string {
    return this.sanitize(String(n.type ?? ''));
  }
  displayReference(n: any): string {
    return this.sanitize(String(n.referenceType ?? '-'));
  }

  filteredNotifs(): any[] {
    // Filtro cliente para historial RF-045 si backend no filtra; paginación sigue funcionando
    let list = this.notifs();
    const t = this.filterType();
    const s = this.filterStatus();
    if (t) {
      list = list.filter(n => String(n.type).toLowerCase() === t.toLowerCase());
    }
    if (s === 'read') {
      list = list.filter(n => !!n.read);
    } else if (s === 'unread') {
      list = list.filter(n => !n.read);
    }
    return list;
  }

  load() {
    this.loading.set(true);
    this.error.set(null);
    const params: any = { page: this.page(), limit: this.limit() };
    // Enviar filtros al backend si soporta
    if (this.filterType()) params.type = this.sanitize(this.filterType());
    if (this.filterStatus()) params.status = this.sanitize(this.filterStatus());

    this.svc.list(params).subscribe({
      next: (r: any) => {
        // RF-042 list
        const data = r?.data ?? (Array.isArray(r) ? r : []);
        // Sanitizar cada notificación antes de guardar (defensa en profundidad)
        const sanitized = (data as any[]).map(n => ({
          ...n,
          title: this.sanitize(String(n.title ?? '')),
          message: this.sanitize(String(n.message ?? '')),
          type: this.sanitize(String(n.type ?? '')),
          referenceType: n.referenceType ? this.sanitize(String(n.referenceType)) : n.referenceType
        }));
        this.notifs.set(sanitized);
        const totalVal = r?.total ?? sanitized.length ?? 0;
        this.total.set(totalVal);
        const tp = ((r as any)?.totalPages ?? (Math.ceil(totalVal / this.limit()) || 1));
        this.totalPages.set(tp);
        this.loading.set(false);
      },
      error: (e: any) => {
        const message = e.error?.message || e.message || 'Error al cargar notificaciones';
        this.error.set(message);
        this.toast.error(message);
        this.loading.set(false);
      }
    });
  }

  loadUnread() {
    this.svc.unread().subscribe({
      next: (r: any) => this.unreadCount.set(r.count ?? r.total ?? 0),
      error: () => this.unreadCount.set(0)
    });
  }

  resetAndLoad() {
    this.page.set(1);
    this.load();
    this.toast.info('Filtros aplicados - RF-045');
  }

  clearFilters() {
    this.filterType.set('');
    this.filterStatus.set('');
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

  markOne(id: string) {
    const sanitizedId = this.sanitize(id);
    if (!sanitizedId) {
      this.toast.error('ID no válido');
      return;
    }
    this.loading.set(true);
    this.error.set(null);
    // RF-044 markRead
    this.svc.markRead(sanitizedId).subscribe({
      next: () => {
        this.toast.success('Notificación marcada como leída - RF-044');
        this.loading.set(false);
        this.load();
        this.loadUnread();
      },
      error: (e: any) => {
        const message = e.error?.message || e.message || 'Error al marcar como leída';
        this.error.set(message);
        this.toast.error(message);
        this.loading.set(false);
      }
    });
  }

  markAll() {
    this.loading.set(true);
    this.error.set(null);
    // RF-044 markAll
    this.svc.markAll().subscribe({
      next: () => {
        this.toast.success('Todas las notificaciones marcadas como leídas - RF-044');
        this.loading.set(false);
        this.load();
        this.loadUnread();
      },
      error: (e: any) => {
        const message = e.error?.message || e.message || 'Error al marcar todas como leídas';
        this.error.set(message);
        this.toast.error(message);
        this.loading.set(false);
      }
    });
  }
}
