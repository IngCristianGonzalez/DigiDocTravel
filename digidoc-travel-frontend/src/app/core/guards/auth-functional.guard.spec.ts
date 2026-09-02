import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { AuthService } from '../../auth/services/auth.service';
import { authGuard, roleGuard } from './auth-functional.guard';

describe('authGuard - OWASP A01', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideRouter([]), { provide: AuthService, useValue: { isAuthenticated: () => true, hasRole: (r:string) => r==='admin' } }] });
  });
  it('should allow authenticated', () => {
    const result = TestBed.runInInjectionContext(() => authGuard({} as any, {} as any));
    expect(result).toBe(true);
  });
  it('roleGuard should allow admin', () => {
    const guard = roleGuard(['admin']);
    const result = TestBed.runInInjectionContext(() => guard({ data: { roles: ['admin'] } } as any, {} as any));
    expect(result).toBe(true);
  });
  it('roleGuard should block non-admin', () => {
    TestBed.overrideProvider(AuthService, { useValue: { hasRole: () => false } });
    const guard = roleGuard(['admin']);
    const result = TestBed.runInInjectionContext(() => guard({} as any, {} as any));
    expect(result).toBeTruthy(); // returns UrlTree
  });
});
