import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { EventsService } from './events.service';

describe('EventsService', () => {
  let service: EventsService; let httpMock: HttpTestingController;
  beforeEach(() => { TestBed.configureTestingModule({ providers: [EventsService, provideHttpClient(), provideHttpClientTesting()] }); service = TestBed.inject(EventsService); httpMock = TestBed.inject(HttpTestingController); });
  afterEach(() => httpMock.verify());
  it('should be created', () => expect(service).toBeTruthy());
  it('create event', () => {
    service.create({ title: 'Orientation', eventDate: new Date().toISOString(), location: 'Auditorio' } as any).subscribe();
    const req = httpMock.expectOne(r => r.url.includes('/events') && r.method === 'POST');
    expect(req.request.body.title).toBe('Orientation');
    req.flush({ id: '1', qrCode: 'data:image', uniqueLink: 'abc' });
  });
  it('get QR', () => {
    service.getQr('1').subscribe(res => expect(res.qrCode).toContain('data:image'));
    const req = httpMock.expectOne(r => r.url.includes('/qr'));
    req.flush({ qrCode: 'data:image/png;base64,abc', uniqueLink: 'abc' });
  });
});
