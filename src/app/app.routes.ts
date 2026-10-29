import { Routes } from '@angular/router';
import { authGuard } from './core/auth/auth.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/public/landing.page').then((m) => m.LandingPage),
  },
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login.page').then((m) => m.LoginPage),
  },
  {
    path: 'admin',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./ui/templates/admin-layout.component').then((m) => m.AdminLayoutComponent),
    children: [
      { path: '', loadComponent: () => import('./pages/dashboard/dashboard.page').then((m) => m.DashboardPage) },
      { path: 'reservations', loadComponent: () => import('./pages/reservations/reservations.page').then((m) => m.ReservationsPage) },
      { path: 'payments', loadComponent: () => import('./pages/payments/payments.page').then((m) => m.PaymentsPage) },
      { path: 'courts', loadComponent: () => import('./pages/courts/courts-list.page').then((m) => m.CourtsListPage) },
      { path: 'courts/new', loadComponent: () => import('./pages/courts/court-form.page').then((m) => m.CourtFormPage) },
      { path: 'courts/:id', loadComponent: () => import('./pages/courts/court-form.page').then((m) => m.CourtFormPage) },
      { path: 'users', loadComponent: () => import('./pages/users/users.page').then((m) => m.UsersPage) },
      { path: 'analytics', loadComponent: () => import('./pages/analytics/analytics.page').then((m) => m.AnalyticsPage) },
      { path: 'settings', loadComponent: () => import('./pages/settings/settings.page').then((m) => m.SettingsPage) },
    ],
  },
  { path: '**', redirectTo: '' },
];
