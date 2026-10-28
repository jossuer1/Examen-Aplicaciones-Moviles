import { Injectable } from '@angular/core';
import { Preferences } from '@capacitor/preferences';
import { Prioridad, TipoIncidencia } from '../models/incidencia';
import { Coordenadas } from './ubicacion';

export interface Borrador {
  version: 1;
  codigo: string;
  datos: { tipo: TipoIncidencia; descripcion: string; direccion: string; sector: string; prioridad: Prioridad };
  coords: Coordenadas | null;
  foto: string | null;
  fotoUrl: string;
  latTxt: string;
  lngTxt: string;
}

@Injectable({ providedIn: 'root' })
export class BorradorService {
  private readonly key = 'urbaninspect_borrador_v1';
  private cola: Promise<void> = Promise.resolve();

  async leer(): Promise<Borrador | null> {
    await this.cola;
    const { value } = await Preferences.get({ key: this.key });
    if (!value) return null;
    try {
      const b = JSON.parse(value) as Borrador;
      return b.version === 1 && b.datos && typeof b.codigo === 'string' ? b : null;
    } catch {
      return null;
    }
  }

  guardar(borrador: Borrador): Promise<void> {
    const value = JSON.stringify(borrador);
    return this.encolar(() => Preferences.set({ key: this.key, value }));
  }

  borrar(): Promise<void> {
    return this.encolar(() => Preferences.remove({ key: this.key }));
  }

  private encolar(operacion: () => Promise<void>): Promise<void> {
    const resultado = this.cola.then(operacion);
    // Una escritura fallida no bloquea los siguientes intentos.
    this.cola = resultado.catch(() => undefined);
    return resultado;
  }
}
