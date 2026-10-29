import { CommonModule, CurrencyPipe } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Brand, Court, PriceQuote, Reservation } from '../../core/models';
import { PublicService } from '../../core/services/public.service';
import { SettingsService } from '../../core/services/settings.service';
import { ButtonComponent } from '../../ui/atoms/button.component';
import { LogoComponent } from '../../ui/atoms/logo.component';
import { SpinnerComponent } from '../../ui/atoms/spinner.component';

@Component({
  selector: 'cs-landing-page',
  standalone: true,
  imports: [CommonModule, CurrencyPipe, ReactiveFormsModule, RouterLink, ButtonComponent, LogoComponent, SpinnerComponent],
  templateUrl: './landing.page.html',
  styleUrl: './landing.page.scss',
})
export class LandingPage implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly api = inject(PublicService);
  private readonly settings = inject(SettingsService);

  readonly loading = signal(true);
  readonly courts = signal<Court[]>([]);
  readonly brand = signal<Brand | null>(null);

  readonly quote = signal<PriceQuote | null>(null);
  readonly reservation = signal<Reservation | null>(null);
  readonly step = signal<'form' | 'verify' | 'done'>('form');
  readonly busy = signal(false);
  readonly error = signal<string | null>(null);
  readonly today = new Date().toISOString().slice(0, 10);

  readonly form = this.fb.nonNullable.group({
    courtId: ['', Validators.required],
    date: [this.today, Validators.required],
    startTime: ['18:00', Validators.required],
    endTime: ['19:00', Validators.required],
    customerName: ['', Validators.required],
    customerPhone: [''],
    documentNumber: [''],
  });

  readonly code = this.fb.nonNullable.control('', [Validators.required]);
  readonly selectedCourt = computed(() =>
    this.courts().find((c) => c.id === this.form.controls.courtId.value) ?? null,
  );

  ngOnInit(): void {
    this.settings.getBrand().subscribe({
      next: (b) => this.brand.set(b),
      error: () => undefined,
    });
    this.api.courts().subscribe({
      next: (c) => { this.courts.set(c); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  pick(court: Court): void {
    this.form.patchValue({ courtId: court.id });
    this.getQuote();
    document.getElementById('reservar')?.scrollIntoView({ behavior: 'smooth' });
  }

  getQuote(): void {
    const v = this.form.getRawValue();
    if (!v.courtId || !v.date || !v.startTime || !v.endTime) return;
    this.api.quote({
      courtId: v.courtId, date: v.date, startTime: v.startTime, endTime: v.endTime,
      documentNumber: v.documentNumber || undefined,
    }).subscribe({
      next: (q) => this.quote.set(q),
      error: () => this.quote.set(null),
    });
  }

  reserve(): void {
    if (this.form.invalid) return;
    this.busy.set(true);
    this.error.set(null);
    const v = this.form.getRawValue();
    this.api.createReservation({
      courtId: v.courtId, date: v.date, startTime: v.startTime, endTime: v.endTime,
      customerName: v.customerName, customerPhone: v.customerPhone || undefined,
      documentNumber: v.documentNumber || undefined,
    }).subscribe({
      next: (r) => {
        this.reservation.set(r);
        if (r.userPhone) {
          this.api.sendVerification(r.id).subscribe({ error: () => undefined });
          this.step.set('verify');
        } else {
          this.step.set('done');
        }
        this.busy.set(false);
      },
      error: (err) => { this.busy.set(false); this.error.set(err?.error?.message ?? 'No se pudo crear la reserva'); },
    });
  }

  confirmCode(): void {
    const r = this.reservation();
    if (!r || this.code.invalid) return;
    this.busy.set(true);
    this.error.set(null);
    this.api.verify(r.id, this.code.value).subscribe({
      next: (res) => { this.reservation.set(res); this.step.set('done'); this.busy.set(false); },
      error: (err) => { this.busy.set(false); this.error.set(err?.error?.message ?? 'Código inválido'); },
    });
  }

  restart(): void {
    this.step.set('form');
    this.reservation.set(null);
    this.quote.set(null);
    this.code.reset('');
    this.form.patchValue({ customerName: '', customerPhone: '', documentNumber: '' });
  }
}
