import { Component, computed, signal } from '@angular/core';
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
    <div class="layout">
      <nav class="sidebar" [class.sidebar--collapsed]="collapsed()">
        <div class="sidebar__top">
          <h2 class="sidebar__brand"><i class="fa-solid fa-plane-departure"></i> <span class="brand-label">DigiDoc Travel</span></h2>
          <button class="collapse-btn" (click)="collapsed.set(!collapsed())" [attr.aria-label]="collapsed() ? 'Expandir menú' : 'Colapsar menú'" [title]="collapsed() ? 'Expandir' : 'Colapsar'">
            <i class="fa-solid" [class.fa-chevron-left]="!collapsed()" [class.fa-chevron-right]="collapsed()"></i>
          </button>
        </div>

        <!-- Dashboard directo -->
        <a routerLink="/dashboard" routerLinkActive="active" class="nav-link" [title]="collapsed() ? 'Dashboard' : ''">
          <i class="fa-solid fa-chart-line w-5 text-center"></i> <span class="nav-label">Dashboard</span>
        </a>

        <!-- Acordeón: Académico -->
        <div class="accordion">
          <button class="accordion__header" (click)="toggle('academico')" [class.accordion__header--open]="isOpen('academico')" [title]="collapsed() ? 'Académico' : ''">
            <span><i class="fa-solid fa-graduation-cap"></i> <span class="accordion-label">Académico</span></span>
            <i class="fa-solid fa-chevron-down accordion__chevron" [class.accordion__chevron--open]="isOpen('academico')"></i>
          </button>
          @if (isOpen('academico')) {
            <div class="accordion__body">
              <a routerLink="/students" routerLinkActive="active" class="nav-link nav-link--sub" [title]="collapsed() ? 'Estudiantes' : ''">
                <i class="fa-solid fa-users w-5 text-center"></i> <span class="nav-label">Estudiantes</span>
              </a>
              <a routerLink="/documents" routerLinkActive="active" class="nav-link nav-link--sub" [title]="collapsed() ? 'Documentos' : ''">
                <i class="fa-solid fa-file-lines w-5 text-center"></i> <span class="nav-label">Documentos</span>
              </a>
              <a routerLink="/visas" routerLinkActive="active" class="nav-link nav-link--sub" [title]="collapsed() ? 'Visas' : ''">
                <i class="fa-solid fa-passport w-5 text-center"></i> <span class="nav-label">Visas</span>
              </a>
            </div>
          }
        </div>

        <!-- Acordeón: Operativo -->
        <div class="accordion">
          <button class="accordion__header" (click)="toggle('operativo')" [class.accordion__header--open]="isOpen('operativo')" [title]="collapsed() ? 'Operativo' : ''">
            <span><i class="fa-solid fa-briefcase"></i> <span class="accordion-label">Operativo</span></span>
            <i class="fa-solid fa-chevron-down accordion__chevron" [class.accordion__chevron--open]="isOpen('operativo')"></i>
          </button>
          @if (isOpen('operativo')) {
            <div class="accordion__body">
              <a routerLink="/payments" routerLinkActive="active" class="nav-link nav-link--sub" [title]="collapsed() ? 'Pagos' : ''">
                <i class="fa-solid fa-credit-card w-5 text-center"></i> <span class="nav-label">Pagos</span>
              </a>
              <a routerLink="/events" routerLinkActive="active" class="nav-link nav-link--sub" [title]="collapsed() ? 'Eventos' : ''">
                <i class="fa-solid fa-calendar-days w-5 text-center"></i> <span class="nav-label">Eventos</span>
              </a>
            </div>
          }
        </div>

        <!-- Acordeón: Sistema -->
        <div class="accordion">
          <button class="accordion__header" (click)="toggle('sistema')" [class.accordion__header--open]="isOpen('sistema')" [title]="collapsed() ? 'Sistema' : ''">
            <span><i class="fa-solid fa-gear"></i> <span class="accordion-label">Sistema</span></span>
            <i class="fa-solid fa-chevron-down accordion__chevron" [class.accordion__chevron--open]="isOpen('sistema')"></i>
          </button>
          @if (isOpen('sistema')) {
            <div class="accordion__body">
              <a routerLink="/notifications" routerLinkActive="active" class="nav-link nav-link--sub" [title]="collapsed() ? 'Notificaciones' : ''">
                <i class="fa-solid fa-bell w-5 text-center"></i> <span class="nav-label">Notificaciones</span>
              </a>
              @if (canAccessUsers()) {
                <a routerLink="/users" routerLinkActive="active" class="nav-link nav-link--sub" [title]="collapsed() ? 'Usuarios' : ''">
                  <i class="fa-solid fa-users-gear w-5 text-center"></i> <span class="nav-label">Usuarios (Admin)</span>
                </a>
              }
              @if (canAccessReports()) {
                <a routerLink="/reports" routerLinkActive="active" class="nav-link nav-link--sub" [title]="collapsed() ? 'Reportes' : ''">
                  <i class="fa-solid fa-chart-bar w-5 text-center"></i> <span class="nav-label">Reportes (Admin/Sup)</span>
                </a>
              }
            </div>
          }
        </div>

        <!-- Bloque usuario/rol - más arriba (no margin-top:auto) -->
        <div class="user-block">
          <div class="user-block__role"><i class="fa-solid fa-user-shield"></i> <span class="user-label">Rol: {{auth.user()?.roles?.[0]?.name || 'usuario'}}</span></div>
          <div class="user-block__email"><i class="fa-solid fa-envelope"></i> <span class="user-label">{{auth.user()?.email}}</span></div>
          <button (click)="auth.logout()" class="user-block__logout" [title]="collapsed() ? 'Cerrar sesión' : ''"><i class="fa-solid fa-right-from-bracket"></i> <span class="user-label">Cerrar sesión</span></button>
        </div>

        <div class="sidebar__spacer"></div>
      </nav>
      <main class="main">
        <router-outlet></router-outlet>
      </main>
    </div>
  `,
  styles: [`
    .layout{
      display:flex;
      height:100vh;
      height:100dvh;
      overflow:hidden;
      font-family: var(--font-sans);
      background: var(--sl-gray-100);
    }
    .sidebar{
      width:260px;
      min-width:260px;
      background:#1e293b;
      color:white;
      padding:20px 14px 16px;
      display:flex;
      flex-direction:column;
      gap:2px;
      height:100vh;
      height:100dvh;
      overflow-y:auto;
      overflow-x:hidden;
      flex-shrink:0;
      border-right:1px solid #263449;
      scrollbar-width:thin;
      scrollbar-color:#334155 transparent;
      transition: width 0.28s cubic-bezier(0.4,0,0.2,1), min-width 0.28s cubic-bezier(0.4,0,0.2,1), padding 0.28s ease;
    }
    .sidebar--collapsed{
      width:68px;
      min-width:68px;
      padding:16px 8px;
    }
    .sidebar::-webkit-scrollbar{width:6px}
    .sidebar::-webkit-scrollbar-thumb{background:#334155;border-radius:9999px}
    .sidebar__top{
      display:flex;
      align-items:center;
      justify-content:space-between;
      gap:8px;
      margin-bottom:14px;
    }
    .sidebar__brand{
      margin:0 0 0 4px;
      display:flex;
      align-items:center;
      gap:10px;
      font-size:1.05rem;
      font-weight:700;
      letter-spacing:-0.02em;
      white-space:nowrap;
      flex:1;
      min-width:0;
      overflow:hidden;
    }
    .sidebar__brand i{color:var(--sl-orange-500);flex-shrink:0;font-size:1.05rem;transition: font-size 0.2s ease}
    .brand-label{transition: opacity 0.2s ease, transform 0.2s ease}
    .sidebar--collapsed .brand-label{opacity:0;transform:translateX(-8px);pointer-events:none;width:0;display:none}
    .sidebar--collapsed .sidebar__brand{justify-content:center;margin:0;gap:0}
    .sidebar--collapsed .sidebar__brand i{font-size:0.95rem}
    .collapse-btn{
      width:28px;
      height:28px;
      background:#334155;
      border:1px solid #3b4a5f;
      color:#e2e8f0;
      border-radius:6px;
      display:flex;
      align-items:center;
      justify-content:center;
      cursor:pointer;
      flex-shrink:0;
      transition: background 0.15s ease, transform 0.15s ease;
      font-size:0.75rem;
    }
    .collapse-btn:hover{background:#3b4f6b;color:white}
    .collapse-btn:active{transform:scale(0.95)}
    .sidebar--collapsed .collapse-btn{margin:0 auto}
    .sidebar--collapsed .sidebar__top{justify-content:center;gap:0}
    .nav-link{
      color:#e2e8f0;
      padding:9px 10px;
      text-decoration:none;
      display:flex;
      align-items:center;
      gap:10px;
      border-radius:6px;
      transition: background 0.15s ease, color 0.15s ease, transform 0.12s ease;
      font-size:0.875rem;
      font-weight:500;
      line-height:1.2;
    }
    .nav-link:hover{
      background:#2a3a56; /* más claro que #1e293b */
      color:#ffffff;
    }
    .nav-link:active{transform:scale(0.99)}
    .nav-link.active{
      background:#334155;
      color:#ffffff;
      font-weight:600;
    }
    .nav-link--sub{
      padding-left:22px;
      font-size:0.84rem;
      color:#cbd5e1;
    }
    .nav-link--sub:hover{
      background:#2e405e;
      color:white;
    }
    .accordion{
      display:flex;
      flex-direction:column;
    }
    .accordion__header{
      width:100%;
      background:transparent;
      border:none;
      color:#94a3b8;
      display:flex;
      align-items:center;
      justify-content:space-between;
      padding:12px 8px 6px;
      font-size:0.68rem;
      text-transform:uppercase;
      letter-spacing:0.07em;
      font-weight:700;
      cursor:pointer;
      transition: color 0.15s ease, background 0.15s ease;
      border-radius:6px;
      margin-top:4px;
    }
    .accordion__header:hover{
      color:#e2e8f0;
      background:rgba(255,255,255,0.04);
    }
    .accordion__header--open{color:#e2e8f0}
    .accordion__header span{display:flex;align-items:center;gap:8px}
    .accordion__chevron{
      font-size:0.65rem;
      transition: transform 0.2s ease;
      opacity:0.7;
    }
    .accordion__chevron--open{transform:rotate(180deg);opacity:1}
    .accordion__body{
      display:flex;
      flex-direction:column;
      gap:2px;
      padding:4px 0 6px;
      animation: accordionIn 0.18s ease;
    }
    @keyframes accordionIn{
      from{opacity:0;transform:translateY(-4px)}
      to{opacity:1;transform:translateY(0)}
    }
    .user-block{
      margin-top:18px;
      padding-top:16px;
      border-top:1px solid #334155;
      display:flex;
      flex-direction:column;
      gap:6px;
    }
    .user-block__role{
      font-size:12px;
      color:#94a3b8;
      display:flex;
      align-items:center;
      gap:6px;
    }
    .user-block__email{
      font-size:13px;
      color:#e2e8f0;
      display:flex;
      align-items:center;
      gap:6px;
      word-break:break-all;
      line-height:1.3;
    }
    .user-block__email i{font-size:11px;color:#94a3b8;flex-shrink:0}
    .user-block__logout{
      margin-top:10px;
      background:#ef4444;
      color:white;
      border:none;
      padding:9px 12px;
      border-radius:6px;
      cursor:pointer;
      width:100%;
      display:flex;
      align-items:center;
      justify-content:center;
      gap:8px;
      font-weight:600;
      font-size:0.84rem;
      transition: background 0.15s ease, transform 0.12s ease;
    }
    .user-block__logout:hover{background:#dc2626}
    .user-block__logout:active{transform:scale(0.98)}
    .sidebar__spacer{flex:0 0 8px}
    .main{
      flex:1;
      background:#f8fafc;
      padding:16px 20px 16px;
      height:100vh;
      height:100dvh;
      overflow-y:auto;
      overflow-x:hidden;
      scrollbar-width:thin;
    }
    .main::-webkit-scrollbar{width:8px}
    .main::-webkit-scrollbar-thumb{background:#cbd5e1;border-radius:9999px}
    .w-5{width:1.25rem}
    .text-center{text-align:center}
    /* collapsed: solo iconos */
    .nav-label, .accordion-label, .user-label{transition: opacity 0.2s ease, transform 0.2s ease; white-space:nowrap}
    .sidebar--collapsed .nav-label,
    .sidebar--collapsed .accordion-label,
    .sidebar--collapsed .user-label{opacity:0;transform:translateX(-6px);pointer-events:none;width:0;display:none}
    .sidebar--collapsed .nav-link{justify-content:center;padding:10px 6px;gap:0}
    .sidebar--collapsed .nav-link--sub{padding-left:6px;justify-content:center}
    .sidebar--collapsed .accordion__header{justify-content:center;padding:10px 4px}
    .sidebar--collapsed .accordion__header span{justify-content:center}
    .sidebar--collapsed .accordion__chevron{display:none}
    .sidebar--collapsed .accordion__body{padding:2px 0}
    .sidebar--collapsed .user-block{padding-top:12px;align-items:center}
    .sidebar--collapsed .user-block__role,
    .sidebar--collapsed .user-block__email{justify-content:center}
    .sidebar--collapsed .user-block__logout{padding:8px;width:36px;height:36px;justify-content:center}
    .sidebar--collapsed .user-block__logout .user-label{display:none}
    @media (max-width: 768px){
      .sidebar{position:fixed;left:0;top:0;z-index:40;transform:translateX(0)}
      .sidebar--collapsed{transform:translateX(-100%);width:260px;min-width:260px}
      .main{padding:12px}
    }
  `]
})
export class LayoutComponent {
  constructor(public auth: AuthService) {}
  canAccessUsers = computed(() => this.auth.hasRole('admin'));
  canAccessReports = computed(() => this.auth.hasRole('admin') || this.auth.hasRole('supervisor'));

  openSections = signal<Set<string>>(new Set(['academico','operativo','sistema']));
  collapsed = signal(false);

  toggle(section: string) {
    const s = new Set(this.openSections());
    if (s.has(section)) s.delete(section);
    else s.add(section);
    this.openSections.set(s);
  }
  isOpen(section: string) {
    return this.openSections().has(section);
  }
}
