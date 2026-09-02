import { Injectable, signal } from '@angular/core';

export interface Toast { id: number; message: string; type: 'success' | 'error' | 'info' | 'warning'; }

@Injectable({ providedIn: 'root' })
export class ToastService {
  toasts = signal<Toast[]>([]);
  private id = 0;

  show(message: string, type: Toast['type'] = 'info') {
    const toast: Toast = { id: ++this.id, message, type };
    this.toasts.update(v => [...v, toast]);
    setTimeout(() => this.dismiss(toast.id), 4000);
  }

  success(msg: string) { this.show(msg, 'success'); }
  error(msg: string) { this.show(msg, 'error'); }
  warning(msg: string) { this.show(msg, 'warning'); }
  info(msg: string) { this.show(msg, 'info'); }

  dismiss(id: number) {
    this.toasts.update(v => v.filter(t => t.id !== id));
  }
}
