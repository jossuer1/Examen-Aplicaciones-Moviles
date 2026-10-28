import { TestBed } from '@angular/core/testing';
import { Borrador, BorradorService } from './borrador';

describe('Borrador: persistencia y descarte', () => {
  const borrador: Borrador = {
    version: 1,
    codigo: 'INC-test',
    datos: { tipo: 'bache', descripcion: 'Calzada dañada', direccion: 'Quito', sector: 'Centro', prioridad: 'media' },
    coords: { latitud: 0, longitud: 0 },
    foto: null,
    fotoUrl: '',
    latTxt: '0',
    lngTxt: '0',
  };
  it('conserva la última escritura y permite recuperar desde otra instancia', async () => {
    const a = TestBed.inject(BorradorService);
    await a.borrar();
    const primera = a.guardar(borrador);
    const segunda = a.guardar({ ...borrador, datos: { ...borrador.datos, descripcion: 'Último cambio' } });
    await Promise.all([primera, segunda]);
    const b = new BorradorService();
    expect((await b.leer())?.datos.descripcion).toBe('Último cambio');
    await b.borrar();
    expect(await a.leer()).toBeNull();
  });
});
