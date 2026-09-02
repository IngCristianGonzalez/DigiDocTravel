import { TestBed } from '@angular/core/testing';
import { ToastService } from './toast.service';

describe('ToastService - Shared', () => {
  let service: ToastService;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [ToastService] });
    service = TestBed.inject(ToastService);
  });

  it('should be created', () => expect(service).toBeTruthy());

  it('should show success toast', () => {
    service.success('Operación exitosa');
    expect(service.toasts().length).toBe(1);
    expect(service.toasts()[0].type).toBe('success');
    expect(service.toasts()[0].message).toBe('Operación exitosa');
  });

  it('should show error toast', () => {
    service.error('Error');
    expect(service.toasts()[0].type).toBe('error');
  });

  it('should show warning for rate limit (OWASP A07)', () => {
    service.warning('Demasiadas solicitudes. Intenta de nuevo en 15 minutos. (OWASP Rate Limit)');
    expect(service.toasts()[0].type).toBe('warning');
    expect(service.toasts()[0].message).toContain('Demasiadas solicitudes');
  });

  it('should dismiss toast', () => {
    service.info('test');
    const id = service.toasts()[0].id;
    service.dismiss(id);
    expect(service.toasts().length).toBe(0);
  });

  it('should auto-dismiss after 4s (async)', async () => {
    vi.useFakeTimers();
    service.info('auto');
    expect(service.toasts().length).toBe(1);
    vi.advanceTimersByTime(4000);
    expect(service.toasts().length).toBe(0);
    vi.useRealTimers();
  });
});
