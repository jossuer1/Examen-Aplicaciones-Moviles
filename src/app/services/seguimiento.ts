import { Injectable } from '@angular/core';
import { Preferences } from '@capacitor/preferences';
import { BehaviorSubject } from 'rxjs';

const KEY = 'seguimiento_codigos';

@Injectable({ providedIn: 'root' })
export class SeguimientoService {
  private codigos$ = new BehaviorSubject<string[]>([]);
  readonly lista$ = this.codigos$.asObservable();
  private cargado: Promise<void>;

  constructor() {
    this.cargado = this.cargar();
  }

  private async cargar() {
    const { value } = await Preferences.get({ key: KEY });
    try {
      this.codigos$.next(value ? JSON.parse(value) : []);
    } catch {
      this.codigos$.next([]);
    }
  }

  // Espera a que la lista guardada se haya leído del dispositivo
  listo(): Promise<void> {
    return this.cargado;
  }

  get codigos(): string[] {
    return this.codigos$.value;
  }

  esMarcada(codigo: string): boolean {
    return this.codigos$.value.includes(codigo);
  }

  // Marca si no estaba, desmarca si estaba, y guarda en el dispositivo
  async alternar(codigo: string) {
    await this.cargado;
    const actual = this.codigos$.value;
    const nueva = actual.includes(codigo) ? actual.filter(c => c !== codigo) : [...actual, codigo];
    this.codigos$.next(nueva);
    await Preferences.set({ key: KEY, value: JSON.stringify(nueva) });
  }
}