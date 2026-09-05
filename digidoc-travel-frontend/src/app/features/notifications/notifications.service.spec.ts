import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { NotificationsService } from './notifications.service';

describe('NotificationsService', () => {
  let service: NotificationsService; let httpMock: HttpTestingController;
  beforeEach(() => { TestBed.configureTestingModule({ providers: [NotificationsService, provideHttpClient(), provideHttpClientTesting()] }); service = TestBed.inject(NotificationsService); httpMock = TestBed.inject(HttpTestingController); });
  afterEach(() => httpMock.verify());
  it('should be created', () => expect(service).toBeTruthy());
  it('list', () => {
    service.list({ page: 1 }).subscribe();
    const req = httpMock.expectOne(r => r.url.includes('/notifications'));
    req.flush({ data: [] });
  });
  it('markRead', () => {
    service.markRead('1').subscribe();
    const req = httpMock.expectOne(r => r.url.includes('/1/read') && r.method === 'PATCH');
    req.flush({});
  });
});
