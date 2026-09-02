import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { DashboardService } from './dashboard.service';
import { DashboardSummary } from '../../shared/interfaces/api.interface';
import { LoadingComponent } from '../../shared/components/loading.component';
import { ErrorComponent } from '../../shared/components/error.component';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, LoadingComponent, ErrorComponent],
  template: `
    <div class="max-w-7xl mx-auto space-y-6">
      <!-- Header -->
      <div class="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
        <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 bg-slate-900 rounded-xl flex items-center justify-center text-white">
              <i class="fa-solid fa-chart-line text-lg"></i>
            </div>
            <div>
              <h1 class="text-2xl font-bold text-slate-900 tracking-tight">Dashboard</h1>
              <p class="text-sm text-slate-500 mt-0.5">Panel de control — Indicadores RF-051 a RF-056</p>
            </div>
          </div>
          <div class="flex items-center gap-3">
            <span class="hidden sm:flex items-center gap-2 text-xs text-slate-500 bg-slate-50 border border-slate-200 rounded-full px-3 py-1.5">
              <i class="fa-solid fa-clock"></i> Actualizado ahora
            </span>
            <button (click)="load()" [disabled]="loading()" class="inline-flex items-center gap-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50">
              <i class="fa-solid fa-rotate" [class.fa-spin]="loading()"></i> Recargar
            </button>
            <a routerLink="/reports" class="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
              <i class="fa-solid fa-file-chart-column"></i> Ver reportes
            </a>
          </div>
        </div>
        <!-- Quick stats bar -->
        <div *ngIf="!loading() && summary() as s" class="mt-6 grid grid-cols-2 lg:grid-cols-4 gap-3 pt-6 border-t border-slate-100">
          <div class="flex items-center gap-3 bg-slate-50 rounded-lg px-4 py-3">
            <div class="w-8 h-8 bg-white border border-slate-200 rounded-lg flex items-center justify-center text-slate-600"><i class="fa-solid fa-users text-xs"></i></div>
            <div><p class="text-xs text-slate-500 uppercase tracking-wide font-medium">Usuarios</p><p class="text-sm font-bold text-slate-900">{{ safeNumber(s.users?.total) }}</p></div>
          </div>
          <div class="flex items-center gap-3 bg-sky-50 rounded-lg px-4 py-3">
            <div class="w-8 h-8 bg-white border border-sky-200 rounded-lg flex items-center justify-center text-sky-600"><i class="fa-solid fa-graduation-cap text-xs"></i></div>
            <div><p class="text-xs text-slate-500 uppercase tracking-wide font-medium">Estudiantes</p><p class="text-sm font-bold text-slate-900">{{ safeNumber(s.students.total) }}</p></div>
          </div>
          <div class="flex items-center gap-3 bg-amber-50 rounded-lg px-4 py-3">
            <div class="w-8 h-8 bg-white border border-amber-200 rounded-lg flex items-center justify-center text-amber-600"><i class="fa-solid fa-file-lines text-xs"></i></div>
            <div><p class="text-xs text-slate-500 uppercase tracking-wide font-medium">Documentos</p><p class="text-sm font-bold text-slate-900">{{ safeNumber(s.documents.total) }}</p></div>
          </div>
          <div class="flex items-center gap-3 bg-emerald-50 rounded-lg px-4 py-3">
            <div class="w-8 h-8 bg-white border border-emerald-200 rounded-lg flex items-center justify-center text-emerald-600"><i class="fa-solid fa-calendar-days text-xs"></i></div>
            <div><p class="text-xs text-slate-500 uppercase tracking-wide font-medium">Eventos</p><p class="text-sm font-bold text-slate-900">{{ safeNumber(s.events.total) }}</p></div>
          </div>
        </div>
      </div>

      <!-- Loading / Error -->
      <app-loading [show]="loading()" message="Cargando resumen del dashboard..."></app-loading>
      <app-error [message]="error()" (retry)="load()"></app-error>

      <!-- Skeleton -->
      <div *ngIf="loading()" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div *ngFor="let i of [1,2,3,4,5,6]" class="bg-white p-6 rounded-xl shadow-sm border border-slate-200 animate-pulse">
          <div class="flex items-center gap-4 mb-4">
            <div class="w-12 h-12 bg-slate-200 rounded-xl"></div>
            <div class="flex-1 space-y-2"><div class="h-4 bg-slate-200 rounded w-3/4"></div><div class="h-3 bg-slate-100 rounded w-1/2"></div></div>
          </div>
          <div class="h-8 bg-slate-200 rounded w-1/3 mb-2"></div><div class="h-3 bg-slate-100 rounded w-2/3"></div>
        </div>
      </div>

      <!-- KPIs Grid -->
      <div *ngIf="!loading() && summary() as s" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <!-- RF-051 Indicadores Generales -->
        <div class="bg-white rounded-xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow group">
          <div class="flex items-center justify-between mb-4">
            <span class="text-xs font-semibold text-slate-500 uppercase tracking-wider">Indicadores Generales</span>
            <span class="text-[11px] bg-slate-900 text-white px-2.5 py-1 rounded-full font-medium">RF-051</span>
          </div>
          <div class="flex items-start gap-4">
            <div class="w-12 h-12 bg-indigo-50 border border-indigo-100 rounded-xl flex items-center justify-center text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white group-hover:border-indigo-600 transition-colors">
              <i class="fa-solid fa-chart-pie text-lg"></i>
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-3xl font-bold text-slate-900 tracking-tight">{{ safeNumber(s.users?.total) }}</p>
              <p class="text-sm text-slate-500 mt-0.5">Total usuarios registrados</p>
              <div class="mt-3 flex items-center gap-2 text-xs">
                <span class="inline-flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-full px-2.5 py-1"><i class="fa-solid fa-users text-slate-400 text-[11px]"></i> {{ safeNumber(s.students.active) }} activos</span>
                <span class="text-slate-400">/</span>
                <span class="text-slate-600">{{ safeNumber(s.students.total) }} estudiantes</span>
              </div>
            </div>
          </div>
          <div class="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
            <a routerLink="/users" class="text-xs font-medium text-indigo-600 hover:text-indigo-700 flex items-center gap-1">Ver usuarios <i class="fa-solid fa-arrow-right text-[11px]"></i></a>
            <span class="text-xs text-slate-400">Sistema</span>
          </div>
        </div>

        <!-- RF-052 Estudiantes Activos -->
        <div class="bg-white rounded-xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow group">
          <div class="flex items-center justify-between mb-4">
            <span class="text-xs font-semibold text-slate-500 uppercase tracking-wider">Estudiantes Activos</span>
            <span class="text-[11px] bg-sky-600 text-white px-2.5 py-1 rounded-full font-medium">RF-052</span>
          </div>
          <div class="flex items-start gap-4">
            <div class="w-12 h-12 bg-sky-50 border border-sky-100 rounded-xl flex items-center justify-center text-sky-600 group-hover:bg-sky-600 group-hover:text-white group-hover:border-sky-600 transition-colors">
              <i class="fa-solid fa-graduation-cap text-lg"></i>
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-3xl font-bold text-slate-900 tracking-tight">{{ safeNumber(s.students.active) }} <span class="text-lg font-medium text-slate-400">/ {{ safeNumber(s.students.total) }}</span></p>
              <p class="text-sm text-slate-500 mt-0.5">Activos / Totales</p>
              <div class="mt-3 flex items-center gap-2">
                <span class="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                <span class="text-xs text-slate-600">Nuevos este mes:</span>
                <span class="text-xs font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 rounded-full px-2 py-0.5">+{{ safeNumber(s.students.newThisMonth) }}</span>
              </div>
            </div>
          </div>
          <div class="mt-4">
            <div class="flex justify-between text-[11px] text-slate-500 mb-1.5"><span>Progreso</span><span class="font-medium text-slate-700">{{ getStudentsProgress(s) }}%</span></div>
            <div class="w-full bg-slate-100 rounded-full h-2 overflow-hidden"><div class="bg-sky-600 h-2 rounded-full transition-all duration-500" [style.width.%]="getStudentsProgress(s)"></div></div>
          </div>
          <a routerLink="/students" class="mt-4 flex items-center gap-1 text-xs font-medium text-sky-600 hover:text-sky-700">Gestionar estudiantes <i class="fa-solid fa-arrow-right text-[11px]"></i></a>
        </div>

        <!-- RF-053 Documentos Pendientes -->
        <div class="bg-white rounded-xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow group">
          <div class="flex items-center justify-between mb-4">
            <span class="text-xs font-semibold text-slate-500 uppercase tracking-wider">Documentos Pendientes</span>
            <span class="text-[11px] bg-amber-500 text-white px-2.5 py-1 rounded-full font-medium">RF-053</span>
          </div>
          <div class="flex items-start gap-4">
            <div class="w-12 h-12 rounded-xl flex items-center justify-center border transition-colors" [ngClass]="s.documents.pending > 0 ? 'bg-amber-50 border-amber-200 text-amber-600 group-hover:bg-amber-500 group-hover:text-white group-hover:border-amber-500' : 'bg-emerald-50 border-emerald-200 text-emerald-600'">
              <i class="fa-solid text-lg" [ngClass]="s.documents.pending > 0 ? 'fa-file-circle-exclamation' : 'fa-file-circle-check'"></i>
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-3xl font-bold tracking-tight" [ngClass]="s.documents.pending > 0 ? 'text-amber-600' : 'text-emerald-600'">{{ safeNumber(s.documents.pending) }}</p>
              <p class="text-sm text-slate-500 mt-0.5">Pendientes por revisar</p>
              <p class="text-xs text-slate-400 mt-1">Total: <span class="font-semibold text-slate-700">{{ safeNumber(s.documents.total) }}</span> documentos</p>
            </div>
          </div>
          <div class="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
            <span class="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border" [ngClass]="s.documents.pending > 0 ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'">
              <i class="fa-solid text-[11px]" [ngClass]="s.documents.pending > 0 ? 'fa-triangle-exclamation' : 'fa-circle-check'"></i> {{ s.documents.pending > 0 ? 'Requiere atención' : 'Al día' }}
            </span>
            <a routerLink="/documents" class="text-xs font-medium text-slate-600 hover:text-slate-900 flex items-center gap-1">Ver documentos <i class="fa-solid fa-arrow-right text-[11px]"></i></a>
          </div>
        </div>

        <!-- RF-054 Visas por vencer -->
        <div class="bg-white rounded-xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow group">
          <div class="flex items-center justify-between mb-4">
            <span class="text-xs font-semibold text-slate-500 uppercase tracking-wider">Visas por Vencer</span>
            <span class="text-[11px] bg-orange-600 text-white px-2.5 py-1 rounded-full font-medium">RF-054</span>
          </div>
          <div class="flex items-start gap-4">
            <div class="w-12 h-12 bg-orange-50 border border-orange-100 rounded-xl flex items-center justify-center text-orange-600 group-hover:bg-orange-600 group-hover:text-white group-hover:border-orange-600 transition-colors">
              <i class="fa-solid fa-passport text-lg"></i>
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-3xl font-bold text-orange-600 tracking-tight">{{ safeNumber(s.visas.expiringIn90Days) }}</p>
              <p class="text-sm text-slate-500 mt-0.5">Expiran en 90 días</p>
              <div class="mt-3 flex items-center gap-2 text-xs">
                <span class="text-slate-500">Vencidas:</span>
                <span class="font-bold px-2 py-0.5 rounded-full border text-[11px]" [ngClass]="s.visas.expired > 0 ? 'bg-red-50 text-red-700 border-red-200' : 'bg-slate-50 text-slate-600 border-slate-200'">{{ safeNumber(s.visas.expired) }}</span>
              </div>
            </div>
          </div>
          <div class="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
            <span *ngIf="s.visas.expired > 0" class="inline-flex items-center gap-1.5 bg-red-50 text-red-700 border border-red-200 px-2.5 py-1 rounded-full text-xs font-medium"><i class="fa-solid fa-circle-exclamation text-[11px]"></i> Acción requerida</span>
            <span *ngIf="s.visas.expired === 0 && s.visas.expiringIn90Days === 0" class="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-1 rounded-full text-xs font-medium"><i class="fa-solid fa-shield-halved text-[11px]"></i> Sin alertas</span>
            <span *ngIf="s.visas.expired === 0 && s.visas.expiringIn90Days > 0" class="inline-flex items-center gap-1.5 bg-amber-50 text-amber-700 border border-amber-200 px-2.5 py-1 rounded-full text-xs font-medium"><i class="fa-solid fa-clock text-[11px]"></i> Seguimiento</span>
            <a routerLink="/visas" class="text-xs font-medium text-orange-600 hover:text-orange-700 flex items-center gap-1">Ver visas <i class="fa-solid fa-arrow-right text-[11px]"></i></a>
          </div>
        </div>

        <!-- RF-055 Pagos Pendientes -->
        <div class="bg-white rounded-xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow group">
          <div class="flex items-center justify-between mb-4">
            <span class="text-xs font-semibold text-slate-500 uppercase tracking-wider">Pagos Pendientes</span>
            <span class="text-[11px] bg-red-600 text-white px-2.5 py-1 rounded-full font-medium">RF-055</span>
          </div>
          <div class="flex items-start gap-4">
            <div class="w-12 h-12 rounded-xl flex items-center justify-center border transition-colors" [ngClass]="s.payments.overdue > 0 ? 'bg-red-50 border-red-100 text-red-600 group-hover:bg-red-600 group-hover:text-white group-hover:border-red-600' : 'bg-slate-50 border-slate-200 text-slate-600'">
              <i class="fa-solid fa-credit-card text-lg"></i>
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-3xl font-bold tracking-tight" [ngClass]="s.payments.overdue > 0 ? 'text-red-600' : 'text-slate-900'">{{ safeNumber(s.payments.pending) }}</p>
              <p class="text-sm text-slate-500 mt-0.5">Cuotas pendientes</p>
              <div class="mt-2 space-y-1">
                <div class="flex justify-between text-xs"><span class="text-slate-500 flex items-center gap-1"><i class="fa-solid fa-triangle-exclamation text-red-400 text-[11px]"></i> Atrasados</span><span class="font-bold" [ngClass]="s.payments.overdue > 0 ? 'text-red-600' : 'text-slate-700'">{{ safeNumber(s.payments.overdue) }}</span></div>
                <div class="flex justify-between text-xs"><span class="text-slate-500 flex items-center gap-1"><i class="fa-solid fa-dollar-sign text-slate-400 text-[11px]"></i> Monto total</span><span class="font-semibold text-slate-900">\${{ safeNumber(s.payments.totalAmount) | number:'1.0-0' }}</span></div>
              </div>
            </div>
          </div>
          <div class="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
            <span class="text-xs text-slate-500">{{ s.payments.overdue > 0 ? 'Requiere cobro' : 'Sin atrasos' }}</span>
            <a routerLink="/payments" class="text-xs font-medium text-red-600 hover:text-red-700 flex items-center gap-1">Ver pagos <i class="fa-solid fa-arrow-right text-[11px]"></i></a>
          </div>
        </div>

        <!-- RF-056 Próximos Eventos -->
        <div class="bg-white rounded-xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow group">
          <div class="flex items-center justify-between mb-4">
            <span class="text-xs font-semibold text-slate-500 uppercase tracking-wider">Próximos Eventos</span>
            <span class="text-[11px] bg-emerald-600 text-white px-2.5 py-1 rounded-full font-medium">RF-056</span>
          </div>
          <div class="flex items-start gap-4">
            <div class="w-12 h-12 bg-emerald-50 border border-emerald-100 rounded-xl flex items-center justify-center text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white group-hover:border-emerald-600 transition-colors">
              <i class="fa-solid fa-calendar-days text-lg"></i>
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-3xl font-bold text-slate-900 tracking-tight">{{ safeNumber(s.events.next7Days) }}</p>
              <p class="text-sm text-slate-500 mt-0.5">En los próximos 7 días</p>
              <p class="text-xs text-slate-400 mt-1">Total: <span class="font-semibold text-slate-700">{{ safeNumber(s.events.total) }}</span> eventos</p>
            </div>
          </div>
          <div class="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
            <span *ngIf="s.events.next7Days > 0" class="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-1 rounded-full text-xs font-medium"><i class="fa-solid fa-circle text-[7px] animate-pulse"></i> Próximamente</span>
            <span *ngIf="s.events.next7Days === 0" class="text-xs text-slate-500">Sin eventos cercanos</span>
            <a routerLink="/events" class="text-xs font-medium text-emerald-600 hover:text-emerald-700 flex items-center gap-1">Ver eventos <i class="fa-solid fa-arrow-right text-[11px]"></i></a>
          </div>
        </div>
      </div>

      <!-- Alertas y accesos rápidos -->
      <div *ngIf="!loading() && summary() as s" class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div class="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <h3 class="text-sm font-bold text-slate-900 flex items-center gap-2 mb-4"><i class="fa-solid fa-bell text-amber-500"></i> Centro de alertas</h3>
          <div class="space-y-3">
            <div *ngIf="s.documents.pending > 0" class="flex items-center gap-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <div class="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center text-white shrink-0"><i class="fa-solid fa-file-circle-exclamation text-xs"></i></div>
              <div class="flex-1 min-w-0"><p class="text-sm font-medium text-amber-900">{{ s.documents.pending }} documentos pendientes</p><p class="text-xs text-amber-700">Requieren revisión</p></div>
              <a routerLink="/documents" class="text-xs font-medium text-amber-700 hover:text-amber-800">Revisar <i class="fa-solid fa-chevron-right text-[10px]"></i></a>
            </div>
            <div *ngIf="s.visas.expired > 0" class="flex items-center gap-3 p-3 bg-red-50 border border-red-200 rounded-lg">
              <div class="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center text-white shrink-0"><i class="fa-solid fa-passport text-xs"></i></div>
              <div class="flex-1 min-w-0"><p class="text-sm font-medium text-red-900">{{ s.visas.expired }} visas vencidas</p><p class="text-xs text-red-700">Acción inmediata requerida</p></div>
              <a routerLink="/visas" class="text-xs font-medium text-red-700 hover:text-red-800">Gestionar <i class="fa-solid fa-chevron-right text-[10px]"></i></a>
            </div>
            <div *ngIf="s.payments.overdue > 0" class="flex items-center gap-3 p-3 bg-red-50 border border-red-200 rounded-lg">
              <div class="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center text-white shrink-0"><i class="fa-solid fa-credit-card text-xs"></i></div>
              <div class="flex-1 min-w-0"><p class="text-sm font-medium text-slate-900">{{ s.payments.overdue }} pagos atrasados</p><p class="text-xs text-slate-600">\${{ s.payments.totalAmount | number:'1.0-0' }} por cobrar</p></div>
              <a routerLink="/payments" class="text-xs font-medium text-slate-700 hover:text-slate-900">Cobrar <i class="fa-solid fa-chevron-right text-[10px]"></i></a>
            </div>
            <div *ngIf="s.documents.pending === 0 && s.visas.expired === 0 && s.payments.overdue === 0" class="flex flex-col items-center justify-center py-8 text-center">
              <div class="w-12 h-12 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-center text-emerald-600 mb-3"><i class="fa-solid fa-circle-check text-xl"></i></div>
              <p class="text-sm font-medium text-slate-700">Todo al día</p><p class="text-xs text-slate-500 mt-1">No hay alertas pendientes</p>
            </div>
          </div>
        </div>
        <div class="bg-slate-900 rounded-xl p-6 text-white shadow-sm">
          <h3 class="text-sm font-bold flex items-center gap-2"><i class="fa-solid fa-bolt text-amber-400"></i> Accesos rápidos</h3>
          <p class="text-xs text-slate-400 mt-1">Operaciones frecuentes</p>
          <div class="mt-4 grid grid-cols-2 gap-3">
            <a routerLink="/students" class="bg-white/10 hover:bg-white/15 border border-white/10 rounded-lg p-3 flex flex-col items-center gap-2 text-center transition-colors">
              <i class="fa-solid fa-user-plus text-amber-400"></i><span class="text-xs font-medium">Nuevo estudiante</span>
            </a>
            <a routerLink="/documents" class="bg-white/10 hover:bg-white/15 border border-white/10 rounded-lg p-3 flex flex-col items-center gap-2 text-center transition-colors">
              <i class="fa-solid fa-file-arrow-up text-sky-400"></i><span class="text-xs font-medium">Subir documento</span>
            </a>
            <a routerLink="/payments" class="bg-white/10 hover:bg-white/15 border border-white/10 rounded-lg p-3 flex flex-col items-center gap-2 text-center transition-colors">
              <i class="fa-solid fa-money-bill-wave text-emerald-400"></i><span class="text-xs font-medium">Registrar pago</span>
            </a>
            <a routerLink="/events" class="bg-white/10 hover:bg-white/15 border border-white/10 rounded-lg p-3 flex flex-col items-center gap-2 text-center transition-colors">
              <i class="fa-solid fa-calendar-plus text-orange-400"></i><span class="text-xs font-medium">Crear evento</span>
            </a>
          </div>
          <a routerLink="/reports" class="mt-4 flex items-center justify-center gap-2 bg-white text-slate-900 hover:bg-slate-100 rounded-lg py-2.5 text-sm font-semibold transition-colors"><i class="fa-solid fa-chart-bar"></i> Ver reportes completos</a>
        </div>
      </div>

      <!-- Estado vacío -->
      <div *ngIf="!loading() && !error() && !summary()" class="bg-white p-12 rounded-xl shadow-sm border border-slate-200 text-center">
        <div class="w-16 h-16 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-center text-slate-400 mx-auto mb-4"><i class="fa-solid fa-inbox text-2xl"></i></div>
        <p class="text-slate-700 font-semibold">No hay datos disponibles</p>
        <p class="text-sm text-slate-400 mt-1">Intenta recargar el dashboard</p>
        <button (click)="load()" class="mt-4 inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-colors"><i class="fa-solid fa-rotate"></i> Recargar</button>
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

  private sanitizeString(value: string): string {
    if (!value || typeof value !== 'string') return '';
    return value.replace(/<[^>]*>/g, '').replace(/[<>]/g, '').replace(/\.\./g, '').replace(/[\/\\]/g, '').trim().slice(0, 500);
  }

  private sanitizeSummary(data: DashboardSummary): DashboardSummary {
    return {
      students: { total: this.toSafeInt(data.students?.total), active: this.toSafeInt(data.students?.active), newThisMonth: this.toSafeInt(data.students?.newThisMonth) },
      documents: { total: this.toSafeInt(data.documents?.total), pending: this.toSafeInt(data.documents?.pending) },
      visas: { expiringIn90Days: this.toSafeInt(data.visas?.expiringIn90Days), expired: this.toSafeInt(data.visas?.expired) },
      payments: { pending: this.toSafeInt(data.payments?.pending), overdue: this.toSafeInt(data.payments?.overdue), totalAmount: this.toSafeNumber(data.payments?.totalAmount) },
      events: { next7Days: this.toSafeInt(data.events?.next7Days), total: this.toSafeInt(data.events?.total) },
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
