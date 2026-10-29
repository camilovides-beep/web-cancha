import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

/** Molécula: encabezado de página con título, subtítulo y acciones. */
@Component({
  selector: 'cs-page-header',
  standalone: true,
  imports: [CommonModule],
  template: `
    <header class="header">
      <div>
        <h1>{{ title }}</h1>
        <p *ngIf="subtitle" class="text-muted">{{ subtitle }}</p>
      </div>
      <div class="actions"><ng-content></ng-content></div>
    </header>
  `,
  styles: [`
    .header {
      display: flex; justify-content: space-between; align-items: center;
      gap: 1rem; flex-wrap: wrap; margin-bottom: 1.5rem;
    }
    h1 { margin: 0; font-size: 1.5rem; }
    p { margin: .25rem 0 0; }
    .actions { display: flex; gap: .5rem; flex-wrap: wrap; }
  `],
})
export class PageHeaderComponent {
  @Input() title = '';
  @Input() subtitle?: string;
}
