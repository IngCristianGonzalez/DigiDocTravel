import { Injectable } from '@angular/core';
import { ApiService } from '../../core/services/api.service';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class DocumentsService {
  constructor(private api: ApiService) {}
  list(params?: any): Observable<any> { return this.api.get('/documents', params); }
  get(id:string): Observable<any> { return this.api.get(`/documents/${id}`); }
  create(body:any): Observable<any> { return this.api.post('/documents', body); }
  update(id:string, body:any): Observable<any> { return this.api.patch(`/documents/${id}`, body); }
  remove(id:string): Observable<any> { return this.api.delete(`/documents/${id}`); }
  upload(file: File): Observable<any> {
    const fd = new FormData(); fd.append('file', file);
    return this.api.upload('/documents/upload', fd);
  }
  download(id:string): Observable<any> { return this.api.get(`/documents/${id}/download`); }
  history(id:string): Observable<any> { return this.api.get(`/documents/${id}/history`); }
}
