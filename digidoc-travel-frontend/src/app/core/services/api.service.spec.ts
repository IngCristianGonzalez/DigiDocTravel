import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { ApiService } from './api.service';

describe('ApiService - Core', () => {
  let service: ApiService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ApiService, provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(ApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should GET with params', () => {
    service.get('/students', { page: 1, limit: 10 }).subscribe(res => {
      expect(res).toEqual({ data: [] });
    });
    const req = httpMock.expectOne(r => r.url.includes('/students') && r.params.get('page') === '1');
    expect(req.request.method).toBe('GET');
    req.flush({ data: [] });
  });

  it('should POST data', () => {
    service.post('/students', { email: 'a@a.com' }).subscribe(res => expect(res).toBeTruthy());
    const req = httpMock.expectOne(r => r.url.includes('/students'));
    expect(req.request.method).toBe('POST');
    expect(req.request.body.email).toBe('a@a.com');
    req.flush({ id: '1' });
  });

  it('should PATCH data', () => {
    service.patch('/students/1', { firstName: 'Juan' }).subscribe();
    const req = httpMock.expectOne(r => r.url.includes('/students/1'));
    expect(req.request.method).toBe('PATCH');
    req.flush({});
  });

  it('should DELETE', () => {
    service.delete('/students/1').subscribe();
    const req = httpMock.expectOne(r => r.url.includes('/students/1'));
    expect(req.request.method).toBe('DELETE');
    req.flush({});
  });

  it('should handle 404 error via interceptor sanitization', () => {
    service.get('/unknown').subscribe({
      error: (err) => expect(err.status).toBe(404),
    });
    const req = httpMock.expectOne(r => r.url.includes('/unknown'));
    req.flush('Not Found', { status: 404, statusText: 'Not Found' });
  });
});
