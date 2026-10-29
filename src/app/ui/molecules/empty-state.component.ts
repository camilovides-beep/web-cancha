import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

/** Molécula: estado vacío para listas sin datos. */
@Component({
  selector: 'cs-empty-state',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="empty">
      <i [class]="'bi bi-' + icon"></i>
      <p class="title">{{ title }}</p>
      <p *ngIf="message" class="text-muted">{{ message }}</p>
      <ng-content></ng-content>
    </div>
  `,
  styles: [`
    .empty { text-align: center; padding: 3rem 1rem; color: var(--cs-gray-600, #6c757d); }
    i { font-size: 2.5rem; color: var(--cs-navy-300, #6f93c2); }
    .title { font-weight: 600; color: var(--cs-navy-900, #0f3461); margin: .75rem 0 .25rem; }
  `],
})
export class EmptyStateComponent {
  @Input() icon = 'inbox';
  @Input() title = 'Sin datos';
  @Input() message?: string;
}
