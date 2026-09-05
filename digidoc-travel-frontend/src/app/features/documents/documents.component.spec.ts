import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { DocumentsComponent } from './documents.component';

describe('DocumentsComponent', () => {
  let fixture: ComponentFixture<DocumentsComponent>;
  let component: DocumentsComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DocumentsComponent],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();
    fixture = TestBed.createComponent(DocumentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => expect(component).toBeTruthy());

  it('should have title Gestión Documental', () => {
    const el: HTMLElement = fixture.nativeElement;
    expect(el.textContent).toContain('Gestión Documental');
  });

  it('should validate required fields and UUID', () => {
    component.form.set({ studentId: 'not-uuid', type: '', name: '' });
    const valid = (component as any).validateForm();
    expect(valid).toBe(false);
    expect(component.formErrors().studentId).toBeTruthy();
    expect(component.formErrors().name).toBeTruthy();
  });

  it('should map status to tag severity', () => {
    expect(component.statusSeverity('approved')).toBe('success');
    expect(component.statusSeverity('pending')).toBe('warning');
    expect(component.statusSeverity('rejected')).toBe('danger');
    expect(component.statusSeverity('x')).toBe('secondary');
  });

  it('should map lazy paginator event to server page/limit', () => {
    component.onPageChange({ first: 20, rows: 10 });
    expect(component.page()).toBe(3);
    expect(component.limit()).toBe(10);
  });

  it('should open detail/history/delete modals from row actions', () => {
    const d: any = { id: '1', studentId: '11111111-1111-1111-1111-111111111111', type: 'passport', name: 'Pass', status: 'pending' };
    component.openDetail(d);
    expect(component.showDetailModal()).toBe(true);
    component.closeDetailModal();

    component.openHistory(d);
    expect(component.showHistoryModal()).toBe(true);
    expect(component.historyDoc()).toEqual(d);
    component.closeHistoryModal();

    component.openDelete(d);
    expect(component.showDeleteModal()).toBe(true);
    component.closeDeleteModal();
    expect(component.deleteTarget()).toBeNull();
  });

  it('should prefill edit modal and move from detail to edit', () => {
    const d: any = { id: '2', studentId: '22222222-2222-2222-2222-222222222222', type: 'visa', name: 'Visa', category: 'identity' };
    component.openEdit(d);
    expect(component.showEditModal()).toBe(true);
    expect(component.form().name).toBe('Visa');
    component.closeEditModal();

    component.openDetail(d);
    component.goFromDetailToEdit();
    expect(component.showDetailModal()).toBe(false);
    expect(component.showEditModal()).toBe(true);
  });
});
