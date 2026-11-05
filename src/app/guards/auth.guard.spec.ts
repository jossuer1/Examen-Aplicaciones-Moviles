import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';

import { AuthService } from '../services/auth';

import { authGuard, publicGuard } from './auth.guard';

describe('AuthGuard & PublicGuard', () => {
  let authService: AuthService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideRouter([]), AuthService],
    });

    authService = TestBed.inject(AuthService);
  });

  afterEach(async () => {
    await authService.logout();
  });

  it('authGuard should redirect to /login when user is not authenticated', async () => {
    authService.currentUser.set(null);
    authService.loading.set(false);

    const result = await TestBed.runInInjectionContext(() =>
      authGuard({} as any, {} as any)
    );

    expect(result).not.toBe(true);
    expect(result.toString()).toContain('/login');
  });

  it('authGuard should allow access when user is authenticated', async () => {
    authService.loginDemo();
    authService.loading.set(false);

    const result = await TestBed.runInInjectionContext(() =>
      authGuard({} as any, {} as any)
    );

    expect(result).toBe(true);
  });

  it('publicGuard should allow unauthenticated users to access login', async () => {
    authService.currentUser.set(null);
    authService.loading.set(false);

    const result = await TestBed.runInInjectionContext(() =>
      publicGuard({} as any, {} as any)
    );

    expect(result).toBe(true);
  });

  it('publicGuard should redirect authenticated users away from login to tabs', async () => {
    authService.loginDemo();
    authService.loading.set(false);

    const result = await TestBed.runInInjectionContext(() =>
      publicGuard({} as any, {} as any)
    );

    expect(result).not.toBe(true);
    expect(result.toString()).toContain('/tabs/inicio');
  });
});
