import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router,
  ) {}

  canActivate(): boolean | UrlTree {
    if (this.authService.isAuthenticated()) {
      return true;
    }
    return this.router.createUrlTree(['/auth/login']);
  }
}

@Injectable({
  providedIn: 'root',
})
export class RoleGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router,
  ) {}

  canActivate(route: { data?: { roles?: string[] } }): boolean | UrlTree {
    const requiredRoles = route.data?.roles || [];

    if (requiredRoles.length === 0) {
      return true;
    }

    const hasRole = requiredRoles.some((role) =>
      this.authService.hasRole(role),
    );

    if (hasRole) {
      return true;
    }

    return this.router.createUrlTree(['/unauthorized']);
  }
}
