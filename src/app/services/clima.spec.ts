import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ClimaService } from './clima';

describe('Clima: valores reales y umbral de lluvia', () => {
  let service: ClimaService;
  let http: HttpTestingController;
  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    service = TestBed.inject(ClimaService);
    http = TestBed.inject(HttpTestingController);
  });
  afterEach(() => http.verify());
  for (const mm of [0, 5, 5.1]) {
    it(`advierte solo cuando la precipitación supera 5 mm: ${mm}`, () => {
      service.consultar(-0.18, -78.46).subscribe((c) => {
        expect(c.precipitacion1h).toBe(mm);
        expect(c.lluviaFuerte).toBe(mm > 5);
      });
      const req = http.expectOne((r) => r.url.includes('open-meteo.com'));
      expect(req.request.params.get('latitude')).toBe('-0.18');
      req.flush({
        current: { temperature_2m: 12, weather_code: 61, time: '2026-10-27T12:15' },
        hourly: { time: ['2026-10-27T11:00', '2026-10-27T12:00', '2026-10-27T13:00'], precipitation: [1, mm, 99] },
      });
    });
  }
  it('no sustituye datos faltantes por cero', () => {
    let fallo = false;
    service.consultar(0, 0).subscribe({
      error: () => {
        fallo = true;
      },
    });
    http
      .expectOne((r) => r.url.includes('open-meteo.com'))
      .flush({ current: { temperature_2m: 12, weather_code: 0 }, hourly: { time: [], precipitation: [] } });
    expect(fallo).toBe(true);
  });
});
