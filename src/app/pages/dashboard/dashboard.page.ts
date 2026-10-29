import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { AnalyticsService } from '../../core/services/analytics.service';
import { ReservationsService } from '../../core/services/reservations.service';
import { AnalyticsSummary, Reservation } from '../../core/models';
import { BadgeComponent } from '../../ui/atoms/badge.component';
import { SpinnerComponent } from '../../ui/atoms/spinner.component';
import { StatTileComponent } from '../../ui/atoms/stat-tile.component';
import { PageHeaderComponent } from '../../ui/molecules/page-header.component';

@Component({
  selector: 'cs-dashboard-page',
  standalone: true,
  imports: [
    CommonModule, CurrencyPipe, DatePipe, RouterLink,
    StatTileComponent, SpinnerComponent, BadgeComponent, PageHeaderComponent,
  ],
  template: `
    <cs-page-header title="Dashboard" subtitle="Resumen de los últimos 30 días"></cs-page-header>

    <cs-spinner *ngIf="loading()"></cs-spinner>

    <ng-container *ngIf="!loading() && summary() as s">
      <div class="grid grid-4">
        <cs-stat-tile label="Reservas" [value]="s.totalReservations" icon="calendar-check" tone="navy"></cs-stat-tile>
        <cs-stat-tile label="Confirmadas" [value]="s.confirmed" icon="check-circle" tone="green"></cs-stat-tile>
        <cs-stat-tile label="Ingresos confirmados" [value]="s.confirmedRevenue | currency:'COP':'symbol-narrow':'1.0-0'" icon="cash-coin"></cs-stat-tile>
        <cs-stat-tile label="Ocupación" [value]="s.occupancyRate + '%'" icon="graph-up" tone="green"></cs-stat-tile>
      </div>

      <div class="cs-card mt-3">
        <div class="cs-card-header flex-between">
          <h3>Reservas recientes</h3>
          <a routerLink="/admin/reservations" class="cs-text-sky">Ver todas →</a>
        </div>
        <table class="cs-table cs-table--striped" *ngIf="recent().length; else noData">
          <thead>
            <tr><th>Cancha</th><th>Cliente</th><th>Inicio</th><th>Estado</th><th class="right">Total</th></tr>
          </thead>
          <tbody>
            <tr *ngFor="let r of recent()">
              <td>{{ r.courtName }}</td>
              <td>{{ r.userName }}</td>
              <td>{{ r.startTime | date:'short' }}</td>
              <td><cs-badge [status]="r.status"></cs-badge></td>
              <td class="right">{{ r.totalAmount | currency:'COP':'symbol-narrow':'1.0-0' }}</td>
            </tr>
          </tbody>
        </table>
        <ng-template #noData><p class="text-muted text-center mt-2">Aún no hay reservas.</p></ng-template>
      </div>
    </ng-container>
  `,
  styles: [`.right { text-align: right; } .cs-card-header h3 { margin: 0; }`],
})
export class DashboardPage implements OnInit {
  private readonly analytics = inject(AnalyticsService);
  private readonly reservations = inject(ReservationsService);

  readonly loading = signal(true);
  readonly summary = signal<AnalyticsSummary | null>(null);
  readonly recent = signal<Reservation[]>([]);

  ngOnInit(): void {
    forkJoin({
      summary: this.analytics.summary(),
      recent: this.reservations.list(),
    }).subscribe({
      next: ({ summary, recent }) => {
        this.summary.set(summary);
        this.recent.set(recent.slice(0, 6));
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }
}
