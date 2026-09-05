import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { DashboardComponent } from './dashboard.component';

describe('DashboardComponent', () => {
  let fixture: ComponentFixture<DashboardComponent>;
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardComponent],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([]), provideNoopAnimations()],
    }).compileComponents();
    fixture = TestBed.createComponent(DashboardComponent);
    fixture.detectChanges();
  });
  it('should create', () => expect(fixture.componentInstance).toBeTruthy());
  it('should show loading initially', () => {
    expect(fixture.nativeElement.textContent).toContain('Dashboard');
  });
  it('should sanitize numbers (OWASP)', () => {
    const comp = fixture.componentInstance;
    expect((comp as any).sanitizeSummary).toBeDefined();
  });

  it('should compute students progress (clamped 0..100)', () => {
    const comp = fixture.componentInstance;
    expect(comp.getStudentsProgress({ students: { total: 10, active: 5 } } as any)).toBe(50);
    expect(comp.getStudentsProgress({ students: { total: 0, active: 0 } } as any)).toBe(0);
    expect(comp.getStudentsProgress({ students: { total: 10, active: 20 } } as any)).toBe(100);
  });

  it('should sanitize summary numbers (negatives/NaN -> 0)', () => {
    const comp = fixture.componentInstance;
    const out = (comp as any).sanitizeSummary({ students: { total: -5, active: NaN, newThisMonth: 2 }, documents: { total: 3, pending: 1 }, visas: { expiringIn90Days: 0, expired: 0 }, payments: { pending: 1, overdue: 0, totalAmount: 100 }, events: { next7Days: 1, total: 2 } });
    expect(out.students.total).toBe(0);
    expect(out.students.active).toBe(0);
    expect(out.students.newThisMonth).toBe(2);
  });

  it('should use tokens only (no legacy hardcoded hex in template)', () => {
    const html: string = (fixture.nativeElement as HTMLElement).innerHTML;
    for (const hex of ['#10b981', '#f87171', '#dc2626', '#38bdf8', '#34d399', '#fb923c']) {
      expect(html).not.toContain(hex);
    }
  });
});
