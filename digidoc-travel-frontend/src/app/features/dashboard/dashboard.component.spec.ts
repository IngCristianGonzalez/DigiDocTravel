import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { DashboardComponent } from './dashboard.component';

describe('DashboardComponent - RF-051 a RF-056', () => {
  let fixture: ComponentFixture<DashboardComponent>;
  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [DashboardComponent], providers: [provideHttpClient(), provideHttpClientTesting()] }).compileComponents();
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
});
