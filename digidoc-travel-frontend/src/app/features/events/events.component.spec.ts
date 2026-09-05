import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { EventsComponent } from './events.component';

describe('EventsComponent', () => {
  let fixture: ComponentFixture<EventsComponent>;
  let component: EventsComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EventsComponent],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();
    fixture = TestBed.createComponent(EventsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => expect(component).toBeTruthy());

  it('should have title Gestión de Eventos', () => {
    const el: HTMLElement = fixture.nativeElement;
    expect(el.textContent).toContain('Gestión de Eventos');
  });

  it('should validate title and date', () => {
    component.form.set({ title: '', description: '', eventDate: 'not-a-date', location: '' });
    const valid = (component as any).validateForm();
    expect(valid).toBe(false);
    expect(component.formErrors().title).toBeTruthy();
    expect(component.formErrors().eventDate).toBeTruthy();
  });

  it('should classify upcoming vs past', () => {
    const future = new Date(Date.now() + 86400000).toISOString();
    const past = new Date(Date.now() - 86400000).toISOString();
    expect(component.isUpcoming(future)).toBe(true);
    expect(component.isUpcoming(past)).toBe(false);
  });

  it('should map lazy paginator event to server page/limit', () => {
    component.onPageChange({ first: 20, rows: 10 });
    expect(component.page()).toBe(3);
    expect(component.limit()).toBe(10);
  });

  it('should open detail/edit/QR modals from row actions (no prompt)', () => {
    const e: any = { id: '1', title: 'Feria', description: '', eventDate: new Date(Date.now() + 86400000).toISOString(), location: 'Auditorio', qrCode: 'data:image/png;base64,x', uniqueLink: 'abc' };
    component.openDetail(e);
    expect(component.showDetailModal()).toBe(true);
    component.goFromDetailToEdit();
    expect(component.showEditModal()).toBe(true);
    expect(component.form().title).toBe('Feria');
    component.closeEditModal();

    component.openQr(e);
    expect(component.showQrModal()).toBe(true);
    expect(component.qrData()?.uniqueLink).toBe('abc');
    expect(component.shareLink()).toContain('/events/link/abc');
    component.closeQrModal();
  });
});
