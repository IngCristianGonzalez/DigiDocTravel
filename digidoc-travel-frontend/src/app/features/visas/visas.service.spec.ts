import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { VisasService } from './visas.service';

describe('VisasService - RF-025 a RF-030', () => {
  let service: VisasService; let httpMock: HttpTestingController;
  beforeEach(() => { TestBed.configureTestingModule({ providers: [VisasService, provideHttpClient(), provideHttpClientTesting()] }); service = TestBed.inject(VisasService); httpMock = TestBed.inject(HttpTestingController); });
  afterEach(() => httpMock.verify());
  it('should be created', () => expect(service).toBeTruthy());
  it('RF-025 create', () => {
    service.create({ studentId: '1', visaType: 'student', country: 'USA', issueDate: '2024-01-01', expiryDate: '2025-01-01' } as any).subscribe();
    const req = httpMock.expectOne(r => r.url.includes('/visas') && r.method === 'POST');
    req.flush({ id: '1' });
  });
  it('RF-029 expiring 90 days', () => {
    service.expiring(90).subscribe(res => expect(res).toBeTruthy());
    const req = httpMock.expectOne(r => r.url.includes('/expiring') && r.params.get('days') === '90');
    req.flush([]);
  });
});
