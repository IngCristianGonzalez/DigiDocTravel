import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div style="position:fixed; top:16px; right:16px; z-index:9999; display:flex; flex-direction:column; gap:8px;">
      <div *ngFor="let t of toast.toasts()" [style.background]="bg(t.type)" style="color:white; padding:12px 16px; border-radius:8px; box-shadow:0 4px 6px rgba(0,0,0,0.1); min-width:300px; display:flex; justify-content:space-between; align-items:center;">
        <span style="display:flex; align-items:center; gap:8px;"><i [class]="icon(t.type)"></i> {{ t.message }}</span>
        <button (click)="toast.dismiss(t.id)" style="background:transparent; border:none; color:white; cursor:pointer; margin-left:12px;"><i class="fa-solid fa-xmark"></i></button>
      </div>
    </div>
  `
})
export class ToastComponent {
  constructor(public toast: ToastService) {}
  bg(type: string) {
    return type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : type === 'warning' ? '#f59e0b' : '#0ea5e9';
  }
  icon(type: string) {
    return type === 'success' ? 'fa-solid fa-circle-check' : type === 'error' ? 'fa-solid fa-circle-xmark' : type === 'warning' ? 'fa-solid fa-triangle-exclamation' : 'fa-solid fa-circle-info';
  }
}
