import { Injectable } from '@angular/core';
import { Capacitor } from '@capacitor/core';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';

export type ResultadoFoto =
  | { ok: true; dataUrl: string }
  | { ok: false; motivo: 'cancelado' | 'denegado' | 'error' };

@Injectable({ providedIn: 'root' })
export class FotoService {
  async capturar(): Promise<ResultadoFoto> {
    try {
      if (Capacitor.isNativePlatform()) {
        let perm = await Camera.checkPermissions();
        if (perm.camera !== 'granted') {
          perm = await Camera.requestPermissions({ permissions: ['camera'] });
        }
        if (perm.camera !== 'granted') {
          return { ok: false, motivo: 'denegado' };
        }
      }

      const foto = await Camera.getPhoto({
        quality: 60,   // balance entre calidad y peso
        width: 1024,   // evita subir imágenes enormes
        allowEditing: false,
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Camera,
      });

      return foto.dataUrl ? { ok: true, dataUrl: foto.dataUrl } : { ok: false, motivo: 'error' };
    } catch (e: any) {
      const msg = String(e?.message ?? '');
      if (/cancel/i.test(msg)) return { ok: false, motivo: 'cancelado' };
      if (/denied|permission/i.test(msg)) return { ok: false, motivo: 'denegado' };
      return { ok: false, motivo: 'error' };
    }
  }
}