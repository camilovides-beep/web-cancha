import { CommonModule, CurrencyPipe } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Court } from '../../core/models';
import { CourtsService } from '../../core/services/courts.service';
import { BadgeComponent } from '../../ui/atoms/badge.component';
import { ButtonComponent } from '../../ui/atoms/button.component';
import { SpinnerComponent } from '../../ui/atoms/spinner.component';
import { EmptyStateComponent } from '../../ui/molecules/empty-state.component';
import { PageHeaderComponent } from '../../ui/molecules/page-header.component';

@Component({
  selector: 'cs-courts-list-page',
  standalone: true,
  imports: [
    CommonModule, CurrencyPipe, RouterLink, BadgeComponent, ButtonComponent,
    SpinnerComponent, EmptyStateComponent, PageHeaderComponent,
  ],
  template: `
    <cs-page-header title="Canchas y recursos" subtitle="Administra los espacios reservables">
      <a routerLink="/admin/courts/new"><cs-button icon="plus-lg">Nueva cancha</cs-button></a>
    </cs-page-header>

    <cs-spinner *ngIf="loading()"></cs-spinner>

    <div class="cs-card" *ngIf="!loading()">
      <div class="cs-table-wrap" *ngIf="courts().length; else empty"><table class="cs-table cs-table--striped">
        <thead>
          <tr><th>Nombre</th><th>Tipo</th><th>Sede</th><th>Tarifa noche (D)</th><th>Estado</th><th></th></tr>
        </thead>
        <tbody>
          <tr *ngFor="let c of courts()">
            <td><strong>{{ c.name }}</strong></td>
            <td>{{ c.sportType }}</td>
            <td>{{ c.venueName || '—' }}</td>
            <td>{{ (c.rates?.D?.night || c.hourlyRate) | currency:'COP':'symbol-narrow':'1.0-0' }}</td>
            <td><cs-badge [status]="c.status"></cs-badge></td>
            <td class="actions">
              <a [routerLink]="['/admin/courts', c.id]" class="icon-btn" title="Editar"><i class="bi bi-pencil"></i></a>
              <button class="icon-btn danger" title="Eliminar" (click)="remove(c)"><i class="bi bi-trash"></i></button>
            </td>
          </tr>
        </tbody>
      </table></div>
      <ng-template #empty>
        <cs-empty-state icon="geo-alt" title="Sin canchas" message="Crea tu primera cancha o recurso reservable.">
          <a routerLink="/admin/courts/new"><cs-button icon="plus-lg">Nueva cancha</cs-button></a>
        </cs-empty-state>
      </ng-template>
    </div>
  `,
  styles: [`
    .actions { text-align: right; white-space: nowrap; }
    .icon-btn {
      background: none; border: none; cursor: pointer; font-size: 1.05rem; padding: .35rem .5rem;
      color: var(--cs-navy, #19559b); border-radius: .4rem;
    }
    .icon-btn:hover { background: var(--cs-navy-50, #f0f4fa); }
    .icon-btn.danger { color: #c8373d; }
  `],
})
export class CourtsListPage implements OnInit {
  private readonly service = inject(CourtsService);
  readonly loading = signal(true);
  readonly courts = signal<Court[]>([]);

  ngOnInit(): void { this.load(); }

  private load(): void {
    this.loading.set(true);
    this.service.list().subscribe({
      next: (c) => { this.courts.set(c); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  remove(court: Court): void {
    if (!confirm(`¿Eliminar "${court.name}"?`)) return;
    this.service.remove(court.id).subscribe(() => this.load());
  }
}
