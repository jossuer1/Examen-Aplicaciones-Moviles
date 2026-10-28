import { Component, DestroyRef, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  IonIcon,
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonButton,
  IonCard,
  IonCardTitle,
  IonSpinner,
} from '@ionic/angular';
import { IncidenciaService, ResumenIncidencias } from '../../services/incidencia';
import { SeguimientoService } from '../../services/seguimiento';

@Component({
  selector: 'app-inicio',
  standalone: true,
  templateUrl: './inicio.page.html',
  styleUrls: ['./inicio.page.scss'],
  imports: [
    IonIcon,
    RouterLink,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonButton,
    IonCard,
    IonCardTitle,
    IonSpinner,
  ],
})
export class InicioPage {
  private incidencias = inject(IncidenciaService);
  private destroyRef = inject(DestroyRef);
  private seguimiento = inject(SeguimientoService);
  resumen = signal<ResumenIncidencias | null>(null);
  loading = signal(false);
  error = signal(false);
  marcadas = signal(0);

  constructor() {
    this.seguimiento.lista$.pipe(takeUntilDestroyed()).subscribe((codigos) => this.marcadas.set(codigos.length));
  }

  ionViewWillEnter() {
    this.cargar();
  }

  cargar() {
    if (this.loading()) return;
    this.loading.set(true);
    this.error.set(false);
    this.incidencias
      .getResumen()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (resumen) => {
          this.resumen.set(resumen);
          this.loading.set(false);
        },
        error: () => {
          this.error.set(true);
          this.loading.set(false);
        },
      });
  }
}
