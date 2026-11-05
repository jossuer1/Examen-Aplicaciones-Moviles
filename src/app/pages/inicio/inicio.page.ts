import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router, RouterLink } from '@angular/router';
import {
  IonIcon,
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonButton,
  IonButtons,
  IonCard,
  IonCardTitle,
  IonSpinner,
  AlertController,
} from '@ionic/angular';

import { AuthService } from '../../services/auth';
import type { ResumenIncidencias } from '../../services/incidencia';
import { IncidenciaService } from '../../services/incidencia';
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
    IonButtons,
    IonCard,
    IonCardTitle,
    IonSpinner,
  ],
})
export class InicioPage {
  private incidencias = inject(IncidenciaService);
  private destroyRef = inject(DestroyRef);
  private seguimiento = inject(SeguimientoService);
  private auth = inject(AuthService);
  private router = inject(Router);
  private alertCtrl = inject(AlertController);

  resumen = signal<ResumenIncidencias | null>(null);
  loading = signal(false);
  error = signal(false);
  marcadas = signal(0);
  usuario = this.auth.currentUser;

  constructor() {
    this.seguimiento.lista$.pipe(takeUntilDestroyed()).subscribe((codigos) => this.marcadas.set(codigos.length));
  }

  ionViewWillEnter(): void {
    this.cargar();
  }

  cargar(): void {
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

  async cerrarSesion(): Promise<void> {
    const alert = await this.alertCtrl.create({
      header: 'Cerrar sesión',
      message: '¿Deseas salir de tu cuenta de UrbanInspect?',
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Salir',
          role: 'destructive',
          handler: async () => {
            await this.auth.logout();
            await this.router.navigate(['/login'], { replaceUrl: true });
          },
        },
      ],
    });
    await alert.present();
  }
}
