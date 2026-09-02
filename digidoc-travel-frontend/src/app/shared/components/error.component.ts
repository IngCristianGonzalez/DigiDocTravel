import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-error',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div *ngIf="message()" style="padding:12px; background:#fef2f2; border:1px solid #fecaca; color:#dc2626; border-radius:8px; display:flex; justify-content:space-between; align-items:center;">
      <span><i class="fa-solid fa-triangle-exclamation" style="margin-right:8px;"></i> {{ message() }}</span>
      <button (click)="retry.emit()" style="background:#dc2626; color:white; border:none; padding:6px 12px; border-radius:4px; cursor:pointer; display:flex; align-items:center; gap:6px;"><i class="fa-solid fa-rotate"></i> Reintentar</button>
    </div>
  `
})
export class ErrorComponent {
  message = input<string | null>(null);
  retry = output<void>();
}
