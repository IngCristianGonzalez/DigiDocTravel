import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { CheckboxModule } from 'primeng/checkbox';
import { ButtonModule } from 'primeng/button';
import { MessageModule } from 'primeng/message';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../../core/services/toast.service';
import { I18nService } from '../../../core/i18n/i18n.service';
import { LangSelectorComponent } from '../../../shared/components/lang-selector.component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    FormsModule,
    RouterLink,
    InputTextModule,
    PasswordModule,
    CheckboxModule,
    ButtonModule,
    MessageModule,
    LangSelectorComponent,
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  public i18n = inject(I18nService);

  email = '';
  password = '';
  rememberMe = false;

  showPassword = signal(false);
  emailTouched = signal(false);
  passwordTouched = signal(false);

  constructor(
    public authService: AuthService,
    private router: Router,
    private toast: ToastService,
  ) {}

  isEmailValid(): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.email);
  }

  isPasswordValid(): boolean {
    return this.password.length >= 6;
  }

  isFormValid(): boolean {
    return this.isEmailValid() && this.isPasswordValid();
  }

  // OWASP A03/XSS - sanitizar inputs
  private sanitize(v: string): string { return v.replace(/<[^>]*>/g, '').trim(); }

  onSubmit(): void {
    this.emailTouched.set(true);
    this.passwordTouched.set(true);

    if (!this.isFormValid()) return;

    const email = this.sanitize(this.email);
    const password = this.sanitize(this.password);

    // OWASP A07 - validar cliente antes de enviar
    if (email.includes('..') || password.includes('<script')) {
      this.toast.error(this.i18n.t('auth.validation.invalidInput'));
      return;
    }

    this.authService
      .login({ email, password })
      .subscribe({
        next: () => {
          this.toast.success(this.i18n.t('auth.validation.loginOk'));
          this.router.navigate(['/dashboard']);
        },
        error: (err) => {
          const status = err.status;
          const msg = err.error?.message || this.i18n.t('auth.validation.loginError');
          if (status === 429) {
            this.toast.warning(this.i18n.t('auth.validation.rateLimit'));
          } else if (status === 401) {
            this.toast.error(this.i18n.t('auth.validation.badCredentials'));
          }
          console.warn(`[Login ${status}] ${msg}`);
        }
      });
  }

  signInWithGoogle(): void {
    window.open('/api/auth/google', '_self');
  }
}
