import { HttpClient } from '@angular/common/http';
import { Injectable, computed, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Admin, LoginResponse } from '../models';

const TOKEN_KEY = 'cancha_token';
const ADMIN_KEY = 'cancha_admin';

/** Servicio de autenticación: login, almacenamiento de token y sesión reactiva. */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly _admin = signal<Admin | null>(this.readStoredAdmin());
  readonly admin = this._admin.asReadonly();
  readonly isAuthenticated = computed(() => this._admin() !== null && !!this.token);

  constructor(private readonly http: HttpClient) {}

  get token(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  login(username: string, password: string): Observable<LoginResponse> {
    return this.http
      .post<LoginResponse>(`${environment.apiUrl}/auth/login`, { username, password })
      .pipe(
        tap((res) => {
          localStorage.setItem(TOKEN_KEY, res.accessToken);
          localStorage.setItem(ADMIN_KEY, JSON.stringify(res.admin));
          this._admin.set(res.admin);
        }),
      );
  }

  logout(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(ADMIN_KEY);
    this._admin.set(null);
  }

  private readStoredAdmin(): Admin | null {
    try {
      const raw = localStorage.getItem(ADMIN_KEY);
      return raw ? (JSON.parse(raw) as Admin) : null;
    } catch {
      return null;
    }
  }
}
