import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

/** Organismo: barra superior del panel con usuario y cierre de sesión. */
@Component({
  selector: 'cs-topbar',
  standalone: true,
  imports: [CommonModule],
  template: `
    <header class="cs-navbar topbar">
      <button class="menu-btn" (click)="toggleMenu.emit()" aria-label="Menú">
        <i class="bi bi-list"></i>
      </button>
      <div class="spacer"></div>
      <div class="user">
        <div class="avatar">{{ initials }}</div>
        <div class="meta">
          <strong>{{ name }}</strong>
          <small class="text-muted">Administrador</small>
        </div>
        <button class="cs-btn cs-btn-outline cs-btn-sm" (click)="logout.emit()">
          <i class="bi bi-box-arrow-right"></i> Salir
        </button>
      </div>
    </header>
  `,
  styles: [`
    .topbar { display: flex; align-items: center; gap: 1rem; padding: .6rem 1.25rem; }
    .spacer { flex: 1; }
    .menu-btn {
      background: none; border: none; font-size: 1.5rem; color: var(--cs-navy); cursor: pointer;
      display: none;
    }
    .user { display: flex; align-items: center; gap: .75rem; }
    .avatar {
      width: 38px; height: 38px; border-radius: 50%; display: grid; place-items: center;
      background: var(--cs-navy, #19559b); color: #fff; font-weight: 600;
    }
    .meta { display: flex; flex-direction: column; line-height: 1.1; }
    .meta small { font-size: .72rem; }
    @media (max-width: 900px) {
      .menu-btn { display: block; }
      .meta { display: none; }
    }
  `],
})
export class TopbarComponent {
  @Input() name = '';
  @Output() logout = new EventEmitter<void>();
  @Output() toggleMenu = new EventEmitter<void>();

  get initials(): string {
    return this.name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((p) => p[0]?.toUpperCase())
      .join('');
  }
}
