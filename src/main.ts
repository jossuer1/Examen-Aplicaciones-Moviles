import { provideHttpClient } from '@angular/common/http';
import { bootstrapApplication } from '@angular/platform-browser';
import { RouteReuseStrategy, provideRouter, withPreloading, PreloadAllModules } from '@angular/router';
import { IonicRouteStrategy, provideIonicAngular } from '@ionic/angular';
import { defineCustomElements } from '@ionic/pwa-elements/loader';
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
  mailOutline,
  lockClosedOutline,
  personOutline,
  logOutOutline,
  eyeOutline,
  eyeOffOutline,
  alertCircleOutline,
  logInOutline,
  personAddOutline,
  keyOutline,
} from 'ionicons/icons';

import { AppComponent } from './app/app.component';
import { routes } from './app/app.routes';

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
  mailOutline,
  lockClosedOutline,
  personOutline,
  logOutOutline,
  eyeOutline,
  eyeOffOutline,
  alertCircleOutline,
  logInOutline,
  personAddOutline,
  keyOutline,
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
