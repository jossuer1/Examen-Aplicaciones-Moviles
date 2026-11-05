import { TestBed } from '@angular/core/testing';

import { AuthService } from './auth';

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AuthService],
    });
    service = TestBed.inject(AuthService);
  });

  it('should be created and have initial state', () => {
    expect(service).toBeTruthy();
    expect(typeof service.isAuthenticated).toBe('function');
  });

  it('loginDemo should set current user and authenticate', () => {
    const user = service.loginDemo('inspector@urbaninspect.gob.ec', 'Inspector Demo');
    expect(user.email).toBe('inspector@urbaninspect.gob.ec');
    expect(service.currentUser()?.email).toBe('inspector@urbaninspect.gob.ec');
    expect(service.isAuthenticated()).toBe(true);
  });

  it('logout should clear currentUser and authentication', async () => {
    service.loginDemo();
    expect(service.isAuthenticated()).toBe(true);
    await service.logout();
    expect(service.currentUser()).toBeNull();
    expect(service.isAuthenticated()).toBe(false);
  });

  it('formatFirebaseError should translate known error codes', () => {
    const errWrongPass = { code: 'auth/wrong-password' };
    expect(service.formatFirebaseError(errWrongPass)).toContain('Contraseña incorrecta');

    const errUserNotFound = { code: 'auth/user-not-found' };
    expect(service.formatFirebaseError(errUserNotFound)).toContain('No existe una cuenta');

    const errWeakPass = { code: 'auth/weak-password' };
    expect(service.formatFirebaseError(errWeakPass)).toContain('6 caracteres');
  });
});
