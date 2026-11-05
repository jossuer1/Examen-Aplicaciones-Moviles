import type { ComponentFixture} from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { AuthService } from '../../services/auth';

import { LoginPage } from './login.page';

describe('LoginPage', () => {
  let component: LoginPage;
  let fixture: ComponentFixture<LoginPage>;
  let authService: AuthService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoginPage],
      providers: [
        provideRouter([{ path: 'tabs/inicio', component: class {} }]),
        AuthService,
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(LoginPage);
    component = fixture.componentInstance;
    authService = TestBed.inject(AuthService);
    fixture.detectChanges();
  });

  afterEach(async () => {
    await authService.logout();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize in login mode with empty form', () => {
    expect(component.modo()).toBe('login');
    expect(component.form.get('email')?.value).toBe('');
    expect(component.form.get('password')?.value).toBe('');
  });

  it('should validate invalid emails', () => {
    component.form.patchValue({ email: 'correo-no-valido', password: '123' });
    expect(component.form.valid).toBe(false);
    expect(component.emailInvalido).toBe(false); // not touched yet
    component.form.get('email')?.markAsTouched();
    expect(component.emailInvalido).toBe(true);
  });

  it('should switch mode between login and registro', () => {
    component.cambiarModo('registro');
    expect(component.modo()).toBe('registro');
    expect(component.form.get('nombre')?.validator).toBeTruthy();

    component.cambiarModo('login');
    expect(component.modo()).toBe('login');
    expect(component.form.get('nombre')?.validator).toBeNull();
  });

  it('should toggle password visibility', () => {
    expect(component.mostrarPassword()).toBe(false);
    component.alternarVerPassword();
    expect(component.mostrarPassword()).toBe(true);
  });

  it('should enter demo mode when requested', async () => {
    await component.ingresarModoDemo();
    expect(authService.isAuthenticated()).toBe(true);
  });
});
