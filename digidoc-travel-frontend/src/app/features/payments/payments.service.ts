import { Injectable } from '@angular/core';
import { ApiService } from '../../core/services/api.service';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class PaymentsService {
  constructor(private api: ApiService) {}
  list(params?: any): Observable<any> { return this.api.get('/payment-plans', params); }
  get(id:string): Observable<any> { return this.api.get(`/payment-plans/${id}`); }
  create(body:any): Observable<any> { return this.api.post('/payment-plans', body); }
  installments(planId:string): Observable<any> { return this.api.get(`/payment-plans/${planId}/installments`); }
  pay(installmentId:string, body:any): Observable<any> { return this.api.post(`/installments/${installmentId}/pay`, body); }
  pending(): Observable<any> { return this.api.get('/payment-plans/pending'); }
}
