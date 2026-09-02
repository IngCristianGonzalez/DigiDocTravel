import { Injectable } from '@angular/core';
import { ApiService } from '../../core/services/api.service';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class EventsService {
  constructor(private api: ApiService) {}
  list(params?: any): Observable<any> { return this.api.get('/events', params); }
  get(id:string): Observable<any> { return this.api.get(`/events/${id}`); }
  create(body:any): Observable<any> { return this.api.post('/events', body); }
  update(id:string, body:any): Observable<any> { return this.api.patch(`/events/${id}`, body); }
  getQr(id:string): Observable<any> { return this.api.get(`/events/${id}/qr`); }
}
