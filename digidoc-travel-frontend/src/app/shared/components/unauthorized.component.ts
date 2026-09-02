import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-unauthorized',
  standalone: true,
  imports: [RouterLink],
  template: `<div style="padding:40px; text-align:center;"><h1>403 - No autorizado</h1><p>No tienes permisos para acceder a este recurso.</p><a routerLink="/dashboard">Volver al dashboard</a></div>`
})
export class UnauthorizedComponent {}
