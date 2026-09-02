import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { DashboardService } from './dashboard.service';

describe('DashboardService', () => {
  let service: DashboardService; let httpMock: HttpTestingController;
  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [DashboardService, provideHttpClient(), provideHttpClientTesting()] });
    service = TestBed.inject(DashboardService); httpMock = TestBed.inject(HttpTestingController);
  });
  afterEach(() => httpMock.verify());
  it('should be created', () => expect(service).toBeTruthy());
  it('getSummary', () => {
    service.getSummary().subscribe(res => {
      expect(res.students).toBeDefined();
      expect(res.visas.expiringIn90Days).toBeDefined();
    });
    const req = httpMock.expectOne(r => r.url.includes('/dashboard/summary'));
    req.flush({ students: { total: 10, active: 8, newThisMonth: 2 }, documents: { total: 20, pending: 3 }, visas: { expiringIn90Days: 1, expired: 0 }, payments: { pending: 2, overdue: 0, totalAmount: 1000 }, events: { next7Days: 1, total: 5 } });
  });
  it('should handle 500 error', () => {
    service.getSummary().subscribe({ error: (err) => expect(err.status).toBe(500) });
    const req = httpMock.expectOne(r => r.url.includes('/dashboard/summary'));
    req.flush('error', { status: 500, statusText: 'Server Error' });
  });
});
