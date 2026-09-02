import { Injectable } from '@angular/core';
import { ApiService } from '../../core/services/api.service';
import { Observable } from 'rxjs';
import { DashboardSummary } from '../../shared/interfaces/api.interface';

@Injectable({ providedIn: 'root' })
export class DashboardService {
  constructor(private api: ApiService) {}
  getSummary(): Observable<DashboardSummary> { return this.api.get<DashboardSummary>('/dashboard/summary'); }
  getUpcomingEvents(): Observable<any> { return this.api.get('/dashboard/events'); }
  getPendingDocs(): Observable<any> { return this.api.get('/dashboard/documents'); }
  getExpiringVisas(): Observable<any> { return this.api.get('/dashboard/visas'); }
}
