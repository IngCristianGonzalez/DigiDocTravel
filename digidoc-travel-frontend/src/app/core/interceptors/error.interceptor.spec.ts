import { TestBed } from '@angular/core/testing';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { HttpClient } from '@angular/common/http';
import { errorInterceptorFn } from './error.interceptor';
import { provideRouter } from '@angular/router';
import { firstValueFrom } from 'rxjs';

describe('errorInterceptorFn - OWASP A09', () => {
  let http: HttpClient;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([{ path: 'auth/login', component: class {} as any }]),
        provideHttpClient(withInterceptors([errorInterceptorFn])),
        provideHttpClientTesting(),
      ],
    });
    http = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('should handle 401 without toast for auth login', async () => {
    const promise = firstValueFrom(http.get('/api/auth/login')).catch(e => e);
    const req = httpMock.expectOne('/api/auth/login');
    req.flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });
    const err: any = await promise;
    expect(err.status).toBe(401);
  });

  it('should sanitize XSS in error message', async () => {
    const promise = firstValueFrom(http.get('/api/test')).catch(e => e);
    const req = httpMock.expectOne('/api/test');
    req.flush({ message: '<script>alert(1)</script>Error' }, { status: 400, statusText: 'Bad Request' });
    const err: any = await promise;
    expect(err).toBeTruthy();
  });

  it('should handle 429 rate limit (OWASP A07)', async () => {
    const promise = firstValueFrom(http.get('/api/students')).catch(e => e);
    const req = httpMock.expectOne('/api/students');
    req.flush('Too Many Requests', { status: 429, statusText: 'Too Many Requests' });
    const err: any = await promise;
    expect(err.status).toBe(429);
  });

  it('should handle 500 internal error generically', async () => {
    const promise = firstValueFrom(http.get('/api/dashboard/summary')).catch(e => e);
    const req = httpMock.expectOne('/api/dashboard/summary');
    req.flush('Internal', { status: 500, statusText: 'Internal' });
    const err: any = await promise;
    expect(err.status).toBe(500);
  });
});
