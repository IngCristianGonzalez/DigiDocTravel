import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap, catchError, throwError } from 'rxjs';
import {
  LoginRequest,
  LoginResponse,
  RefreshTokenResponse,
  User,
} from '../../shared/interfaces/auth.interface';

export interface RegisterRequest {
  fullName: string;
  email: string;
  password: string;
  institution: string;
  role?: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly API_URL = 'http://localhost:3000/api/auth';

  private _user = signal<User | null>(null);
  private _token = signal<string | null>(null);
  private _refreshToken = signal<string | null>(null);
  private _loading = signal<boolean>(false);
  private _error = signal<string | null>(null);

  user = this._user.asReadonly();
  token = this._token.asReadonly();
  loading = this._loading.asReadonly();
  error = this._error.asReadonly();
  isAuthenticated = computed(() => !!this._token() && !!this._user());

  constructor(
    private http: HttpClient,
    private router: Router,
  ) {
    this.loadFromStorage();
  }

  login(credentials: LoginRequest): Observable<LoginResponse> {
    this._loading.set(true);
    this._error.set(null);

    return this.http
      .post<LoginResponse>(`${this.API_URL}/login`, credentials)
      .pipe(
        tap((response) => {
          this.setSession(response);
          this._loading.set(false);
        }),
        catchError((error) => {
          this._loading.set(false);
          this._error.set(
            error.error?.message || 'Login failed. Please try again.',
          );
          return throwError(() => error);
        }),
      );
  }

  register(data: RegisterRequest): Observable<any> {
    this._loading.set(true);
    this._error.set(null);

    return this.http
      .post(`${this.API_URL}/register`, data)
      .pipe(
        tap(() => {
          this._loading.set(false);
        }),
        catchError((error) => {
          this._loading.set(false);
          this._error.set(
            error.error?.message || 'Registration failed. Please try again.',
          );
          return throwError(() => error);
        }),
      );
  }

  logout(): void {
    const refreshToken = this._refreshToken();
    if (refreshToken) {
      this.http.post(`${this.API_URL}/logout`, {}).subscribe();
    }

    this.clearSession();
    this.router.navigate(['/auth/login']);
  }

  refreshToken(): Observable<RefreshTokenResponse> {
    const refreshToken = this._refreshToken();
    if (!refreshToken) {
      this.logout();
      return throwError(() => new Error('No refresh token'));
    }

    return this.http
      .post<RefreshTokenResponse>(`${this.API_URL}/refresh`, { refreshToken })
      .pipe(
        tap((response) => {
          this._token.set(response.accessToken);
          this.getStorage()?.setItem('access_token', response.accessToken);
        }),
        catchError((error) => {
          this.logout();
          return throwError(() => error);
        }),
      );
  }

  getProfile(): Observable<User> {
    return this.http.get<User>(`${this.API_URL}/profile`).pipe(
      tap((user) => {
        this._user.set(user);
        this.getStorage()?.setItem('user', JSON.stringify(user));
      }),
    );
  }

  hasRole(role: string): boolean {
    const user = this._user();
    return user?.roles?.some((r) => r.name === role) ?? false;
  }

  hasPermission(module: string, action: string): boolean {
    const user = this._user();
    return (
      user?.roles?.some((r) =>
        r.permissions?.some((p) => p.module === module && p.action === action),
      ) ?? false
    );
  }

  private getStorage(): Storage | null {
    try {
      // Priority: globalThis (vitest jsdom) -> window -> bare localStorage
      if (typeof globalThis !== 'undefined' && (globalThis as any).localStorage && typeof (globalThis as any).localStorage.getItem === 'function') return (globalThis as any).localStorage;
      if (typeof window !== 'undefined' && (window as any).localStorage && typeof (window as any).localStorage.getItem === 'function') return (window as any).localStorage;
      if (typeof localStorage !== 'undefined' && (localStorage as any) && typeof (localStorage as any).getItem === 'function') return localStorage as unknown as Storage;
    } catch {}
    return null;
  }

  private setSession(response: LoginResponse): void {
    this._token.set(response.accessToken);
    this._refreshToken.set(response.refreshToken);
    this._user.set(response.user);

    const storage = this.getStorage();
    if (storage) {
      storage.setItem('access_token', response.accessToken);
      storage.setItem('refresh_token', response.refreshToken);
      storage.setItem('user', JSON.stringify(response.user));
    }
  }

  private clearSession(): void {
    this._token.set(null);
    this._refreshToken.set(null);
    this._user.set(null);
    this._error.set(null);

    const storage = this.getStorage();
    if (storage) {
      storage.removeItem('access_token');
      storage.removeItem('refresh_token');
      storage.removeItem('user');
    }
  }

  private loadFromStorage(): void {
    const storage = this.getStorage();
    if (!storage) return;
    const token = storage.getItem('access_token');
    const refreshToken = storage.getItem('refresh_token');
    const user = storage.getItem('user');

    if (token && refreshToken && user) {
      this._token.set(token);
      this._refreshToken.set(refreshToken);
      try {
        this._user.set(JSON.parse(user));
      } catch {
        this.clearSession();
      }
    }
  }
}
