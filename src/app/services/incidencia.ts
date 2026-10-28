import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { EMPTY, Observable, of, throwError } from 'rxjs';
import { environment } from '../../environments/environment';
import { Estado, Incidencia } from '../models/incidencia';
import { catchError, expand, map, reduce, timeout } from 'rxjs/operators';

export interface ResumenIncidencias {
  total: number;
  pendiente: number;
  en_proceso: number;
  resuelta: number;
  sinClasificar: number;
}

@Injectable({ providedIn: 'root' })
export class IncidenciaService {
  private http = inject(HttpClient);
  private url = environment.incidenciasUrl;

  // Cuenta por paginas remotas; el listado sigue descargando solo 8 por vez.
  getResumen(): Observable<ResumenIncidencias> {
    const limit = 50;
    return this.getPage(1, limit).pipe(
      expand((pagina, indice) => (pagina.length === limit ? this.getPage(indice + 2, limit) : EMPTY)),
      reduce(
        (resumen, pagina) => {
          for (const item of pagina) {
            resumen.total++;
            if (item.estado === 'pendiente' || item.estado === 'en_proceso' || item.estado === 'resuelta')
              resumen[item.estado]++;
            else resumen.sinClasificar++;
          }
          return resumen;
        },
        { total: 0, pendiente: 0, en_proceso: 0, resuelta: 0, sinClasificar: 0 } as ResumenIncidencias,
      ),
      timeout(20000),
    );
  }

  // La paginación la hace el servidor: pedimos solo una página
  getPage(page: number, limit: number, estado?: Estado): Observable<Incidencia[]> {
    let params = new HttpParams().set('page', page).set('limit', limit).set('sortby', 'fecha').set('order', 'desc');
    if (estado) params = params.set('estado', estado);

    return this.http.get<Incidencia[]>(this.url, { params }).pipe(
      // MockAPI puede responder 404 cuando la página no existe: lo tratamos como "sin más datos"
      catchError((err) => (err.status === 404 ? of([]) : throwError(() => err))),
    );
  }

  getById(id: string): Observable<Incidencia> {
    return this.http.get<Incidencia>(`${this.url}/${id}`);
  }

  getByCodigo(codigo: string): Observable<Incidencia | null> {
    const params = new HttpParams().set('codigo', codigo);
    return this.http.get<Incidencia[]>(this.url, { params }).pipe(
      // MockAPI filtra por "contiene", así que buscamos la coincidencia exacta
      map((lista) => lista.find((i) => i.codigo === codigo) ?? null),
      catchError((err) => (err.status === 404 ? of(null) : throwError(() => err))),
    );
  }
  crear(incidencia: Omit<Incidencia, 'id'>): Observable<Incidencia> {
    return this.http.post<Incidencia>(this.url, incidencia);
  }

  actualizar(id: string, cambios: Partial<Incidencia>): Observable<Incidencia> {
    return this.http.put<Incidencia>(`${this.url}/${id}`, cambios);
  }
}
