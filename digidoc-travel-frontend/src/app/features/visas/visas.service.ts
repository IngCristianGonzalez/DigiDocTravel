import { Injectable } from '@angular/core';
import { ApiService } from '../../core/services/api.service';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class VisasService {
  constructor(private api: ApiService) {}
  list(params?: any): Observable<any> { return this.api.get('/visas', params); }
  create(body:any): Observable<any> { return this.api.post('/visas', body); }
  update(id:string, body:any): Observable<any> { return this.api.patch(`/visas/${id}`, body); }
  get(id:string): Observable<any> { return this.api.get(`/visas/${id}`); }
  expiring(days=90): Observable<any> { return this.api.get('/visas/expiring', { days }); }
}
