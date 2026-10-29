import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Brand, Court, PriceQuote, Reservation } from '../models';
import { CreateReservationPayload, QuotePayload } from './reservations.service';

/** Endpoints públicos (sin autenticación) para el portal. */
@Injectable({ providedIn: 'root' })
export class PublicService {
  private readonly base = `${environment.apiUrl}/public`;
  constructor(private readonly http: HttpClient) {}

  brand(): Observable<Brand> {
    return this.http.get<Brand>(`${this.base}/brand`);
  }
  courts(): Observable<Court[]> {
    return this.http.get<Court[]>(`${this.base}/courts`);
  }
  quote(payload: QuotePayload): Observable<PriceQuote> {
    return this.http.post<PriceQuote>(`${this.base}/reservations/quote`, payload);
  }
  createReservation(payload: CreateReservationPayload): Observable<Reservation> {
    return this.http.post<Reservation>(`${this.base}/reservations`, payload);
  }
  sendVerification(id: string): Observable<{ sent: boolean; expiresAt: string }> {
    return this.http.post<{ sent: boolean; expiresAt: string }>(
      `${this.base}/reservations/${id}/send-verification`, {},
    );
  }
  verify(id: string, code: string): Observable<Reservation> {
    return this.http.post<Reservation>(`${this.base}/reservations/${id}/verify`, { code });
  }
  /** Inicia el pago y devuelve la URL del checkout de ePayco. */
  initPayment(id: string): Observable<{ reference: string; checkoutUrl: string; status: string }> {
    return this.http.post<{ reference: string; checkoutUrl: string; status: string }>(
      `${this.base}/reservations/${id}/payment`, {},
    );
  }
}
