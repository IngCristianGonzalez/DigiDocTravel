import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter, ActivatedRoute } from '@angular/router';
import { ForgotPasswordComponent } from './forgot-password.component';

describe('ForgotPasswordComponent - RF-002', () => {
  const setup = (token: string | null) => {
    TestBed.configureTestingModule({
      imports: [ForgotPasswordComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { queryParamMap: { get: () => token } } },
        },
      ],
    });
    const fixture: ComponentFixture<ForgotPasswordComponent> = TestBed.createComponent(ForgotPasswordComponent);
    fixture.detectChanges();
    return { fixture, component: fixture.componentInstance };
  };

  it('should create in forgot mode without token', () => {
    const { component } = setup(null);
    expect(component).toBeTruthy();
    expect(component.mode).toBe('forgot');
  });

  it('should switch to reset mode with token', () => {
    const { component } = setup('tok123');
    expect(component.mode).toBe('reset');
    expect(component.token).toBe('tok123');
  });

  it('should validate email and passwords', () => {
    const { component } = setup(null);
    component.email = 'bad';
    expect(component.isEmailValid()).toBe(false);
    component.email = 'a@a.com';
    expect(component.isEmailValid()).toBe(true);
    component.password = '123456';
    component.confirmPassword = '123456';
    expect(component.isPasswordValid()).toBe(true);
    expect(component.isConfirmValid()).toBe(true);
  });
});
