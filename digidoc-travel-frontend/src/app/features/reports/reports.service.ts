import { Injectable } from '@angular/core';
import { ApiService } from '../../core/services/api.service';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ReportsService {
  constructor(private api: ApiService) {}
  students(params?: any): Observable<any> { return this.api.get('/reports/students', params); }
  documents(params?: any): Observable<any> { return this.api.get('/reports/documents', params); }
  visas(params?: any): Observable<any> { return this.api.get('/reports/visas', params); }
  payments(params?: any): Observable<any> { return this.api.get('/reports/payments', params); }
  export(type:string, format:'pdf'|'excel'): Observable<any> { return this.api.get(`/reports/export/${type}`, { format }); }
}
