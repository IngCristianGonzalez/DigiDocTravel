import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { CheckboxModule } from 'primeng/checkbox';
import { ButtonModule } from 'primeng/button';
import { MessageModule } from 'primeng/message';
import { DropdownModule } from 'primeng/dropdown';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    FormsModule,
    RouterLink,
    InputTextModule,
    PasswordModule,
    CheckboxModule,
    ButtonModule,
    MessageModule,
    DropdownModule,
  ],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss',
})
export class RegisterComponent {
  fullName = '';
  email = '';
  password = '';
  confirmPassword = '';
  institution = '';
  acceptTerms = false;

  fullNameTouched = signal(false);
  emailTouched = signal(false);
  passwordTouched = signal(false);
  confirmPasswordTouched = signal(false);
  institutionTouched = signal(false);

  roleOptions = [
    { label: 'Coordinador', value: 'coordinator' },
    { label: 'Tutor', value: 'tutor' },
    { label: 'Administrador', value: 'admin' },
    { label: 'Estudiante', value: 'student' },
  ];
  selectedRole = signal<string | null>(null);

  submitError = signal<string | null>(null);
  submitSuccess = signal(false);
  loading = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private toast: ToastService,
  ) {}

  isFullNameValid(): boolean {
    return this.fullName.trim().length >= 3;
  }

  isEmailValid(): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.email);
  }

  isPasswordValid(): boolean {
    return this.password.length >= 6;
  }

  isConfirmPasswordValid(): boolean {
    return this.password === this.confirmPassword && this.confirmPassword.length > 0;
  }

  isInstitutionValid(): boolean {
    return this.institution.trim().length >= 2;
  }

  isFormValid(): boolean {
    return (
      this.isFullNameValid() &&
      this.isEmailValid() &&
      this.isPasswordValid() &&
      this.isConfirmPasswordValid() &&
      this.isInstitutionValid() &&
      this.acceptTerms
    );
  }

  // OWASP A03/XSS - sanitizar inputs
  private sanitize(v: string): string { return v.replace(/<[^>]*>/g, '').trim(); }

  onSubmit(): void {
    this.fullNameTouched.set(true);
    this.emailTouched.set(true);
    this.passwordTouched.set(true);
    this.confirmPasswordTouched.set(true);
    this.institutionTouched.set(true);

    if (!this.isFormValid()) return;

    this.loading = true;
    this.submitError.set(null);

    this.authService.register({
      fullName: this.sanitize(this.fullName),
      email: this.sanitize(this.email),
      password: this.password,
      institution: this.sanitize(this.institution),
      role: this.selectedRole() ?? undefined,
    }).subscribe({
      next: () => {
        this.loading = false;
        this.submitSuccess.set(true);
        this.toast.success('Cuenta creada. Revisa tu correo e inicia sesión.');
        setTimeout(() => this.router.navigate(['/auth/login']), 2000);
      },
      error: (err) => {
        this.loading = false;
        const msg = err.error?.message || 'No se pudo crear la cuenta. Inténtalo de nuevo.';
        this.submitError.set(msg);
        this.toast.error(msg);
      },
    });
  }

  signUpWithGoogle(): void {
    window.open('/api/auth/google', '_self');
  }
}
