import { Injectable } from '@angular/core';
import { ApiService } from '../../core/services/api.service';
import { Observable } from 'rxjs';
import { Student, PaginatedResponse } from '../../shared/interfaces/api.interface';

@Injectable({ providedIn: 'root' })
export class StudentsService {
  constructor(private api: ApiService) {}
  list(params?: any): Observable<PaginatedResponse<Student>> { return this.api.get('/students', params); }
  get(id: string): Observable<Student> { return this.api.get(`/students/${id}`); }
  create(body: any): Observable<Student> { return this.api.post('/students', body); }
  update(id: string, body: any): Observable<Student> { return this.api.patch(`/students/${id}`, body); }
  assignAdvisor(id: string, advisorId: string): Observable<Student> { return this.api.post(`/students/${id}/advisor`, { advisorId }); }
  addObservation(id: string, observation: string): Observable<any> { return this.api.post(`/students/${id}/observations`, { observation }); }
  getObservations(id: string): Observable<any> { return this.api.get(`/students/${id}/observations`); }
}
