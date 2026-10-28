import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ImagenService } from './imagen';

describe('Imagen', () => {
  let service: ImagenService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(ImagenService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
