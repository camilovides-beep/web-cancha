import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

/** Átomo: botón con las variantes de la marca Comfasucre. */
@Component({
  selector: 'cs-button',
  standalone: true,
  imports: [CommonModule],
  template: `
    <button
      [type]="type"
      [disabled]="disabled || loading"
      [class]="classes"
      (click)="clicked.emit($event)"
    >
      <span *ngIf="loading" class="spinner" aria-hidden="true"></span>
      <i *ngIf="icon && !loading" [class]="'bi bi-' + icon"></i>
      <ng-content></ng-content>
    </button>
  `,
  styles: [`
    button { display: inline-flex; align-items: center; justify-content: center; gap: .5rem; }
    .block { width: 100%; }
    .spinner {
      width: 1em; height: 1em; border: 2px solid currentColor; border-right-color: transparent;
      border-radius: 50%; display: inline-block; animation: spin .6s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
  `],
})
export class ButtonComponent {
  @Input() variant: 'primary' | 'secondary' | 'outline' | 'ghost' | 'accent' = 'primary';
  @Input() size: 'sm' | 'md' | 'lg' = 'md';
  @Input() type: 'button' | 'submit' = 'button';
  @Input() disabled = false;
  @Input() loading = false;
  @Input() block = false;
  @Input() icon?: string;
  @Output() clicked = new EventEmitter<Event>();

  get classes(): string {
    const parts = ['cs-btn', `cs-btn-${this.variant}`];
    if (this.size === 'sm') parts.push('cs-btn-sm');
    if (this.size === 'lg') parts.push('cs-btn-lg');
    if (this.block) parts.push('block');
    return parts.join(' ');
  }
}
