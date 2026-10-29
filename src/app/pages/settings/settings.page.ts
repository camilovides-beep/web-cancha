import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { Brand } from '../../core/models';
import { SettingsService } from '../../core/services/settings.service';
import { ButtonComponent } from '../../ui/atoms/button.component';
import { SpinnerComponent } from '../../ui/atoms/spinner.component';
import { PageHeaderComponent } from '../../ui/molecules/page-header.component';

@Component({
  selector: 'cs-settings-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ButtonComponent, SpinnerComponent, PageHeaderComponent],
  template: `
    <cs-page-header title="Configuración de marca" subtitle="Personaliza la identidad del portal"></cs-page-header>

    <cs-spinner *ngIf="loading()"></cs-spinner>

    <form *ngIf="!loading()" [formGroup]="form" (ngSubmit)="save()" class="grid grid-2">
      <div class="cs-card">
        <h3>Identidad</h3>
        <label class="cs-label">Nombre</label>
        <input class="cs-input" formControlName="name" />
        <label class="cs-label mt-2">Eslogan</label>
        <input class="cs-input" formControlName="tagline" />

        <div class="grid grid-2 mt-2">
          <div>
            <label class="cs-label">Color primario</label>
            <input class="cs-input color" type="color" formControlName="primaryColor" (input)="preview()" />
          </div>
          <div>
            <label class="cs-label">Color secundario</label>
            <input class="cs-input color" type="color" formControlName="secondaryColor" (input)="preview()" />
          </div>
        </div>
      </div>

      <div class="cs-card">
        <h3>Contacto y redes</h3>
        <label class="cs-label">Correo</label>
        <input class="cs-input" formControlName="email" />
        <label class="cs-label mt-2">WhatsApp</label>
        <input class="cs-input" formControlName="whatsapp" />
        <label class="cs-label mt-2">Dirección</label>
        <input class="cs-input" formControlName="address" />
        <div class="grid grid-2 mt-2">
          <div><label class="cs-label">Facebook</label><input class="cs-input" formControlName="facebook" /></div>
          <div><label class="cs-label">Instagram</label><input class="cs-input" formControlName="instagram" /></div>
        </div>
      </div>

      <div class="actions">
        <div *ngIf="saved()" class="cs-alert cs-alert-success">Cambios guardados.</div>
        <div *ngIf="error()" class="cs-alert cs-alert-danger">{{ error() }}</div>
        <cs-button type="submit" [loading]="saving()" icon="check-lg">Guardar cambios</cs-button>
      </div>
    </form>
  `,
  styles: [`
    h3 { margin-top: 0; }
    .color { height: 44px; padding: .25rem; }
    .actions { grid-column: 1 / -1; display: flex; flex-direction: column; gap: .5rem; align-items: flex-start; }
  `],
})
export class SettingsPage implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly service = inject(SettingsService);

  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly saved = signal(false);
  readonly error = signal<string | null>(null);

  readonly form = this.fb.nonNullable.group({
    name: [''], tagline: [''], primaryColor: ['#19559B'], secondaryColor: ['#1FB5E5'],
    email: [''], whatsapp: [''], address: [''], facebook: [''], instagram: [''],
  });

  ngOnInit(): void {
    this.service.getBrand().subscribe({
      next: (b) => { this.form.patchValue(b); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  preview(): void {
    this.service.applyBrand({
      ...this.service.brand(),
      primaryColor: this.form.value.primaryColor!,
      secondaryColor: this.form.value.secondaryColor!,
    });
  }

  save(): void {
    this.saving.set(true);
    this.saved.set(false);
    this.error.set(null);
    this.service.updateBrand(this.form.getRawValue() as Partial<Brand>).subscribe({
      next: () => { this.saving.set(false); this.saved.set(true); },
      error: (err) => { this.saving.set(false); this.error.set(err?.error?.message ?? 'No se pudo guardar'); },
    });
  }
}
