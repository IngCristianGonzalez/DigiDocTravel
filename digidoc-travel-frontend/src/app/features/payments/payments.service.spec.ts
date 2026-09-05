import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { PaymentsService } from './payments.service';

describe('PaymentsService', () => {
  let service: PaymentsService; let httpMock: HttpTestingController;
  beforeEach(() => { TestBed.configureTestingModule({ providers: [PaymentsService, provideHttpClient(), provideHttpClientTesting()] }); service = TestBed.inject(PaymentsService); httpMock = TestBed.inject(HttpTestingController); });
  afterEach(() => httpMock.verify());
  it('should be created', () => expect(service).toBeTruthy());
  it('create plan', () => {
    service.create({ studentId: '1', concept: 'Matrícula', totalAmount: 3000, installments: 3, startDate: '2024-01-01' } as any).subscribe();
    const req = httpMock.expectOne(r => r.url.includes('/payment-plans') && r.method === 'POST');
    expect(req.request.body.concept).toBe('Matrícula');
    req.flush({ id: '1' });
  });
  it('pay', () => {
    service.pay('inst1', { amount: 1000, paymentDate: '2024-02-01' } as any).subscribe();
    const req = httpMock.expectOne(r => r.url.includes('/pay'));
    req.flush({ id: 'pay1' });
  });
});
