import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Court } from '../models';

@Injectable({ providedIn: 'root' })
export class CourtsService {
  private readonly base = `${environment.apiUrl}/courts`;
  constructor(private readonly http: HttpClient) {}

  list(): Observable<Court[]> {
    return this.http.get<Court[]>(this.base);
  }
  get(id: string): Observable<Court> {
    return this.http.get<Court>(`${this.base}/${id}`);
  }
  create(payload: Partial<Court>): Observable<Court> {
    return this.http.post<Court>(this.base, payload);
  }
  update(id: string, payload: Partial<Court>): Observable<Court> {
    return this.http.patch<Court>(`${this.base}/${id}`, payload);
  }
  remove(id: string): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }
}
