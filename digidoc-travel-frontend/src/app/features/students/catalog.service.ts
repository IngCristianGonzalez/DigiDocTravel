import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { ApiService } from '../../core/services/api.service';

export interface CatalogUniversity {
  id: string;
  name: string;
}

export interface CatalogCountry {
  id: string;
  code: string;
  name: string;
  dialCode: string;
  flag: string;
  universities: CatalogUniversity[];
}

@Injectable({ providedIn: 'root' })
export class CatalogService {
  constructor(private api: ApiService) {}

  listCountries(): Observable<CatalogCountry[]> {
    return this.api
      .get<{ success: boolean; data: CatalogCountry[] }>('/countries')
      .pipe(map((res: any) => (Array.isArray(res) ? res : (res?.data ?? []))));
  }
}
