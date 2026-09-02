import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { UsersService } from './users.service';

describe('UsersService - RF-007 a RF-011', () => {
  let service: UsersService; let httpMock: HttpTestingController;
  beforeEach(() => { TestBed.configureTestingModule({ providers: [UsersService, provideHttpClient(), provideHttpClientTesting()] }); service = TestBed.inject(UsersService); httpMock = TestBed.inject(HttpTestingController); });
  afterEach(() => httpMock.verify());
  it('should be created', () => expect(service).toBeTruthy());
  it('RF-007 create', () => {
    service.create({ email: 'a@a.com', password: 'Password123!', firstName: 'Test' } as any).subscribe();
    const req = httpMock.expectOne(r => r.url.includes('/users') && r.method === 'POST');
    req.flush({ id: '1' });
  });
  it('RF-010 list', () => {
    service.list({ search: 'test' }).subscribe();
    const req = httpMock.expectOne(r => r.url.includes('/users') && r.params.get('search') === 'test');
    req.flush({ data: [] });
  });
});
