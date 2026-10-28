export type Estado = 'pendiente' | 'en_proceso' | 'resuelta';
export type Prioridad = 'baja' | 'media' | 'alta';
export type TipoIncidencia = 'luminaria' | 'bache' | 'señalizacion' | 'alcantarilla' | 'parque';

export interface Incidencia {
  id?: string;
  codigo: string;
  tipo: TipoIncidencia;
  descripcion: string;
  direccion: string;
  sector: string;
  fecha: string;
  estado: Estado;
  prioridad: Prioridad;
  fotoUrl: string;
  latitud: number | null;
  longitud: number | null;
  observacion: string;
}

// Qué estados se pueden alcanzar desde cada estado
export const TRANSICIONES: Record<Estado, Estado[]> = {
  pendiente: ['en_proceso', 'resuelta'],
  en_proceso: ['resuelta'],
  resuelta: [],
};