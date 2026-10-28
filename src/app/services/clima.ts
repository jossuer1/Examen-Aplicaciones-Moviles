import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map, timeout } from 'rxjs/operators';

export interface Clima {
  temperatura: number;     // °C
  precipitacion1h: number; // mm en la última hora
  descripcion: string;
  lluviaFuerte: boolean;   // true si supera el umbral
}

// Códigos WMO que devuelve Open-Meteo
const DESCRIPCIONES: Record<number, string> = {
  0: 'Despejado', 1: 'Mayormente despejado', 2: 'Parcialmente nublado', 3: 'Nublado',
  45: 'Niebla', 48: 'Niebla con escarcha',
  51: 'Llovizna ligera', 53: 'Llovizna moderada', 55: 'Llovizna intensa',
  56: 'Llovizna helada', 57: 'Llovizna helada intensa',
  61: 'Lluvia ligera', 63: 'Lluvia moderada', 65: 'Lluvia intensa',
  66: 'Lluvia helada', 67: 'Lluvia helada intensa',
  71: 'Nevada ligera', 73: 'Nevada moderada', 75: 'Nevada intensa', 77: 'Granizo fino',
  80: 'Chubascos ligeros', 81: 'Chubascos moderados', 82: 'Chubascos violentos',
  85: 'Chubascos de nieve', 86: 'Chubascos de nieve intensos',
  95: 'Tormenta', 96: 'Tormenta con granizo', 99: 'Tormenta con granizo fuerte',
};

@Injectable({ providedIn: 'root' })
export class ClimaService {
  private http = inject(HttpClient);
  readonly UMBRAL_MM = 5;

  consultar(lat: number, lng: number): Observable<Clima> {
    const params = new HttpParams()
      .set('latitude', lat)
      .set('longitude', lng)
      .set('current', 'temperature_2m,weather_code')
      .set('hourly', 'precipitation')
      .set('past_hours', 2)
      .set('forecast_hours', 1)
      .set('timezone', 'auto');

    return this.http.get<any>('https://api.open-meteo.com/v1/forecast', { params }).pipe(
      timeout(8000), // si no responde, se informa y se deja continuar
      map(r => this.transformar(r))
    );
  }

  private transformar(r: any): Clima {
    const temp = r?.current?.temperature_2m;
    const codigo = r?.current?.weather_code;
    const ahora: string | undefined = r?.current?.time;
    const horas: string[] = r?.hourly?.time ?? [];
    const lluvia: (number | null)[] = r?.hourly?.precipitation ?? [];

    // Última marca horaria que no sea posterior a la hora actual (mismo formato y zona: se compara como texto)
    let idx = -1;
    for (let i = 0; i < horas.length; i++) {
      if (ahora && horas[i] <= ahora) idx = i;
    }
    const precip = idx >= 0 ? lluvia[idx] : null;

    // Si falta cualquier dato, NO se inventa un valor (por ejemplo, un 0): se informa que no hay datos
    if (typeof temp !== 'number' || typeof precip !== 'number' || typeof codigo !== 'number') {
      throw new Error('SIN_DATOS');
    }

    return {
      temperatura: temp,
      precipitacion1h: precip,
      descripcion: DESCRIPCIONES[codigo] ?? 'Condición no clasificada',
      lluviaFuerte: precip > this.UMBRAL_MM, // estrictamente mayor que 5 mm
    };
  }
}