import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { User } from '../../core/models';
import { UsersService } from '../../core/services/users.service';
import { BadgeComponent } from '../../ui/atoms/badge.component';
import { ButtonComponent } from '../../ui/atoms/button.component';
import { SpinnerComponent } from '../../ui/atoms/spinner.component';
import { EmptyStateComponent } from '../../ui/molecules/empty-state.component';
import { PageHeaderComponent } from '../../ui/molecules/page-header.component';

@Component({
  selector: 'cs-users-page',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, BadgeComponent, ButtonComponent,
    SpinnerComponent, EmptyStateComponent, PageHeaderComponent,
  ],
  template: `
    <cs-page-header title="Usuarios" subtitle="Clientes y afiliados">
      <cs-button icon="person-plus" (clicked)="openNew()">Nuevo usuario</cs-button>
    </cs-page-header>

    <div class="cs-card mb-2" *ngIf="showForm()">
      <h3>{{ editing() ? 'Editar usuario' : 'Nuevo usuario' }}</h3>
      <form [formGroup]="form" (ngSubmit)="save()">
        <div class="grid grid-3">
          <div><label class="cs-label">Nombre</label><input class="cs-input" formControlName="name" /></div>
          <div><label class="cs-label">Correo</label><input class="cs-input" type="email" formControlName="email" /></div>
          <div><label class="cs-label">Teléfono</label><input class="cs-input" formControlName="phone" /></div>
          <div><label class="cs-label">Documento</label><input class="cs-input" formControlName="documentNumber" /></div>
          <div>
            <label class="cs-label">Categoría</label>
            <select class="cs-select" formControlName="category">
              <option value="A">A</option><option value="B">B</option>
              <option value="C">C</option><option value="D">D</option>
            </select>
          </div>
          <div>
            <label class="cs-label">Estado</label>
            <select class="cs-select" formControlName="status">
              <option value="active">Activo</option><option value="inactive">Inactivo</option>
            </select>
          </div>
        </div>
        <div *ngIf="error()" class="cs-alert cs-alert-danger mt-2">{{ error() }}</div>
        <div class="flex gap-1 mt-2">
          <cs-button type="submit" [loading]="saving()" [disabled]="form.invalid" icon="check-lg">Guardar</cs-button>
          <cs-button variant="outline" (clicked)="closeForm()">Cancelar</cs-button>
        </div>
      </form>
    </div>

    <cs-spinner *ngIf="loading()"></cs-spinner>

    <div class="cs-card" *ngIf="!loading()">
      <div class="cs-table-wrap" *ngIf="users().length; else empty"><table class="cs-table cs-table--striped">
        <thead><tr><th>Nombre</th><th>Correo</th><th>Teléfono</th><th>Documento</th><th>Categoría</th><th>Estado</th><th></th></tr></thead>
        <tbody>
          <tr *ngFor="let u of users()">
            <td><strong>{{ u.name }}</strong></td>
            <td>{{ u.email }}</td>
            <td>{{ u.phone || '—' }}</td>
            <td>{{ u.documentNumber || '—' }}</td>
            <td><cs-badge tone="navy" [text]="'Cat. ' + u.category"></cs-badge></td>
            <td><cs-badge [status]="u.status"></cs-badge></td>
            <td class="actions">
              <button class="icon-btn" (click)="openEdit(u)" title="Editar"><i class="bi bi-pencil"></i></button>
              <button class="icon-btn danger" (click)="remove(u)" title="Eliminar"><i class="bi bi-trash"></i></button>
            </td>
          </tr>
        </tbody>
      </table></div>
      <ng-template #empty><cs-empty-state icon="people" title="Sin usuarios"></cs-empty-state></ng-template>
    </div>
  `,
  styles: [`
    h3 { margin-top: 0; }
    .actions { text-align: right; white-space: nowrap; }
    .icon-btn { background: none; border: none; cursor: pointer; font-size: 1.05rem; padding: .35rem .5rem; color: var(--cs-navy); border-radius: .4rem; }
    .icon-btn:hover { background: var(--cs-navy-50, #f0f4fa); } .icon-btn.danger { color: #c8373d; }
  `],
})
export class UsersPage implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly service = inject(UsersService);

  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly users = signal<User[]>([]);
  readonly showForm = signal(false);
  readonly editing = signal<User | null>(null);
  readonly error = signal<string | null>(null);

  readonly form = this.fb.nonNullable.group({
    name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    phone: [''],
    documentNumber: [''],
    category: ['D'],
    status: ['active'],
  });

  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading.set(true);
    this.service.list().subscribe({
      next: (u) => { this.users.set(u); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  openNew(): void {
    this.editing.set(null);
    this.form.reset({ name: '', email: '', phone: '', documentNumber: '', category: 'D', status: 'active' });
    this.error.set(null);
    this.showForm.set(true);
  }

  openEdit(u: User): void {
    this.editing.set(u);
    this.form.reset({
      name: u.name, email: u.email, phone: u.phone ?? '', documentNumber: u.documentNumber ?? '',
      category: u.category, status: u.status,
    });
    this.error.set(null);
    this.showForm.set(true);
  }

  closeForm(): void { this.showForm.set(false); }

  save(): void {
    if (this.form.invalid) return;
    this.saving.set(true);
    this.error.set(null);
    const payload = this.form.getRawValue() as unknown as Partial<User>;
    const current = this.editing();
    const req = current ? this.service.update(current.id, payload) : this.service.create(payload);
    req.subscribe({
      next: () => { this.saving.set(false); this.showForm.set(false); this.load(); },
      error: (err) => { this.saving.set(false); this.error.set(err?.error?.message ?? 'No se pudo guardar'); },
    });
  }

  remove(u: User): void {
    if (!confirm(`¿Eliminar a "${u.name}"? Sus reservas se conservarán anonimizadas.`)) return;
    this.service.remove(u.id).subscribe(() => this.load());
  }
}
