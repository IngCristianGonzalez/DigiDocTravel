import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { ButtonModule } from 'primeng/button';
import { MessageModule } from 'primeng/message';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../../core/services/toast.service';

type Mode = 'forgot' | 'reset';

/**
 * Recuperar contraseña.
 * Sin token: pide email y envía enlace. Con ?token=: muestra restablecer.
 */
@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [FormsModule, RouterLink, InputTextModule, PasswordModule, ButtonModule, MessageModule],
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.scss',
})
export class ForgotPasswordComponent implements OnInit {
  mode: Mode = 'forgot';
  token = '';
  email = '';
  password = '';
  confirmPassword = '';

  emailTouched = signal(false);
  passwordTouched = signal(false);
  sent = signal(false);
  done = signal(false);

  constructor(
    public authService: AuthService,
    private route: ActivatedRoute,
    private toast: ToastService,
  ) {}

  ngOnInit(): void {
    const t = this.route.snapshot.queryParamMap.get('token')?.trim() ?? '';
    if (t) {
      this.mode = 'reset';
      this.token = t;
    }
  }

  isEmailValid(): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.email);
  }

  isPasswordValid(): boolean {
    return this.password.length >= 6;
  }

  isConfirmValid(): boolean {
    return this.confirmPassword.length > 0 && this.password === this.confirmPassword;
  }

  private sanitize(v: string): string {
    return v.replace(/<[^>]*>/g, '').trim();
  }

  submitForgot(): void {
    this.emailTouched.set(true);
    if (!this.isEmailValid()) return;
    this.authService.forgotPassword(this.sanitize(this.email)).subscribe({
      next: () => {
        this.sent.set(true);
        this.toast.success('Si el correo existe, recibirás el enlace de recuperación.');
      },
      error: () => this.toast.error(this.authService.error() ?? 'No se pudo enviar el correo.'),
    });
  }

  submitReset(): void {
    this.passwordTouched.set(true);
    if (!this.isPasswordValid() || !this.isConfirmValid()) return;
    this.authService.resetPassword(this.token, this.password).subscribe({
      next: () => {
        this.done.set(true);
        this.toast.success('Contraseña restablecida. Inicia sesión.');
      },
      error: () => this.toast.error(this.authService.error() ?? 'Enlace inválido o vencido.'),
    });
  }
}
