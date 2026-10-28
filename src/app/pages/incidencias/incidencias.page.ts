import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { addIcons } from 'ionicons';
import { star, starOutline } from 'ionicons/icons';
import { SeguimientoService } from '../../services/seguimiento';

import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonCard,
  IonBadge,
  IonInfiniteScroll,
  IonInfiniteScrollContent,
  IonRefresher,
  IonRefresherContent,
  IonButton,
  IonSpinner,
  IonIcon,
} from '@ionic/angular';
import type { InfiniteScrollCustomEvent, RefresherCustomEvent } from '@ionic/angular';
import { IncidenciaService } from '../../services/incidencia';
import { Estado, Incidencia } from '../../models/incidencia';

@Component({
  selector: 'app-incidencias',
  standalone: true,
  templateUrl: './incidencias.page.html',
  styleUrls: ['./incidencias.page.scss'],
  imports: [
    DatePipe,
    RouterLink,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonCard,
    IonBadge,
    IonInfiniteScroll,
    IonInfiniteScrollContent,
    IonRefresher,
    IonRefresherContent,
    IonButton,
    IonSpinner,
    IonIcon,
  ],
})
export class IncidenciasPage {
  private changeDetector = inject(ChangeDetectorRef);
  private service = inject(IncidenciaService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  estadoFiltro: Estado | undefined;

  async mostrarTodas() {
    await this.router.navigate(['/tabs/incidencias'], { replaceUrl: true });
    this.estadoFiltro = undefined;
    this.recargar();
  }

  items: Incidencia[] = [];
  page = 1;
  readonly limit = 8;
  hasMore = true;
  loading = false;
  error = false;

  // Se ejecuta cada vez que se entra a la pestaña: así refleja altas y cambios
  ionViewWillEnter() {
    const estado = this.route.snapshot.queryParamMap.get('estado');
    this.estadoFiltro = estado === 'pendiente' || estado === 'en_proceso' || estado === 'resuelta' ? estado : undefined;
    this.recargar();
  }

  recargar(done?: () => void) {
    this.items = [];
    this.page = 1;
    this.hasMore = true;
    this.loading = false;
    this.changeDetector.detectChanges();
    this.cargarSiguiente(done);
  }

  cargarSiguiente(done?: () => void) {
    if (this.loading || !this.hasMore) {
      done?.();
      return;
    }
    this.loading = true;
    this.error = false;

    this.service.getPage(this.page, this.limit, this.estadoFiltro).subscribe({
      next: (data) => {
        this.items = [...this.items, ...data];
        // Si llegan menos registros que el límite, ya no hay más páginas: no se vuelve a pedir
        this.hasMore = data.length === this.limit;
        if (data.length > 0) this.page++;
        this.loading = false;
        this.changeDetector.detectChanges();
        done?.();
      },
      error: () => {
        this.error = true;
        this.loading = false;
        this.changeDetector.detectChanges();
        done?.();
      },
    });
  }

  onInfinite(ev: InfiniteScrollCustomEvent) {
    this.cargarSiguiente(() => ev.target.complete());
  }

  onRefresh(ev: RefresherCustomEvent) {
    this.recargar(() => ev.target.complete());
  }

  color(estado: Estado): string {
    return estado === 'pendiente' ? 'warning' : estado === 'en_proceso' ? 'primary' : 'success';
  }

  etiqueta(estado: Estado): string {
    return estado === 'pendiente' ? 'Pendiente' : estado === 'en_proceso' ? 'En proceso' : 'Resuelta';
  }

  seg = inject(SeguimientoService);

  constructor() {
    addIcons({ star, starOutline });
  }

  async alternarSeguimiento(ev: Event, i: Incidencia) {
    ev.preventDefault();
    ev.stopPropagation(); // evita que se abra el detalle al tocar la estrella
    await this.seg.alternar(i.codigo);
    this.changeDetector.detectChanges();
  }
}
