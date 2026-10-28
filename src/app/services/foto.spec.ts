import { TestBed } from '@angular/core/testing';
import { FotoService } from './foto';

describe('Foto', () => {
  let service: FotoService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FotoService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
