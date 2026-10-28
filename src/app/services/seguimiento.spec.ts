import { TestBed } from '@angular/core/testing';
import { SeguimientoService } from './seguimiento';

describe('Seguimiento', () => {
  let service: SeguimientoService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SeguimientoService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
  it('recupera marcas en otra instancia y permite desmarcar', async () => {
    await service.listo();
    const codigo = 'INC-TEST-PERSISTENCIA';
    if (service.esMarcada(codigo)) await service.alternar(codigo);
    await service.alternar(codigo);
    const reiniciado = new SeguimientoService();
    await reiniciado.listo();
    expect(reiniciado.esMarcada(codigo)).toBe(true);
    await reiniciado.alternar(codigo);
    expect(reiniciado.esMarcada(codigo)).toBe(false);
  });
});
