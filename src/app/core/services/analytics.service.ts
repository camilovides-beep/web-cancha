import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AnalyticsSummary, DailyPoint, MonthlyPoint, TopCourt } from '../models';

@Injectable({ providedIn: 'root' })
export class AnalyticsService {
  private readonly base = `${environment.apiUrl}/analytics`;
  constructor(private readonly http: HttpClient) {}

  private range(start?: string, end?: string): HttpParams {
    let params = new HttpParams();
    if (start) params = params.set('start', start);
    if (end) params = params.set('end', end);
    return params;
  }

  summary(start?: string, end?: string): Observable<AnalyticsSummary> {
    return this.http.get<AnalyticsSummary>(`${this.base}/summary`, { params: this.range(start, end) });
  }
  reservationsByDay(start?: string, end?: string): Observable<DailyPoint[]> {
    return this.http.get<DailyPoint[]>(`${this.base}/reservations-by-day`, { params: this.range(start, end) });
  }
  revenueByMonth(year?: number): Observable<MonthlyPoint[]> {
    const params = year ? new HttpParams().set('year', String(year)) : new HttpParams();
    return this.http.get<MonthlyPoint[]>(`${this.base}/revenue-by-month`, { params });
  }
  topCourts(start?: string, end?: string): Observable<TopCourt[]> {
    return this.http.get<TopCourt[]>(`${this.base}/top-courts`, { params: this.range(start, end) });
  }
}
