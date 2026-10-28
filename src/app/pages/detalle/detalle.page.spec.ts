import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpTestingController } from '@angular/common/http/testing';
import { DetallePage } from './detalle.page';

describe('DetallePage', () => {
  let component: DetallePage;
  let fixture: ComponentFixture<DetallePage>;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()] });
    fixture = TestBed.createComponent(DetallePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
  it('impide reabrir una resuelta y exige observación para resolver', async () => {
    const http = TestBed.inject(HttpTestingController);
    component.item = {
      id: '1',
      codigo: 'INC-1',
      tipo: 'luminaria',
      descripcion: 'Luz',
      direccion: 'Quito',
      sector: 'Norte',
      fecha: new Date().toISOString(),
      estado: 'resuelta',
      prioridad: 'media',
      fotoUrl: '',
      latitud: null,
      longitud: null,
      observacion: 'Reparada',
    };
    expect(component.puede('pendiente')).toBe(false);
    expect(component.puede('en_proceso')).toBe(false);
    await component.cambiar('pendiente');
    http.expectNone((r) => r.method === 'PUT');
    component.item.estado = 'pendiente';
    component.observacion = '  ';
    await component.cambiar('resuelta');
    expect(component.errorObservacion).toBe(true);
    http.expectNone((r) => r.method === 'PUT');
  });
});
