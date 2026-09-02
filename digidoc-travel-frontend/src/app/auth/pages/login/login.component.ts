import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { CheckboxModule } from 'primeng/checkbox';
import { ButtonModule } from 'primeng/button';
import { MessageModule } from 'primeng/message';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../../core/services/toast.service';

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
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {
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
      this.toast.error('Entrada no válida detectada');
      return;
    }

    this.authService
      .login({ email, password })
      .subscribe({
        next: () => {
          this.toast.success('Inicio de sesión exitoso');
          this.router.navigate(['/dashboard']);
        },
        error: (err) => {
          const status = err.status;
          const msg = err.error?.message || 'Error al iniciar sesión';
          if (status === 429) {
            this.toast.warning('Demasiados intentos. Espera 15 minutos (OWASP Rate Limit)');
          } else if (status === 401) {
            this.toast.error('Credenciales inválidas');
          }
          console.warn(`[Login ${status}] ${msg}`);
        }
      });
  }

  signInWithGoogle(): void {
    window.open('http://localhost:3000/api/auth/google', '_self');
  }
}
