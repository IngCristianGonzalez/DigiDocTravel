import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-loading',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div *ngIf="show()" style="display:flex; align-items:center; gap:8px; padding:12px; background:#e0f2fe; border-radius:8px; color:#0369a1;">
      <span style="width:16px; height:16px; border:2px solid #0369a1; border-top-color:transparent; border-radius:50%; display:inline-block; animation:spin 0.6s linear infinite;"></span>
      {{ message() }}
    </div>
    <style>@keyframes spin { to { transform: rotate(360deg); } }</style>
  `
})
export class LoadingComponent {
  show = input.required<boolean>();
  message = input<string>('Cargando...');
}
