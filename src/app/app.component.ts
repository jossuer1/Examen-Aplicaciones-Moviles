import { Component, DestroyRef, afterNextRender, inject, signal } from '@angular/core';
import { IonApp, IonRouterOutlet } from '@ionic/angular';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  imports: [IonApp, IonRouterOutlet],
})
export class AppComponent {
  readonly mostrandoSplash = signal(true);
  private readonly destroyRef = inject(DestroyRef);

  constructor() {
    // Solo durante el arranque, sin esperar al GPS, Cloudinary o los servicios remotos.
    afterNextRender(() => {
      const timer = setTimeout(() => this.mostrandoSplash.set(false), 1200);
      this.destroyRef.onDestroy(() => clearTimeout(timer));
    });
  }
}
