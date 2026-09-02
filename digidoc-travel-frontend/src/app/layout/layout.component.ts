import { Component, computed } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../auth/services/auth.service';
import { ToastComponent } from '../shared/components/toast.component';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, CommonModule, ToastComponent],
  template: `
    <app-toast></app-toast>
    <div style="display:flex; min-height:100vh; font-family: var(--font-sans);">
      <nav style="width:260px; background:#1e293b; color:white; padding:20px; display:flex; flex-direction:column;">
        <h2 style="margin:0 0 20px; display:flex; align-items:center; gap:10px;"><i class="fa-solid fa-plane-departure" style="color:var(--sl-orange-500)"></i> DigiDoc Travel</h2>
        <a routerLink="/dashboard" routerLinkActive="active" style="color:white; padding:8px 0; text-decoration:none; display:flex; align-items:center; gap:10px;"><i class="fa-solid fa-chart-line w-5 text-center"></i> Dashboard</a>
        <a *ngIf="canAccessUsers()" routerLink="/users" routerLinkActive="active" style="color:white; padding:8px 0; text-decoration:none; display:flex; align-items:center; gap:10px;"><i class="fa-solid fa-users w-5 text-center"></i> Usuarios (Admin)</a>
        <a routerLink="/students" routerLinkActive="active" style="color:white; padding:8px 0; text-decoration:none; display:flex; align-items:center; gap:10px;"><i class="fa-solid fa-graduation-cap w-5 text-center"></i> Estudiantes</a>
        <a routerLink="/documents" routerLinkActive="active" style="color:white; padding:8px 0; text-decoration:none; display:flex; align-items:center; gap:10px;"><i class="fa-solid fa-file-lines w-5 text-center"></i> Documentos</a>
        <a routerLink="/visas" routerLinkActive="active" style="color:white; padding:8px 0; text-decoration:none; display:flex; align-items:center; gap:10px;"><i class="fa-solid fa-passport w-5 text-center"></i> Visas</a>
        <a routerLink="/payments" routerLinkActive="active" style="color:white; padding:8px 0; text-decoration:none; display:flex; align-items:center; gap:10px;"><i class="fa-solid fa-credit-card w-5 text-center"></i> Pagos</a>
        <a routerLink="/events" routerLinkActive="active" style="color:white; padding:8px 0; text-decoration:none; display:flex; align-items:center; gap:10px;"><i class="fa-solid fa-calendar-days w-5 text-center"></i> Eventos</a>
        <a routerLink="/notifications" routerLinkActive="active" style="color:white; padding:8px 0; text-decoration:none; display:flex; align-items:center; gap:10px;"><i class="fa-solid fa-bell w-5 text-center"></i> Notificaciones</a>
        <a *ngIf="canAccessReports()" routerLink="/reports" routerLinkActive="active" style="color:white; padding:8px 0; text-decoration:none; display:flex; align-items:center; gap:10px;"><i class="fa-solid fa-chart-bar w-5 text-center"></i> Reportes (Admin/Sup)</a>
        <div style="margin-top:auto; padding-top:20px; border-top:1px solid #334155;">
          <div style="font-size:12px; color:#94a3b8; display:flex; align-items:center; gap:6px;"><i class="fa-solid fa-user-shield"></i> Rol: {{auth.user()?.roles?.[0]?.name || 'usuario'}}</div>
          <div style="font-size:14px; margin-top:4px; display:flex; align-items:center; gap:6px;"><i class="fa-solid fa-envelope" style="font-size:12px; color:#94a3b8"></i> {{auth.user()?.email}}</div>
          <button (click)="auth.logout()" style="margin-top:12px; background:#ef4444; color:white; border:none; padding:8px 12px; border-radius:6px; cursor:pointer; width:100%; display:flex; align-items:center; justify-content:center; gap:8px;"><i class="fa-solid fa-right-from-bracket"></i> Cerrar sesión</button>
        </div>
      </nav>
      <main style="flex:1; background:#f8fafc; padding:24px;">
        <router-outlet></router-outlet>
      </main>
    </div>
  `,
  styles: [`.active{ font-weight:600; background:#334155; padding-left:8px; border-radius:4px; } .w-5{width:1.25rem} .text-center{text-align:center}`]
})
export class LayoutComponent {
  constructor(public auth: AuthService) {}
  canAccessUsers = computed(() => this.auth.hasRole('admin'));
  canAccessReports = computed(() => this.auth.hasRole('admin') || this.auth.hasRole('supervisor'));
}
