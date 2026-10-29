import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { User } from '../models';

@Injectable({ providedIn: 'root' })
export class UsersService {
  private readonly base = `${environment.apiUrl}/users`;
  constructor(private readonly http: HttpClient) {}

  list(): Observable<User[]> {
    return this.http.get<User[]>(this.base);
  }
  get(id: string): Observable<User> {
    return this.http.get<User>(`${this.base}/${id}`);
  }
  create(payload: Partial<User>): Observable<User> {
    return this.http.post<User>(this.base, payload);
  }
  update(id: string, payload: Partial<User>): Observable<User> {
    return this.http.patch<User>(`${this.base}/${id}`, payload);
  }
  remove(id: string): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }
}
