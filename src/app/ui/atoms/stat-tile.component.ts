import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

/** Átomo: tarjeta de métrica (KPI) con borde izquierdo de color. */
@Component({
  selector: 'cs-stat-tile',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="cs-stat" [class.cs-stat--navy]="tone === 'navy'" [class.cs-stat--green]="tone === 'green'">
      <div class="head">
        <span class="cs-stat-label">{{ label }}</span>
        <i *ngIf="icon" [class]="'bi bi-' + icon"></i>
      </div>
      <div class="cs-stat-value">{{ value }}</div>
      <div *ngIf="hint" class="hint">{{ hint }}</div>
    </div>
  `,
  styles: [`
    .head { display: flex; justify-content: space-between; align-items: center; }
    .head i { font-size: 1.25rem; color: var(--cs-sky, #1fb5e5); opacity: .85; }
    .hint { font-size: .8rem; color: var(--cs-gray-600, #6c757d); margin-top: .25rem; }
  `],
})
export class StatTileComponent {
  @Input() label = '';
  @Input() value: string | number | null = '';
  @Input() hint?: string;
  @Input() icon?: string;
  @Input() tone: 'navy' | 'sky' | 'green' = 'sky';
}
