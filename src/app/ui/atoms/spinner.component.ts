import { Component, Input } from '@angular/core';

/** Átomo: indicador de carga con el color de marca. */
@Component({
  selector: 'cs-spinner',
  standalone: true,
  template: `<span class="spinner" [style.width.px]="size" [style.height.px]="size"></span>`,
  styles: [`
    :host { display: inline-flex; align-items: center; justify-content: center; padding: 1rem; }
    .spinner {
      border: 3px solid var(--cs-navy-100, #dce6f3);
      border-top-color: var(--cs-navy, #19559b);
      border-radius: 50%;
      display: inline-block;
      animation: spin .7s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
  `],
})
export class SpinnerComponent {
  @Input() size = 28;
}
