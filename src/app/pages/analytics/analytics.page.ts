import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { forkJoin } from 'rxjs';
import { AnalyticsSummary, DailyPoint, TopCourt } from '../../core/models';
import { AnalyticsService } from '../../core/services/analytics.service';
import { SpinnerComponent } from '../../ui/atoms/spinner.component';
import { StatTileComponent } from '../../ui/atoms/stat-tile.component';
import { PageHeaderComponent } from '../../ui/molecules/page-header.component';

@Component({
  selector: 'cs-analytics-page',
  standalone: true,
  imports: [CommonModule, CurrencyPipe, DatePipe, SpinnerComponent, StatTileComponent, PageHeaderComponent],
  template: `
    <cs-page-header title="Analítica" subtitle="Indicadores de los últimos 30 días"></cs-page-header>

    <cs-spinner *ngIf="loading()"></cs-spinner>

    <ng-container *ngIf="!loading() && summary() as s">
      <div class="grid grid-4">
        <cs-stat-tile label="Reservas" [value]="s.totalReservations" icon="calendar-check" tone="navy"></cs-stat-tile>
        <cs-stat-tile label="Ingresos" [value]="s.totalRevenue | currency:'COP':'symbol-narrow':'1.0-0'" icon="cash-coin"></cs-stat-tile>
        <cs-stat-tile label="Clientes" [value]="s.totalUsers" icon="people" tone="green"></cs-stat-tile>
        <cs-stat-tile label="Ocupación" [value]="s.occupancyRate + '%'" icon="graph-up"></cs-stat-tile>
      </div>

      <div class="grid grid-2 mt-3">
        <div class="cs-card">
          <h3>Reservas por día</h3>
          <div class="chart" *ngIf="daily().length; else noDaily">
            <div class="bar-col" *ngFor="let d of daily()">
              <div class="bar" [style.height.%]="barHeight(d.count)" [title]="d.count + ' reservas'"></div>
              <small>{{ d.date | date:'dd/MM' }}</small>
            </div>
          </div>
          <ng-template #noDaily><p class="text-muted">Sin datos en el período.</p></ng-template>
        </div>

        <div class="cs-card">
          <h3>Canchas más reservadas</h3>
          <div class="cs-table-wrap" *ngIf="top().length; else noTop"><table class="cs-table">
            <thead><tr><th>Cancha</th><th>Reservas</th><th class="right">Ingresos</th></tr></thead>
            <tbody>
              <tr *ngFor="let c of top()">
                <td>{{ c.name }}</td>
                <td>{{ c.reservationCount }}</td>
                <td class="right">{{ c.revenue | currency:'COP':'symbol-narrow':'1.0-0' }}</td>
              </tr>
            </tbody>
          </table></div>
          <ng-template #noTop><p class="text-muted">Sin datos en el período.</p></ng-template>
        </div>
      </div>
    </ng-container>
  `,
  styles: [`
    h3 { margin-top: 0; }
    .right { text-align: right; }
    .chart { display: flex; align-items: flex-end; gap: .4rem; height: 200px; padding-top: 1rem; }
    .bar-col { flex: 1; display: flex; flex-direction: column; align-items: center; gap: .35rem; height: 100%; justify-content: flex-end; }
    .bar {
      width: 100%; min-height: 4px; border-radius: .4rem .4rem 0 0;
      background: var(--cs-gradient, linear-gradient(180deg, #1fb5e5, #19559b));
    }
    .bar-col small { font-size: .65rem; color: var(--cs-gray-600, #6c757d); }
  `],
})
export class AnalyticsPage implements OnInit {
  private readonly service = inject(AnalyticsService);

  readonly loading = signal(true);
  readonly summary = signal<AnalyticsSummary | null>(null);
  readonly daily = signal<DailyPoint[]>([]);
  readonly top = signal<TopCourt[]>([]);
  private readonly maxCount = computed(() => Math.max(1, ...this.daily().map((d) => d.count)));

  ngOnInit(): void {
    forkJoin({
      summary: this.service.summary(),
      daily: this.service.reservationsByDay(),
      top: this.service.topCourts(),
    }).subscribe({
      next: ({ summary, daily, top }) => {
        this.summary.set(summary);
        this.daily.set(daily);
        this.top.set(top);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  barHeight(count: number): number {
    return Math.round((count / this.maxCount()) * 100);
  }
}
