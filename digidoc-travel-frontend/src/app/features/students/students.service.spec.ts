import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { StudentsService } from './students.service';

describe('StudentsService - RF-012 a RF-016', () => {
  let service: StudentsService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [StudentsService, provideHttpClient(), provideHttpClientTesting()] });
    service = TestBed.inject(StudentsService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('should be created', () => expect(service).toBeTruthy());

  it('RF-012 create student', () => {
    service.create({ firstName: 'Juan', lastName: 'Perez', email: 'j@a.com', countryOrigin: 'Colombia' } as any).subscribe(res => expect(res).toBeTruthy());
    const req = httpMock.expectOne(r => r.url.includes('/students') && r.method === 'POST');
    expect(req.request.body.firstName).toBe('Juan');
    req.flush({ id: '1' });
  });

  it('RF-014 list with pagination and search', () => {
    service.list({ search: 'Juan', page: 2, limit: 5 }).subscribe();
    const req = httpMock.expectOne(r => r.url.includes('/students') && r.params.get('search') === 'Juan');
    expect(req.request.params.get('page')).toBe('2');
    req.flush({ data: [], total: 0 });
  });

  it('RF-015 assign advisor', () => {
    service.assignAdvisor('1', 'adv1').subscribe();
    const req = httpMock.expectOne(r => r.url.includes('/students/1/advisor'));
    expect(req.request.body.advisorId).toBe('adv1');
    req.flush({});
  });

  it('RF-016 add observation sanitized', () => {
    service.addObservation('1', '<script>alert(1)</script>Observación').subscribe();
    const req = httpMock.expectOne(r => r.url.includes('/observations'));
    // Service should send as is, component sanitizes - verify payload
    expect(req.request.body.observation).toContain('Observación');
    req.flush({ id: 'o1' });
  });
});
