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
    <div style="display:flex; min-height:100vh; font-family: sans-serif;">
      <nav style="width:260px; background:#1e293b; color:white; padding:20px; display:flex; flex-direction:column;">
        <h2 style="margin:0 0 20px;">DigiDoc Travel</h2>
        <a routerLink="/dashboard" routerLinkActive="active" style="color:white; padding:8px 0; text-decoration:none;">📊 Dashboard</a>
        <a *ngIf="canAccessUsers()" routerLink="/users" routerLinkActive="active" style="color:white; padding:8px 0; text-decoration:none;">👥 Usuarios (Admin)</a>
        <a routerLink="/students" routerLinkActive="active" style="color:white; padding:8px 0; text-decoration:none;">🎓 Estudiantes</a>
        <a routerLink="/documents" routerLinkActive="active" style="color:white; padding:8px 0; text-decoration:none;">📄 Documentos</a>
        <a routerLink="/visas" routerLinkActive="active" style="color:white; padding:8px 0; text-decoration:none;">🛂 Visas</a>
        <a routerLink="/payments" routerLinkActive="active" style="color:white; padding:8px 0; text-decoration:none;">💳 Pagos</a>
        <a routerLink="/events" routerLinkActive="active" style="color:white; padding:8px 0; text-decoration:none;">📅 Eventos</a>
        <a routerLink="/notifications" routerLinkActive="active" style="color:white; padding:8px 0; text-decoration:none;">🔔 Notificaciones</a>
        <a *ngIf="canAccessReports()" routerLink="/reports" routerLinkActive="active" style="color:white; padding:8px 0; text-decoration:none;">📈 Reportes (Admin/Sup)</a>
        <div style="margin-top:auto; padding-top:20px; border-top:1px solid #334155;">
          <div style="font-size:12px; color:#94a3b8;">Rol: {{auth.user()?.roles?.[0]?.name || 'usuario'}}</div>
          <div style="font-size:14px; margin-top:4px;">{{auth.user()?.email}}</div>
          <button (click)="auth.logout()" style="margin-top:8px; background:#ef4444; color:white; border:none; padding:8px 12px; border-radius:6px; cursor:pointer; width:100%;">Cerrar sesión</button>
        </div>
      </nav>
      <main style="flex:1; background:#f8fafc; padding:24px;">
        <router-outlet></router-outlet>
      </main>
    </div>
  `,
  styles: [`.active{ font-weight:bold; background:#334155; padding-left:8px; border-radius:4px; }`]
})
export class LayoutComponent {
  constructor(public auth: AuthService) {}
  canAccessUsers = computed(() => this.auth.hasRole('admin'));
  canAccessReports = computed(() => this.auth.hasRole('admin') || this.auth.hasRole('supervisor'));
}
