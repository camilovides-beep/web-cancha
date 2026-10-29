import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Reservation, ReservationStatus } from '../../core/models';
import { ReservationsService } from '../../core/services/reservations.service';
import { BadgeComponent } from '../../ui/atoms/badge.component';
import { SpinnerComponent } from '../../ui/atoms/spinner.component';
import { EmptyStateComponent } from '../../ui/molecules/empty-state.component';
import { PageHeaderComponent } from '../../ui/molecules/page-header.component';

@Component({
  selector: 'cs-reservations-page',
  standalone: true,
  imports: [
    CommonModule, CurrencyPipe, DatePipe, FormsModule,
    BadgeComponent, SpinnerComponent, EmptyStateComponent, PageHeaderComponent,
  ],
  template: `
    <cs-page-header title="Reservas" subtitle="Gestiona las reservas de todos los recursos"></cs-page-header>

    <div class="cs-card filters">
      <div>
        <label class="cs-label">Fecha</label>
        <input type="date" class="cs-input" [(ngModel)]="date" (change)="load()" />
      </div>
      <div>
        <label class="cs-label">Estado</label>
        <select class="cs-select" [(ngModel)]="status" (change)="load()">
          <option value="">Todos</option>
          <option value="pending">Pendiente</option>
          <option value="confirmed">Confirmada</option>
          <option value="cancelled">Cancelada</option>
          <option value="completed">Completada</option>
        </select>
      </div>
      <button class="cs-btn cs-btn-ghost" (click)="clear()"><i class="bi bi-x-circle"></i> Limpiar</button>
    </div>

    <cs-spinner *ngIf="loading()"></cs-spinner>

    <div class="cs-card mt-2" *ngIf="!loading()">
      <table class="cs-table cs-table--striped" *ngIf="items().length; else empty">
        <thead>
          <tr><th>Cancha</th><th>Cliente</th><th>Inicio</th><th>Horas</th><th>Estado</th><th>Pago</th><th class="right">Total</th><th></th></tr>
        </thead>
        <tbody>
          <tr *ngFor="let r of items()">
            <td>{{ r.courtName }}</td>
            <td>
              <strong>{{ r.userName }}</strong>
              <small class="text-muted d-block">Cat. {{ r.userCategory }}</small>
            </td>
            <td>{{ r.startTime | date:'short' }}</td>
            <td>{{ r.durationHours }}</td>
            <td><cs-badge [status]="r.status"></cs-badge></td>
            <td><cs-badge [status]="r.paymentStatus"></cs-badge></td>
            <td class="right">{{ r.totalAmount | currency:'COP':'symbol-narrow':'1.0-0' }}</td>
            <td class="actions">
              <button *ngIf="r.status !== 'confirmed'" class="icon-btn ok" title="Confirmar"
                      (click)="setStatus(r, 'confirmed')"><i class="bi bi-check-circle"></i></button>
              <button *ngIf="r.status !== 'cancelled'" class="icon-btn danger" title="Cancelar"
                      (click)="setStatus(r, 'cancelled')"><i class="bi bi-x-circle"></i></button>
            </td>
          </tr>
        </tbody>
      </table>
      <ng-template #empty>
        <cs-empty-state icon="calendar-x" title="Sin reservas" message="No hay reservas para el filtro seleccionado."></cs-empty-state>
      </ng-template>
    </div>
  `,
  styles: [`
    .filters { display: flex; gap: 1rem; align-items: flex-end; flex-wrap: wrap; }
    .right { text-align: right; } .actions { text-align: right; white-space: nowrap; }
    .d-block { display: block; }
    .icon-btn { background: none; border: none; cursor: pointer; font-size: 1.1rem; padding: .3rem .45rem; border-radius: .4rem; }
    .icon-btn.ok { color: #789a19; } .icon-btn.danger { color: #c8373d; }
    .icon-btn:hover { background: var(--cs-navy-50, #f0f4fa); }
  `],
})
export class ReservationsPage implements OnInit {
  private readonly service = inject(ReservationsService);
  readonly loading = signal(true);
  readonly items = signal<Reservation[]>([]);
  date = '';
  status = '';

  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading.set(true);
    this.service.list({ date: this.date || undefined, status: this.status || undefined }).subscribe({
      next: (r) => { this.items.set(r); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  clear(): void { this.date = ''; this.status = ''; this.load(); }

  setStatus(r: Reservation, status: ReservationStatus): void {
    this.service.updateStatus(r.id, status).subscribe(() => this.load());
  }
}
