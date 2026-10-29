import { CommonModule, CurrencyPipe } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Brand, Court, PriceQuote, Reservation } from '../../core/models';
import { PublicService } from '../../core/services/public.service';
import { SettingsService } from '../../core/services/settings.service';
import { ButtonComponent } from '../../ui/atoms/button.component';
import { LogoComponent } from '../../ui/atoms/logo.component';
import { SpinnerComponent } from '../../ui/atoms/spinner.component';

@Component({
  selector: 'cs-landing-page',
  standalone: true,
  imports: [CommonModule, CurrencyPipe, ReactiveFormsModule, ButtonComponent, LogoComponent, SpinnerComponent],
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
  readonly step = signal<'form' | 'paying' | 'done'>('form');
  readonly checkoutUrl = signal<string | null>(null);
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
      next: (r) => { this.reservation.set(r); this.startPayment(r); },
      error: (err) => { this.busy.set(false); this.error.set(err?.error?.message ?? 'No se pudo crear la reserva'); },
    });
  }

  /** Tras crear la reserva, inicia el pago y redirige al checkout de ePayco. */
  private startPayment(r: Reservation): void {
    // Reservas sin costo no pasan por la pasarela.
    if (!r.totalAmount || r.totalAmount <= 0) {
      this.busy.set(false);
      this.step.set('done');
      return;
    }
    this.step.set('paying');
    this.api.initPayment(r.id).subscribe({
      next: (p) => {
        this.busy.set(false);
        this.checkoutUrl.set(p.checkoutUrl);
        // Redirección automática a la pasarela segura de ePayco.
        window.location.href = p.checkoutUrl;
      },
      error: (err) => {
        this.busy.set(false);
        this.error.set(err?.error?.message ?? 'No se pudo iniciar el pago. Intenta de nuevo.');
      },
    });
  }

  /** Botón de respaldo si el navegador bloquea la redirección automática. */
  goToCheckout(): void {
    const url = this.checkoutUrl();
    if (url) window.location.href = url;
  }

  restart(): void {
    this.step.set('form');
    this.reservation.set(null);
    this.quote.set(null);
    this.checkoutUrl.set(null);
    this.form.patchValue({ customerName: '', customerPhone: '', documentNumber: '' });
  }
}
