import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { UsersComponent } from './users.component';

describe('UsersComponent', () => {
  let fixture: ComponentFixture<UsersComponent>;
  let component: UsersComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UsersComponent],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();
    fixture = TestBed.createComponent(UsersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => expect(component).toBeTruthy());

  it('should have title Gestión de Usuarios', () => {
    const el: HTMLElement = fixture.nativeElement;
    expect(el.textContent).toContain('Gestión de Usuarios');
  });

  it('should validate required fields and weak password', () => {
    component.form.set({ email: 'bad', password: '123', firstName: 'A', lastName: '' });
    const valid = (component as any).validateForm(true);
    expect(valid).toBe(false);
    expect(component.formErrors().email).toBeTruthy();
    expect(component.formErrors().password).toBeTruthy();
  });

  it('should map lazy paginator event to server page/limit', () => {
    component.onPageChange({ first: 20, rows: 10 });
    expect(component.page()).toBe(3);
    expect(component.limit()).toBe(10);
  });

  it('should open detail modal from row action', () => {
    const u: any = { id: '1', email: 'a@a.com', firstName: 'Ana', lastName: 'Paz', status: true, roles: [] };
    component.openDetail(u);
    expect(component.showDetailModal()).toBe(true);
    expect(component.detailUser()).toEqual(u);
    component.closeDetailModal();
    expect(component.showDetailModal()).toBe(false);
  });

  it('should prefill edit modal from row', () => {
    const u: any = { id: '2', email: 'j@x.com', firstName: 'Juan', lastName: 'Pérez', status: true };
    component.openEdit(u);
    expect(component.showEditModal()).toBe(true);
    expect(component.form().email).toBe('j@x.com');
  });

  it('should move from detail modal to edit modal keeping data', () => {
    const u: any = { id: '3', email: 'l@x.com', firstName: 'Luz', lastName: 'Díaz', status: true };
    component.openDetail(u);
    component.goFromDetailToEdit();
    expect(component.showDetailModal()).toBe(false);
    expect(component.showEditModal()).toBe(true);
    expect(component.editingUser()).toEqual(u);
  });

  it('should open/close roles and delete modals from row actions', () => {
    const u: any = { id: '4', email: 'e@x.com', firstName: 'Eva', lastName: 'Ruiz', status: true, roles: [{ id: 'r1', name: 'admin' }] };
    component.openRoles(u);
    expect(component.showRolesModal()).toBe(true);
    expect(component.selectedRoleIds()).toEqual(['r1']);
    component.closeRolesModal();
    expect(component.showRolesModal()).toBe(false);

    component.openDelete(u);
    expect(component.showDeleteModal()).toBe(true);
    expect(component.deleteTarget()).toEqual(u);
    component.closeDeleteModal();
    expect(component.showDeleteModal()).toBe(false);
  });
});
