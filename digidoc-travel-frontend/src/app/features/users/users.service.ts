import { Injectable } from '@angular/core';
import { ApiService } from '../../core/services/api.service';
import { Observable, map } from 'rxjs';
import { PaginatedResponse } from '../../shared/interfaces/api.interface';

export interface AppRole {
  id: string;
  name: string;
}

export interface AppUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  status: boolean;
  roles?: AppRole[];
  createdAt?: string;
}

function unwrapData<T>(res: any): T {
  return (res && typeof res === 'object' && 'success' in res && 'data' in res ? res.data : res) as T;
}

@Injectable({ providedIn: 'root' })
export class UsersService {
  constructor(private api: ApiService) {}

  // Desenvuelve {success,data} del ResponseInterceptor (igual que StudentsService)
  list(params?: any): Observable<PaginatedResponse<AppUser>> {
    return this.api.get<any>('/users', params).pipe(map(unwrapData<PaginatedResponse<AppUser>>));
  }
  get(id: string): Observable<AppUser> {
    return this.api.get<any>(`/users/${id}`).pipe(map(unwrapData<AppUser>));
  }
  create(body: any): Observable<AppUser> { return this.api.post('/users', body); }
  update(id: string, body: any): Observable<AppUser> { return this.api.patch(`/users/${id}`, body); }
  deactivate(id: string): Observable<{ message: string }> { return this.api.delete(`/users/${id}`); }
  assignRoles(id: string, roleIds: string[]): Observable<AppUser> { return this.api.post(`/users/${id}/roles`, { roleIds }); }
  listRoles(): Observable<AppRole[]> {
    return this.api.get<any>('/roles').pipe(
      map((res: any) => {
        const data = unwrapData<any>(res);
        return Array.isArray(data) ? data : (data?.data ?? []);
      })
    );
  }
}
