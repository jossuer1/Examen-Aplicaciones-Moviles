import { Injectable, computed, signal } from '@angular/core';
import type { FirebaseApp } from 'firebase/app';
import { initializeApp, getApps, getApp } from 'firebase/app';
import type {
  Auth,
  User} from 'firebase/auth';
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  updateProfile,
} from 'firebase/auth';

import { environment } from '../../environments/environment';

export interface UsuarioInfo {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL?: string | null;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private app: FirebaseApp;
  private auth: Auth;

  readonly currentUser = signal<UsuarioInfo | null>(null);
  readonly loading = signal<boolean>(true);
  readonly isAuthenticated = computed(() => !!this.currentUser());

  constructor() {
    this.app = getApps().length === 0 ? initializeApp(environment.firebase) : getApp();
    this.auth = getAuth(this.app);

    onAuthStateChanged(
      this.auth,
      (user: User | null) => {
        if (user) {
          this.currentUser.set({
            uid: user.uid,
            email: user.email,
            displayName: user.displayName || user.email?.split('@')[0] || 'Inspector',
            photoURL: user.photoURL,
          });
        } else {
          // Si no hay sesión en Firebase, comprobar si hay sesión demo guardada
          const demoUser = localStorage.getItem('urbaninspect_demo_user');
          if (demoUser) {
            try {
              this.currentUser.set(JSON.parse(demoUser));
            } catch {
              this.currentUser.set(null);
            }
          } else {
            this.currentUser.set(null);
          }
        }
        this.loading.set(false);
      },
      () => {
        this.loading.set(false);
      }
    );
  }

  /**
   * Inicia sesión con correo y contraseña en Firebase
   */
  async login(email: string, pass: string): Promise<UsuarioInfo> {
    const cred = await signInWithEmailAndPassword(this.auth, email.trim(), pass);
    const user = cred.user;
    const info: UsuarioInfo = {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName || user.email?.split('@')[0] || 'Inspector',
      photoURL: user.photoURL,
    };
    this.currentUser.set(info);
    localStorage.removeItem('urbaninspect_demo_user');
    return info;
  }

  /**
   * Registra una nueva cuenta en Firebase
   */
  async register(email: string, pass: string, nombre?: string): Promise<UsuarioInfo> {
    const cred = await createUserWithEmailAndPassword(this.auth, email.trim(), pass);
    const user = cred.user;

    if (nombre && nombre.trim()) {
      try {
        await updateProfile(user, { displayName: nombre.trim() });
      } catch {
        // Continuar aunque falle la asignación del display name
      }
    }

    const info: UsuarioInfo = {
      uid: user.uid,
      email: user.email,
      displayName: nombre?.trim() || user.displayName || user.email?.split('@')[0] || 'Inspector',
      photoURL: user.photoURL,
    };
    this.currentUser.set(info);
    localStorage.removeItem('urbaninspect_demo_user');
    return info;
  }

  /**
   * Envía correo de restablecimiento de contraseña
   */
  async resetPassword(email: string): Promise<void> {
    await sendPasswordResetEmail(this.auth, email.trim());
  }

  /**
   * Cierra la sesión activa
   */
  async logout(): Promise<void> {
    localStorage.removeItem('urbaninspect_demo_user');
    await signOut(this.auth);
    this.currentUser.set(null);
  }

  /**
   * Modo demostración para pruebas locales o evaluación sin proyecto activo en la consola de Firebase
   */
  loginDemo(email = 'inspector@urbaninspect.gob.ec', nombre = 'Inspector Quito'): UsuarioInfo {
    const info: UsuarioInfo = {
      uid: 'demo-' + Date.now(),
      email,
      displayName: nombre,
    };
    localStorage.setItem('urbaninspect_demo_user', JSON.stringify(info));
    this.currentUser.set(info);
    return info;
  }

  /**
   * Convierte códigos de error de Firebase a mensajes amigables en español
   */
  formatFirebaseError(err: unknown): string {
    const code = ((err as { code?: string })?.code || '').toLowerCase();
    const msg = ((err as Error)?.message || '').toLowerCase();

    if (code.includes('api-key') || msg.includes('api-key')) {
      return 'La API Key de Firebase no es válida o aún no se ha recargado. Si acabas de guardar las credenciales, reinicia el servidor (Ctrl+C y vuelve a ejecutar npm start).';
    }
    if (code.includes('invalid-credential') || code.includes('invalid_login_credentials')) {
      return 'Credenciales incorrectas. Verifica el correo y la contraseña ingresados.';
    }
    if (code.includes('user-not-found')) {
      return 'No existe una cuenta registrada con este correo electrónico.';
    }
    if (code.includes('wrong-password')) {
      return 'Contraseña incorrecta. Por favor vuelve a intentarlo.';
    }
    if (code.includes('email-already-in-use')) {
      return 'Ya existe una cuenta registrada con este correo electrónico.';
    }
    if (code.includes('weak-password')) {
      return 'La contraseña es muy débil. Debe tener al menos 6 caracteres.';
    }
    if (code.includes('invalid-email')) {
      return 'El formato del correo electrónico no es válido.';
    }
    if (code.includes('user-disabled')) {
      return 'Esta cuenta ha sido inhabilitada por un administrador.';
    }
    if (code.includes('too-many-requests')) {
      return 'Demasiados intentos fallidos. Por seguridad, inténtalo más tarde.';
    }
    if (code.includes('network-request-failed')) {
      return 'Error de conexión. Revisa tu acceso a internet.';
    }
    if (code.includes('operation-not-allowed')) {
      return 'El proveedor de Correo/Contraseña no está habilitado en Firebase Authentication (actívalo en Authentication > Sign-in method).';
    }
    return (err as Error)?.message || 'Ocurrió un error al procesar la solicitud.';
  }
}
