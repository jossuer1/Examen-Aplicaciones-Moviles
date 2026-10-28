import { HttpTestingController } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { IncidenciasPage } from './incidencias.page';

describe('IncidenciasPage', () => {
  let component: IncidenciasPage;
  let fixture: ComponentFixture<IncidenciasPage>;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()] });
    fixture = TestBed.createComponent(IncidenciasPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
  it('pide páginas remotas y deja de pedir al agotarse los registros', () => {
    const http = TestBed.inject(HttpTestingController);
    component.cargarSiguiente();
    const primera = http.expectOne((r) => r.params.get('page') === '1');
    expect(primera.request.params.get('limit')).toBe('8');
    primera.flush(Array.from({ length: 8 }, (_, i) => ({ id: String(i), codigo: `INC-${i}`, estado: 'pendiente' })));
    component.cargarSiguiente();
    http.expectOne((r) => r.params.get('page') === '2').flush([{ id: '9', codigo: 'INC-9', estado: 'pendiente' }]);
    expect(component.items.length).toBe(9);
    expect(component.hasMore).toBe(false);
    component.cargarSiguiente();
    http.expectNone((r) => r.params.has('page'));
    http.verify();
  });
});
