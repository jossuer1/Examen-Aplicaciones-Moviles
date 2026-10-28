import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButtons,
  IonBackButton,
  IonBadge,
  IonButton,
  IonSpinner,
  IonTextarea,
  ToastController,
} from '@ionic/angular';
import { IncidenciaService } from '../../services/incidencia';
import { Estado, Incidencia, TRANSICIONES } from '../../models/incidencia';

@Component({
  selector: 'app-detalle',
  standalone: true,
  templateUrl: './detalle.page.html',
  styleUrls: ['./detalle.page.scss'],
  imports: [
    DatePipe,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonButtons,
    IonBackButton,
    IonBadge,
    IonButton,
    IonSpinner,
    IonTextarea,
  ],
})
export class DetallePage {
  private changeDetector = inject(ChangeDetectorRef);
  private route = inject(ActivatedRoute);
  private service = inject(IncidenciaService);
  private toast = inject(ToastController);

  item: Incidencia | null = null;
  loading = false;
  guardando = false;
  error = false;
  observacion = '';
  errorObservacion = false;

  ionViewWillEnter() {
    this.cargar();
  }

  cargar() {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) return;
    this.loading = true;
    this.error = false;
    this.service.getById(id).subscribe({
      next: (data) => {
        this.item = data;
        this.observacion = '';
        this.errorObservacion = false;
        this.loading = false;
        this.changeDetector.detectChanges();
      },
      error: () => {
        this.error = true;
        this.loading = false;
        this.changeDetector.detectChanges();
      },
    });
  }

  puede(nuevo: Estado): boolean {
    return !!this.item && (TRANSICIONES[this.item.estado]?.includes(nuevo) ?? false);
  }

  get esFinal(): boolean {
    return this.item?.estado === 'resuelta';
  }

  async cambiar(nuevo: Estado) {
    if (this.guardando || !this.item?.id || !this.puede(nuevo)) return; // regla validada también en código

    const obs = this.observacion.trim();
    if (nuevo === 'resuelta' && !obs) {
      this.errorObservacion = true; // observación obligatoria para resolver
      return;
    }

    this.guardando = true;
    const cambios: Partial<Incidencia> = { estado: nuevo };
    if (obs) cambios.observacion = obs;

    this.service.actualizar(this.item.id!, cambios).subscribe({
      next: async (actualizado) => {
        this.item = actualizado;
        this.observacion = '';
        this.errorObservacion = false;
        this.guardando = false;
        this.changeDetector.detectChanges();
        (await this.toast.create({ message: 'Estado actualizado', duration: 2000, color: 'success' })).present();
      },
      error: async () => {
        this.guardando = false;
        this.changeDetector.detectChanges();
        (
          await this.toast.create({
            message: 'No se pudo actualizar. Intenta de nuevo.',
            duration: 3000,
            color: 'danger',
          })
        ).present();
      },
    });
  }

  etiqueta(estado: Estado): string {
    return estado === 'pendiente' ? 'Pendiente' : estado === 'en_proceso' ? 'En proceso' : 'Resuelta';
  }

  color(estado: Estado): string {
    return estado === 'pendiente' ? 'warning' : estado === 'en_proceso' ? 'primary' : 'success';
  }

  onObservacion(ev: any) {
    this.observacion = ev.detail.value ?? '';
    if (this.observacion.trim()) this.errorObservacion = false;
  }
}
