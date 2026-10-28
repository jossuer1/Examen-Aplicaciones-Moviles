import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { vi } from 'vitest';
import { NuevaPage } from './nueva.page';
import { BorradorService } from '../../services/borrador';
import { IncidenciaService } from '../../services/incidencia';
import { ImagenService } from '../../services/imagen';
import { ClimaService } from '../../services/clima';
import { FotoService } from '../../services/foto';

const datos = {
  tipo: 'luminaria' as const,
  descripcion: 'Luz apagada',
  direccion: 'Av. Quito',
  sector: 'Norte',
  prioridad: 'media' as const,
};
describe('NuevaPage: requisitos del registro', () => {
  let component: NuevaPage;
  let fixture: ComponentFixture<NuevaPage>;
  let borrador: { leer: ReturnType<typeof vi.fn>; guardar: ReturnType<typeof vi.fn>; borrar: ReturnType<typeof vi.fn> };
  let api: { getByCodigo: ReturnType<typeof vi.fn>; crear: ReturnType<typeof vi.fn> };
  let clima: { consultar: ReturnType<typeof vi.fn> };
  let foto: { capturar: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    borrador = {
      leer: vi.fn().mockResolvedValue(null),
      guardar: vi.fn().mockResolvedValue(undefined),
      borrar: vi.fn().mockResolvedValue(undefined),
    };
    api = { getByCodigo: vi.fn(() => of(null)), crear: vi.fn((registro) => of({ ...registro, id: '100' })) };
    clima = {
      consultar: vi.fn(() => of({ temperatura: 12, precipitacion1h: 6, lluviaFuerte: true, descripcion: 'Lluvia' })),
    };
    foto = { capturar: vi.fn().mockResolvedValue({ ok: false, motivo: 'cancelado' }) };
    TestBed.configureTestingModule({
      providers: [
        { provide: BorradorService, useValue: borrador },
        { provide: IncidenciaService, useValue: api },
        { provide: ClimaService, useValue: clima },
        { provide: FotoService, useValue: foto },
        { provide: ImagenService, useValue: { subir: vi.fn(() => of('https://example.com/foto.jpg')) } },
      ],
    });
    fixture = TestBed.createComponent(NuevaPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('no envía campos vacíos o solo espacios', async () => {
    component.form.setValue({ ...datos, descripcion: '   ' });
    await component.guardar();
    expect(api.crear).not.toHaveBeenCalled();
  });
  it('impide guardar prioridad alta sin foto', async () => {
    component.form.setValue({ ...datos, prioridad: 'alta' });
    await component.guardar();
    expect(component.faltaFoto).toBe(true);
    expect(api.crear).not.toHaveBeenCalled();
  });
  it('exige coordenadas válidas para un bache', async () => {
    component.form.setValue({ ...datos, tipo: 'bache' });
    await component.guardar();
    expect(api.crear).not.toHaveBeenCalled();
    component.latTxt = '-0,18';
    component.lngTxt = '-78,46';
    component.usarManual();
    await component.guardar();
    expect(api.crear).toHaveBeenCalledWith(expect.objectContaining({ latitud: -0.18, longitud: -78.46 }));
  });
  it('consulta clima real por coordenadas antes de crear y no bloquea por lluvia', async () => {
    component.form.setValue(datos);
    component.coords = { latitud: -0.18, longitud: -78.46 };
    await component.guardar();
    expect(clima.consultar).toHaveBeenCalledWith(-0.18, -78.46);
    expect(clima.consultar.mock.invocationCallOrder[0]).toBeLessThan(api.crear.mock.invocationCallOrder[0]);
    expect(api.crear).toHaveBeenCalledTimes(1);
    expect(borrador.borrar).toHaveBeenCalled();
  });
  it('informa el fallo meteorológico y permite guardar', async () => {
    clima.consultar.mockReturnValue(throwError(() => new Error('SIN_DATOS')));
    component.form.setValue(datos);
    component.coords = { latitud: 0, longitud: 0 };
    await component.guardar();
    expect(api.crear).toHaveBeenCalledTimes(1);
    expect(clima.consultar).toHaveBeenCalled();
    expect(component.errorGuardado).toBe(false);
  });
  it('conserva formulario y foto anterior al cancelar la cámara', async () => {
    component.form.setValue(datos);
    component.foto = 'data:image/jpeg;base64,anterior';
    await component.tomarFoto();
    expect(component.form.getRawValue()).toEqual(datos);
    expect(component.foto).toContain('anterior');
    expect(borrador.guardar).toHaveBeenCalled();
  });
  it('recupera o descarta un borrador después de reiniciar', async () => {
    const guardado = {
      version: 1,
      codigo: 'INC-recuperada',
      datos,
      coords: { latitud: 0, longitud: 0 },
      foto: null,
      fotoUrl: '',
      latTxt: '0',
      lngTxt: '0',
    };
    component.borradorPendiente = guardado as never;
    component.continuarBorrador();
    expect(component.form.getRawValue()).toEqual(datos);
    expect(component.coords).toEqual({ latitud: 0, longitud: 0 });
    await component.descartarBorrador();
    expect(borrador.borrar).toHaveBeenCalled();
    expect(component.form.controls.descripcion.value).toBe('');
  });
  it('evita volver a crear un código ya registrado', async () => {
    api.getByCodigo.mockReturnValue(of({ ...datos, codigo: 'INC-existente', id: '9' }) as never);
    component.form.setValue(datos);
    await component.guardar();
    expect(api.crear).not.toHaveBeenCalled();
    expect(component.mensajeGuardado).toContain('duplicado');
  });
});
