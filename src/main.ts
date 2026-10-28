import { addIcons } from 'ionicons';
import {
  addOutline,
  imageOutline,
  arrowForwardOutline,
  locationOutline,
  cameraOutline,
  cloudOutline,
  layersOutline,
  timeOutline,
  constructOutline,
  checkmarkCircleOutline,
  refreshOutline,
  documentTextOutline,
  shieldCheckmarkOutline,
  bookmarkOutline,
} from 'ionicons/icons';
import { defineCustomElements } from '@ionic/pwa-elements/loader';
import { bootstrapApplication } from '@angular/platform-browser';
import { RouteReuseStrategy, provideRouter, withPreloading, PreloadAllModules } from '@angular/router';
import { IonicRouteStrategy, provideIonicAngular } from '@ionic/angular';
import { provideHttpClient } from '@angular/common/http';

import { routes } from './app/app.routes';
import { AppComponent } from './app/app.component';

addIcons({
  addOutline,
  imageOutline,
  arrowForwardOutline,
  locationOutline,
  cameraOutline,
  cloudOutline,
  layersOutline,
  timeOutline,
  constructOutline,
  checkmarkCircleOutline,
  refreshOutline,
  documentTextOutline,
  shieldCheckmarkOutline,
  bookmarkOutline,
});

void defineCustomElements(window);

bootstrapApplication(AppComponent, {
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    provideIonicAngular(),
    provideRouter(routes, withPreloading(PreloadAllModules)),
    provideHttpClient(),
  ],
});
