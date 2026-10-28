import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonCard,
  IonBadge,
  IonButton,
  IonIcon,
  IonSpinner,
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import { star } from 'ionicons/icons';
import { IncidenciaService } from '../../services/incidencia';
import { SeguimientoService } from '../../services/seguimiento';
import { Incidencia } from '../../models/incidencia';

@Component({
  selector: 'app-seguimiento',
  standalone: true,
  templateUrl: './seguimiento.page.html',
  styleUrls: ['./seguimiento.page.scss'],
  imports: [
    DatePipe,
    RouterLink,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonCard,
    IonBadge,
    IonButton,
    IonIcon,
    IonSpinner,
  ],
})
export class SeguimientoPage {
  private changeDetector = inject(ChangeDetectorRef);
  private incidencias = inject(IncidenciaService);
  seg = inject(SeguimientoService);

  items: Incidencia[] = [];
  loading = false;
  error = false;

  constructor() {
    addIcons({ star });
  }

  async ionViewWillEnter() {
    await this.cargar();
  }

  async cargar() {
    this.error = false;
    await this.seg.listo();
    const codigos = this.seg.codigos;
    if (codigos.length === 0) {
      this.items = [];
      this.changeDetector.detectChanges();
      return;
    }
    this.loading = true;
    this.changeDetector.detectChanges();
    this.error = false;
    forkJoin(codigos.map((c) => this.incidencias.getByCodigo(c))).subscribe({
      next: (res) => {
        this.items = res.filter((x): x is Incidencia => !!x);
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

  async quitar(ev: Event, i: Incidencia) {
    ev.preventDefault();
    ev.stopPropagation();
    await this.seg.alternar(i.codigo);
    this.changeDetector.detectChanges();
    this.items = this.items.filter((x) => x.codigo !== i.codigo);
    this.changeDetector.detectChanges(); // desaparece al instante
  }
}
