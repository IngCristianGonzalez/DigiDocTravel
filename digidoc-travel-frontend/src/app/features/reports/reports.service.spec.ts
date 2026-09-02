import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { ReportsService } from './reports.service';

describe('ReportsService - RF-046 a RF-050', () => {
  let service: ReportsService; let httpMock: HttpTestingController;
  beforeEach(() => { TestBed.configureTestingModule({ providers: [ReportsService, provideHttpClient(), provideHttpClientTesting()] }); service = TestBed.inject(ReportsService); httpMock = TestBed.inject(HttpTestingController); });
  afterEach(() => httpMock.verify());
  it('should be created', () => expect(service).toBeTruthy());
  it('RF-046 students report', () => {
    service.students({}).subscribe(res => expect(res).toBeTruthy());
    const req = httpMock.expectOne(r => r.url.includes('/reports/students'));
    req.flush({ total: 10, data: [] });
  });
  it('RF-050 export PDF', () => {
    service.export('students', 'pdf').subscribe(res => expect(res.filename).toContain('.pdf'));
    const req = httpMock.expectOne(r => r.url.includes('/export/students') && r.params.get('format') === 'pdf');
    req.flush({ filename: 'students-report.pdf', contentType: 'application/pdf' });
  });
});
