import { Component, OnInit, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NotificationsService } from './notifications.service';
import { Notification } from '../../shared/interfaces/api.interface';

// El backend expone si el aviso también salió por correo
export interface NotifItem extends Notification {
  emailSent?: boolean;
}
import { LoadingComponent } from '../../shared/components/loading.component';
import { ErrorComponent } from '../../shared/components/error.component';
import { ToastService } from '../../core/services/toast.service';

// PrimeNG - SL Global · PrimeNG 17 (mismo patrón que el resto de módulos)
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TableModule } from 'primeng/table';
import { SkeletonModule } from 'primeng/skeleton';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { DialogModule } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    LoadingComponent,
    ErrorComponent,
    ButtonModule,
    InputTextModule,
    TableModule,
    SkeletonModule,
    TagModule,
    TooltipModule,
    DialogModule,
    DropdownModule,
  ],
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NotificationsComponent implements OnInit {
  loading = signal(false);
  error = signal<string | null>(null);
  notifs = signal<NotifItem[]>([]);
  unreadCount = signal(0);
  page = signal(1);
  total = signal(0);
  totalPages = signal(1);
  limit = signal(10);
  search = signal('');

  // Filtros historial (legacy — se mantienen por compatibilidad)
  filterType = signal('');
  filterStatus = signal('');
  readonly typeOptions = ['info', 'warning', 'success', 'error', 'visa', 'payment', 'document'];
  readonly statusOptions = [
    { label: 'No leídas', value: 'unread' },
    { label: 'Leídas', value: 'read' },
  ];
  // Filtros por columna (ERP PrimeNG) — reemplazan la búsqueda global
  fTitle = signal('');
  fType = signal('');
  fDate = signal('');
  fEmail = signal('');
  fRead = signal('');
  readonly emailOptions = [
    { label: 'Sí', value: 'true' },
    { label: 'No', value: 'false' },
  ];
  readonly readOptions = [
    { label: 'Leída', value: 'read' },
    { label: 'No leída', value: 'unread' },
  ];

  // Modales — detalle y confirmación de marcar todas
  showDetailModal = signal(false);
  showMarkAllModal = signal(false);
  detailNotif = signal<NotifItem | null>(null);

  readonly skeletonRows = Array.from({ length: 8 }, () => ({} as NotifItem));

  constructor(private svc: NotificationsService, private toast: ToastService) {}

  ngOnInit() {
    this.load();
    this.loadUnread();
  }

  // Seguridad: sanitizar antes de mostrar (nunca innerHTML, solo interpolación)
  private sanitize(value: string): string {
    if (!value) return '';
    return value
      .replace(/<[^>]*>/g, '')
      .replace(/[<>]/g, '')
      .replace(/\.\./g, '')
      .replace(/[\/\\]/g, '')
      .trim();
  }

  // ---- Modales ----
  openDetail(n: NotifItem) {
    this.detailNotif.set(n);
    this.showDetailModal.set(true);
  }

  closeDetailModal() {
    this.showDetailModal.set(false);
    this.detailNotif.set(null);
  }

  markReadFromDetail() {
    const d = this.detailNotif();
    this.closeDetailModal();
    if (d && !d.read) this.markOne(d.id);
  }

  openMarkAll() {
    this.showMarkAllModal.set(true);
  }

  closeMarkAllModal() {
    this.showMarkAllModal.set(false);
  }

  onPageChange(event: { first: number; rows: number }) {
    const rows = event.rows || this.limit();
    this.limit.set(rows);
    this.page.set(Math.floor((event.first || 0) / rows) + 1);
    this.load();
  }

  typeSeverity(t?: string): 'info' | 'warning' | 'success' | 'danger' | 'secondary' {
    if (t === 'error') return 'danger';
    if (t === 'warning' || t === 'visa' || t === 'payment') return 'warning';
    if (t === 'success') return 'success';
    if (t === 'info' || t === 'document') return 'info';
    return 'secondary';
  }

  load() {
    this.loading.set(true);
    this.error.set(null);
    const params: any = { page: this.page(), limit: this.limit() };
    const searchParts = [this.fTitle().trim(), this.search().trim()].filter(Boolean);
    if (searchParts.length) params.search = searchParts.join(' ');
    const typeVal = this.fType() || this.filterType();
    if (typeVal) params.type = this.sanitize(typeVal);
    if (this.fDate()) {
      params.createdAt = this.fDate();
      params.date = this.fDate();
    }
    if (this.fEmail()) params.emailSent = this.fEmail();
    const readVal = this.fRead() || this.filterStatus();
    if (readVal) params.status = this.sanitize(readVal);

    this.svc.list(params).subscribe({
      next: (r: any) => {
        // Sanitizar cada notificación (defensa en profundidad)
        const data = r?.data ?? (Array.isArray(r) ? r : []);
        const sanitized = (Array.isArray(data) ? data : []).map(n => ({
          ...n,
          title: this.sanitize(String(n.title ?? '')),
          message: this.sanitize(String(n.message ?? '')),
          type: this.sanitize(String(n.type ?? '')),
        }));
        this.notifs.set(sanitized);
        const totalVal = r?.total ?? sanitized.length ?? 0;
        this.total.set(totalVal);
        this.totalPages.set(r?.totalPages ?? (Math.ceil(totalVal / this.limit()) || 1));
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
      next: (r: any) => this.unreadCount.set(r?.count ?? r?.total ?? 0),
      error: () => this.unreadCount.set(0)
    });
  }

  resetAndLoad() {
    this.page.set(1);
    this.load();
  }

  clearFilters() {
    this.filterType.set('');
    this.filterStatus.set('');
    this.fTitle.set('');
    this.fType.set('');
    this.fDate.set('');
    this.fEmail.set('');
    this.fRead.set('');
    this.search.set('');
    this.page.set(1);
    this.load();
  }

  // ---- Filtros por columna (ERP) ----
  onColumnFilter() {
    this.page.set(1);
    this.load();
  }

  hasActiveFilters(): boolean {
    return !!(this.fTitle() || this.fType() || this.fDate() || this.fEmail() || this.fRead() || this.search() || this.filterType() || this.filterStatus());
  }

  clearColumnFilters(dt?: any) {
    dt?.clear();
    this.fTitle.set('');
    this.fType.set('');
    this.fDate.set('');
    this.fEmail.set('');
    this.fRead.set('');
    this.search.set('');
    this.filterType.set('');
    this.filterStatus.set('');
    this.page.set(1);
    this.load();
  }

  markOne(id: string) {
    const sanitizedId = this.sanitize(id);
    if (!sanitizedId) {
      this.toast.error('ID no válido');
      return;
    }
    this.loading.set(true);
    this.svc.markRead(sanitizedId).subscribe({
      next: () => {
        this.toast.success('Notificación marcada como leída');
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

  confirmMarkAll() {
    this.loading.set(true);
    this.svc.markAll().subscribe({
      next: () => {
        this.toast.success('Todas marcadas como leídas');
        this.loading.set(false);
        this.closeMarkAllModal();
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
