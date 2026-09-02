import { Component, OnInit, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { DashboardService } from './dashboard.service';
import { DashboardSummary } from '../../shared/interfaces/api.interface';
import { LoadingComponent } from '../../shared/components/loading.component';
import { ErrorComponent } from '../../shared/components/error.component';
import { ToastService } from '../../core/services/toast.service';

// PrimeNG
import { ButtonModule } from 'primeng/button';
import { SkeletonModule } from 'primeng/skeleton';
import { CardModule } from 'primeng/card';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, LoadingComponent, ErrorComponent, ButtonModule, SkeletonModule, CardModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardComponent implements OnInit {
  summary = signal<DashboardSummary | null>(null);
  loading = signal(true);
  error = signal<string | null>(null);

  constructor(
    private svc: DashboardService,
    private toast: ToastService,
  ) {}

  ngOnInit() {
    this.load();
  }

  load() {
    this.loading.set(true);
    this.error.set(null);
    this.svc.getSummary().subscribe({
      next: (v) => {
        this.summary.set(this.sanitizeSummary(v));
        this.loading.set(false);
      },
      error: (e) => {
        const msg = e.error?.message || e.message || 'Error cargando dashboard';
        const sanitizedMsg = this.sanitizeString(msg);
        this.error.set(sanitizedMsg);
        this.toast.error(sanitizedMsg);
        this.loading.set(false);
      },
    });
  }

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
    return {
      students: {
        total: this.toSafeInt(data.students?.total),
        active: this.toSafeInt(data.students?.active),
        newThisMonth: this.toSafeInt(data.students?.newThisMonth),
      },
      documents: {
        total: this.toSafeInt(data.documents?.total),
        pending: this.toSafeInt(data.documents?.pending),
      },
      visas: {
        expiringIn90Days: this.toSafeInt(data.visas?.expiringIn90Days),
        expired: this.toSafeInt(data.visas?.expired),
      },
      payments: {
        pending: this.toSafeInt(data.payments?.pending),
        overdue: this.toSafeInt(data.payments?.overdue),
        totalAmount: this.toSafeNumber(data.payments?.totalAmount),
      },
      events: {
        next7Days: this.toSafeInt(data.events?.next7Days),
        total: this.toSafeInt(data.events?.total),
      },
      users: data.users ? { total: this.toSafeInt(data.users.total) } : undefined,
    };
  }

  private toSafeInt(v: unknown): number {
    const n = Number(v);
    return Number.isFinite(n) && n >= 0 ? Math.floor(n) : 0;
  }

  private toSafeNumber(v: unknown): number {
    const n = Number(v);
    return Number.isFinite(n) && n >= 0 ? n : 0;
  }

  safeNumber(v: unknown): number | string {
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
