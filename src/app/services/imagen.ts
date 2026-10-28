import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ImagenService {
  private http = inject(HttpClient);

  // Sube la imagen a Cloudinary y devuelve su URL pública
  subir(dataUrl: string): Observable<string> {
    const fd = new FormData();
    fd.append('file', dataUrl);
    fd.append('upload_preset', environment.cloudinaryPreset);

    return this.http
      .post<{ secure_url: string }>(
        `https://api.cloudinary.com/v1_1/${environment.cloudinaryCloudName}/image/upload`,
        fd
      )
      .pipe(map(r => r.secure_url));
  }
}