import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Category, Court, TimeSlot } from '../../core/models';
import { CourtsService } from '../../core/services/courts.service';
import { ButtonComponent } from '../../ui/atoms/button.component';
import { SpinnerComponent } from '../../ui/atoms/spinner.component';
import { PageHeaderComponent } from '../../ui/molecules/page-header.component';

const CATEGORIES: Category[] = ['A', 'B', 'C', 'D'];
const SLOTS: { key: TimeSlot; label: string }[] = [
  { key: 'day', label: 'Día (6–12)' },
  { key: 'afternoon', label: 'Tarde (12–18)' },
  { key: 'night', label: 'Noche (18–6)' },
];

@Component({
  selector: 'cs-court-form-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ButtonComponent, SpinnerComponent, PageHeaderComponent],
  template: `
    <cs-page-header [title]="isNew ? 'Nueva cancha' : 'Editar cancha'"
                    subtitle="Datos del recurso y tarifas por categoría"></cs-page-header>

    <cs-spinner *ngIf="loading()"></cs-spinner>

    <form *ngIf="!loading()" [formGroup]="form" (ngSubmit)="submit()">
      <div class="grid grid-2">
        <div class="cs-card">
          <h3>Información</h3>
          <label class="cs-label">Nombre</label>
          <input class="cs-input" formControlName="name" placeholder="Cancha Sintética Principal" />

          <div class="grid grid-2 mt-2">
            <div>
              <label class="cs-label">Tipo / deporte</label>
              <input class="cs-input" formControlName="sportType" placeholder="Fútbol" />
            </div>
            <div>
              <label class="cs-label">Clasificación</label>
              <input class="cs-input" formControlName="courtType" placeholder="Cancha / Auditorio" />
            </div>
          </div>

          <label class="cs-label mt-2">Sede</label>
          <input class="cs-input" formControlName="venueName" placeholder="Complejo Deportivo Comfasucre" />

          <label class="cs-label mt-2">Descripción</label>
          <textarea class="cs-textarea" formControlName="description" rows="3"></textarea>

          <label class="cs-label mt-2">Estado</label>
          <select class="cs-select" formControlName="status">
            <option value="active">Activa</option>
            <option value="inactive">Inactiva</option>
            <option value="maintenance">Mantenimiento</option>
          </select>
        </div>

        <div class="cs-card" formGroupName="rates">
          <h3>Tarifas por categoría y franja</h3>
          <p class="text-muted">Valores por hora en pesos. Categoría A (afiliado) a D (particular).</p>
          <table class="rate-table">
            <thead>
              <tr><th></th><th *ngFor="let s of slots">{{ s.label }}</th></tr>
            </thead>
            <tbody>
              <tr *ngFor="let cat of categories" [formGroupName]="cat">
                <th>Cat. {{ cat }}</th>
                <td *ngFor="let s of slots">
                  <input class="cs-input" type="number" min="0" [formControlName]="s.key" placeholder="0" />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div *ngIf="error()" class="cs-alert cs-alert-danger mt-2">{{ error() }}</div>

      <div class="flex gap-1 mt-3">
        <cs-button type="submit" [loading]="saving()" [disabled]="form.invalid" icon="check-lg">Guardar</cs-button>
        <cs-button variant="outline" (clicked)="cancel()">Cancelar</cs-button>
      </div>
    </form>
  `,
  styles: [`
    h3 { margin-top: 0; }
    .rate-table { width: 100%; border-collapse: collapse; }
    .rate-table th { text-align: left; font-weight: 600; color: var(--cs-navy-900); padding: .35rem; font-size: .85rem; }
    .rate-table td { padding: .25rem; }
    .rate-table .cs-input { padding: .4rem .5rem; }
  `],
})
export class CourtFormPage implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly service = inject(CourtsService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  readonly categories = CATEGORIES;
  readonly slots = SLOTS;
  readonly loading = signal(false);
  readonly saving = signal(false);
  readonly error = signal<string | null>(null);

  isNew = true;
  private id: string | null = null;

  readonly form = this.fb.nonNullable.group({
    name: ['', Validators.required],
    sportType: ['', Validators.required],
    courtType: [''],
    venueName: [''],
    description: [''],
    status: ['active'],
    rates: this.fb.group(
      Object.fromEntries(
        CATEGORIES.map((cat) => [
          cat,
          this.fb.group({ day: [null as number | null], afternoon: [null as number | null], night: [null as number | null] }),
        ]),
      ),
    ),
  });

  ngOnInit(): void {
    this.id = this.route.snapshot.paramMap.get('id');
    this.isNew = !this.id || this.id === 'new';
    if (!this.isNew && this.id) {
      this.loading.set(true);
      this.service.get(this.id).subscribe({
        next: (c) => { this.patch(c); this.loading.set(false); },
        error: () => { this.loading.set(false); this.error.set('No se pudo cargar la cancha'); },
      });
    }
  }

  private patch(c: Court): void {
    this.form.patchValue({
      name: c.name, sportType: c.sportType, courtType: c.courtType ?? '',
      venueName: c.venueName ?? '', description: c.description ?? '', status: c.status,
    });
    CATEGORIES.forEach((cat) => {
      const r = c.rates?.[cat];
      if (r) this.form.get(['rates', cat])?.patchValue({ day: r.day ?? null, afternoon: r.afternoon ?? null, night: r.night ?? null });
    });
  }

  submit(): void {
    if (this.form.invalid) return;
    this.saving.set(true);
    this.error.set(null);
    const payload = this.form.getRawValue() as unknown as Partial<Court>;
    const req = this.isNew
      ? this.service.create(payload)
      : this.service.update(this.id!, payload);
    req.subscribe({
      next: () => { this.saving.set(false); void this.router.navigate(['/admin/courts']); },
      error: (err) => { this.saving.set(false); this.error.set(err?.error?.message ?? 'No se pudo guardar'); },
    });
  }

  cancel(): void { void this.router.navigate(['/admin/courts']); }
}
