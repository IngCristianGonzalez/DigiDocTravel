import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { ToastService } from '../services/toast.service';

export const errorInterceptorFn: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const toast = inject(ToastService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      // Sanitizar mensaje para evitar XSS
      const raw = error.error?.message || error.message || 'Error desconocido';
      const sanitized = String(raw).replace(/<[^>]*>/g, '').substring(0, 300);

      if (error.status === 401) {
        // No mostrar toast para login, ya lo maneja auth.service
        if (!req.url.includes('/auth/login') && !req.url.includes('/auth/refresh')) {
          toast.error('Sesión expirada. Por favor inicia sesión nuevamente.');
          router.navigate(['/auth/login']);
        }
      } else if (error.status === 403) {
        toast.error('Acceso denegado: ' + sanitized);
      } else if (error.status === 429) {
        toast.warning('Demasiadas solicitudes. Intenta de nuevo en 15 minutos. (OWASP Rate Limit)');
      } else if (error.status >= 500) {
        toast.error('Error interno del servidor. Intenta más tarde.');
      } else if (error.status === 400) {
        // Validación - mostrar primer mensaje
        const msg = Array.isArray(sanitized) ? sanitized[0] : sanitized;
        toast.error(msg);
      }

      // Log para monitoreo (sin exponer stack en prod)
      console.warn(`[HTTP ${error.status}] ${req.method} ${req.url} - ${sanitized}`);

      return throwError(() => error);
    })
  );
};
