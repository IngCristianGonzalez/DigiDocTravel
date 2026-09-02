import { Injectable } from '@angular/core';
import { ApiService } from '../../core/services/api.service';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class UsersService {
  constructor(private api: ApiService) {}
  list(params?: any): Observable<any> { return this.api.get('/users', params); }
  get(id:string): Observable<any> { return this.api.get(`/users/${id}`); }
  create(body:any): Observable<any> { return this.api.post('/users', body); }
  update(id:string, body:any): Observable<any> { return this.api.patch(`/users/${id}`, body); }
  deactivate(id:string): Observable<any> { return this.api.delete(`/users/${id}`); }
  assignRoles(id:string, roleIds:string[]): Observable<any> { return this.api.post(`/users/${id}/roles`, { roleIds }); }
  listRoles(): Observable<any> { return this.api.get('/roles'); }
}
