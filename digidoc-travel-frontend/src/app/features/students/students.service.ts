import { Injectable } from '@angular/core';
import { ApiService } from '../../core/services/api.service';
import { Observable, map } from 'rxjs';
import { Student, PaginatedResponse } from '../../shared/interfaces/api.interface';

@Injectable({ providedIn: 'root' })
export class StudentsService {
  constructor(private api: ApiService) {}
  // Desenvuelve {success,data,timestamp} del ResponseInterceptor para que el componente reciba PaginatedResponse directo
  list(params?: any): Observable<PaginatedResponse<Student>> {
    return this.api.get<any>('/students', params).pipe(
      map((res: any) => {
        if (res && typeof res === 'object' && 'success' in res && 'data' in res) return res.data as PaginatedResponse<Student>;
        return res as PaginatedResponse<Student>;
      })
    );
  }
  get(id: string): Observable<Student> {
    return this.api.get<any>(`/students/${id}`).pipe(map((res: any) => (res && 'data' in res && 'success' in res ? res.data : res) as Student));
  }
  create(body: any): Observable<Student> { return this.api.post('/students', body); }
  update(id: string, body: any): Observable<Student> { return this.api.patch(`/students/${id}`, body); }
  remove(id: string): Observable<{ message: string }> { return this.api.delete(`/students/${id}`); }
  assignAdvisor(id: string, advisorId: string): Observable<Student> { return this.api.post(`/students/${id}/advisor`, { advisorId }); }
  addObservation(id: string, observation: string): Observable<any> { return this.api.post(`/students/${id}/observations`, { observation }); }
  getObservations(id: string): Observable<any> {
    return this.api.get<any>(`/students/${id}/observations`).pipe(
      map((res: any) => (res && 'data' in res && 'success' in res ? res.data : res))
    );
  }
}
