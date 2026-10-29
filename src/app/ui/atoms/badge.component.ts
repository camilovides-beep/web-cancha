import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

type BadgeTone = 'navy' | 'sky' | 'green' | 'gray' | 'warning' | 'danger';

const STATUS_TONE: Record<string, BadgeTone> = {
  confirmed: 'green',
  paid: 'green',
  pending: 'warning',
  unpaid: 'gray',
  cancelled: 'danger',
  completed: 'navy',
  active: 'green',
  inactive: 'gray',
  maintenance: 'warning',
};

const STATUS_LABEL: Record<string, string> = {
  confirmed: 'Confirmada',
  pending: 'Pendiente',
  cancelled: 'Cancelada',
  completed: 'Completada',
  paid: 'Pagado',
  unpaid: 'Sin pagar',
  active: 'Activa',
  inactive: 'Inactiva',
  maintenance: 'Mantenimiento',
};

/** Átomo: etiqueta de estado con color según su significado. */
@Component({
  selector: 'cs-badge',
  standalone: true,
  imports: [CommonModule],
  template: `<span class="cs-badge" [class]="toneClass">{{ label }}</span>`,
  styles: [`
    .warning { background: #fdf0d5; color: #8a6400; }
    .danger { background: #f8dcdd; color: #a32a30; }
  `],
})
export class BadgeComponent {
  @Input() status?: string;
  @Input() tone?: BadgeTone;
  @Input() text?: string;

  get toneClass(): string {
    const tone = this.tone ?? (this.status ? STATUS_TONE[this.status] : undefined) ?? 'gray';
    return tone === 'warning' || tone === 'danger' ? tone : `cs-badge-${tone}`;
  }

  get label(): string {
    return this.text ?? (this.status ? STATUS_LABEL[this.status] ?? this.status : '');
  }
}
