import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { NotificationsComponent } from './notifications.component';

describe('NotificationsComponent', () => {
  let fixture: ComponentFixture<NotificationsComponent>;
  let component: NotificationsComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NotificationsComponent],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();
    fixture = TestBed.createComponent(NotificationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => expect(component).toBeTruthy());

  it('should have title Notificaciones', () => {
    const el: HTMLElement = fixture.nativeElement;
    expect(el.textContent).toContain('Notificaciones');
  });

  it('should map type to tag severity', () => {
    expect(component.typeSeverity('error')).toBe('danger');
    expect(component.typeSeverity('visa')).toBe('warning');
    expect(component.typeSeverity('success')).toBe('success');
    expect(component.typeSeverity('info')).toBe('info');
  });

  it('should map lazy paginator event to server page/limit', () => {
    component.onPageChange({ first: 20, rows: 10 });
    expect(component.page()).toBe(3);
    expect(component.limit()).toBe(10);
  });

  it('should open detail modal and mark-all modal', () => {
    const n: any = { id: '1', title: 'Visa próxima', message: 'Vence en 10 días', type: 'visa', read: false, createdAt: new Date().toISOString() };
    component.openDetail(n);
    expect(component.showDetailModal()).toBe(true);
    expect(component.detailNotif()).toEqual(n);
    component.closeDetailModal();

    component.openMarkAll();
    expect(component.showMarkAllModal()).toBe(true);
    component.closeMarkAllModal();
    expect(component.showMarkAllModal()).toBe(false);
  });

  it('should clear filters', () => {
    component.filterType.set('visa');
    component.filterStatus.set('unread');
    component.clearFilters();
    expect(component.filterType()).toBe('');
    expect(component.filterStatus()).toBe('');
    expect(component.page()).toBe(1);
  });
});
