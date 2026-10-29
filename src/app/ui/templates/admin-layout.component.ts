import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';
import { SettingsService } from '../../core/services/settings.service';
import { SidebarComponent } from '../organisms/sidebar.component';
import { TopbarComponent } from '../organisms/topbar.component';

/** Plantilla del panel: sidebar + topbar + contenido enrutado. */
@Component({
  selector: 'cs-admin-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, SidebarComponent, TopbarComponent],
  template: `
    <div class="layout" [class.open]="menuOpen()">
      <div class="backdrop" (click)="menuOpen.set(false)"></div>
      <div class="side"><cs-sidebar (navigate)="menuOpen.set(false)"></cs-sidebar></div>
      <div class="main">
        <cs-topbar [name]="auth.admin()?.name ?? ''"
                   (logout)="onLogout()"
                   (toggleMenu)="menuOpen.set(!menuOpen())"></cs-topbar>
        <main class="content"><router-outlet></router-outlet></main>
      </div>
    </div>
  `,
  styles: [`
    .layout { display: grid; grid-template-columns: 260px 1fr; min-height: 100vh; }
    .side { background: var(--cs-navy, #19559b); position: sticky; top: 0; height: 100vh; }
    .main { display: flex; flex-direction: column; min-width: 0; }
    .content { padding: 1.5rem; flex: 1; }
    .backdrop { display: none; }
    @media (max-width: 900px) {
      .layout { grid-template-columns: 1fr; }
      .content { padding: 1rem; }
      .side {
        position: fixed; z-index: 1001; width: 260px; transform: translateX(-100%);
        transition: transform .25s ease;
      }
      .layout.open .side { transform: translateX(0); }
      .layout.open .backdrop {
        display: block; position: fixed; inset: 0; background: rgba(0,0,0,.4); z-index: 1000;
      }
    }
  `],
})
export class AdminLayoutComponent implements OnInit {
  readonly menuOpen = signal(false);

  constructor(
    readonly auth: AuthService,
    private readonly settings: SettingsService,
    private readonly router: Router,
  ) {}

  ngOnInit(): void {
    this.settings.getBrand().subscribe({ error: () => undefined });
  }

  onLogout(): void {
    this.auth.logout();
    void this.router.navigate(['/login']);
  }
}
