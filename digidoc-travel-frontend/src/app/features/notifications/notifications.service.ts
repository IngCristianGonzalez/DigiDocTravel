import { Injectable } from '@angular/core';
import { ApiService } from '../../core/services/api.service';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class NotificationsService {
  constructor(private api: ApiService) {}
  list(params?: any): Observable<any> { return this.api.get('/notifications', params); }
  unread(): Observable<any> { return this.api.get('/notifications/unread'); }
  markRead(id:string): Observable<any> { return this.api.patch(`/notifications/${id}/read`, {}); }
  markAll(): Observable<any> { return this.api.patch('/notifications/read-all', {}); }
}
