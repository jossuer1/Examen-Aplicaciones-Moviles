import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { IncidenciaService } from './incidencia';

describe('Incidencia', () => {
  let service: IncidenciaService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(IncidenciaService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
