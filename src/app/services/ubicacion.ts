import { Injectable } from '@angular/core';
import { Capacitor } from '@capacitor/core';
import { Geolocation } from '@capacitor/geolocation';

export interface Coordenadas {
  latitud: number;
  longitud: number;
}

export type ResultadoUbicacion =
  | { ok: true; coords: Coordenadas }
  | { ok: false; motivo: 'denegado' | 'tiempo_agotado' | 'no_disponible' };

@Injectable({ providedIn: 'root' })
export class UbicacionService {
  async obtenerActual(): Promise<ResultadoUbicacion> {
    try {
      // En Android se piden los permisos de forma explícita.
      // En el navegador, getCurrentPosition abre el aviso por sí solo.
      if (Capacitor.isNativePlatform()) {
        let perm = await Geolocation.checkPermissions();
        if (perm.location !== 'granted') {
          perm = await Geolocation.requestPermissions();
        }
        if (perm.location !== 'granted') {
          return { ok: false, motivo: 'denegado' };
        }
      }

      const pos = await Geolocation.getCurrentPosition({
        enableHighAccuracy: true,
        timeout: 15000,
      });
      return {
        ok: true,
        coords: { latitud: pos.coords.latitude, longitud: pos.coords.longitude },
      };
    } catch (e: any) {
      if (e?.code === 3 || e?.code === 'OS-PLUG-GLOC-0010' || /timeout|timed out/i.test(e?.message ?? '')) {
        return { ok: false, motivo: 'tiempo_agotado' };
      }
      const denegado = e?.code === 1 || /denied/i.test(e?.message ?? '');
      return { ok: false, motivo: denegado ? 'denegado' : 'no_disponible' };
    }
  }

  esValida(lat: number, lng: number): boolean {
    return Number.isFinite(lat) && Number.isFinite(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
  }

  // Convierte el texto ingresado a coordenadas, o devuelve null si no son válidas
  parsear(latTxt: string, lngTxt: string): Coordenadas | null {
    const l = (latTxt ?? '').trim().replace(',', '.');
    const g = (lngTxt ?? '').trim().replace(',', '.');
    if (l === '' || g === '') return null; // Number('') daría 0 y pasaría como válido
    const latitud = Number(l);
    const longitud = Number(g);
    return this.esValida(latitud, longitud) ? { latitud, longitud } : null;
  }
}
