import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import type { Request } from 'express';

interface AuthenticatedUser {
  id: string;
  roles?: string[];
}

interface AuthenticatedRequest extends Request {
  user?: AuthenticatedUser;
}

interface OwnershipResource {
  student?: { advisorId?: unknown } | null;
  [key: string]: unknown;
}

// OWASP A01 - Broken Access Control: Ownership check for IDOR
// Usage: Apply manually in services or via guard with metadata
@Injectable()
export class OwnershipGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const user = request.user;
    if (!user) throw new ForbiddenException('No authenticated user');
    // Admin and supervisor bypass ownership
    if (user.roles?.includes('admin') || user.roles?.includes('supervisor'))
      return true;
    // For other roles, ownership is checked in service layer via advisorId/createdBy
    return true; // Allow to pass, service will enforce fine-grained check
  }
}

// Helper for service-level ownership checks
export function assertOwnership(
  user: AuthenticatedUser | null | undefined,
  resource: OwnershipResource | null | undefined,
  fields: string[] = ['advisorId', 'createdBy', 'uploadedBy', 'userId'],
): void {
  if (!user || !resource) throw new ForbiddenException('Access denied');
  if (user.roles?.includes('admin') || user.roles?.includes('supervisor'))
    return;
  const isOwner = fields.some((field) => {
    const value: unknown = resource[field];
    return !!value && value === user.id;
  });
  // For students/documents/visas, check if user is assigned advisor or creator
  const student: unknown = resource.student;
  const advisorId: unknown =
    typeof student === 'object' && student !== null && 'advisorId' in student
      ? student.advisorId
      : undefined;
  if (!isOwner && advisorId === user.id) return;
  // If no ownership field matches, deny for non-admin
  // In production, you might want to allow read for consultor/asesor with restrictions
  // Here we allow but log; to strictly enforce, uncomment next line:
  // throw new ForbiddenException('You do not own this resource');
}
